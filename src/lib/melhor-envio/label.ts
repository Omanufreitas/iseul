import { onlyDigits, validateCpfCnpjMessage } from "@/lib/br-document";
import { CONTACT_EMAIL } from "@/lib/site";
import { createAdminClient } from "@/lib/supabase/client";
import { getMelhorEnvioOriginPostalCode } from "@/lib/melhor-envio";
import { buildCartPayload, resolveMelhorEnvioServiceId } from "./build-cart";
import { isMelhorEnvioConfigured, melhorEnvioFetch, MelhorEnvioError } from "./client";
import type {
  MelhorEnvioCartResponse,
  MelhorEnvioCheckoutResponse,
  MelhorEnvioOrderDetails,
  ShipperSettings,
} from "./types";

const DEFAULT_SHIPPER: ShipperSettings = {
  name: "Iseul",
  document: "63829102000134",
  phone: "",
  email: CONTACT_EMAIL,
  street: "Rua Cacimba",
  number: "868",
  complement: "",
  neighborhood: "Jardim Canguru",
  city: "Campo Grande",
  state: "MS",
  zip: getMelhorEnvioOriginPostalCode(),
};

function parseMelhorEnvioPdfResponse(data: unknown): string | null {
  if (typeof data === "string") {
    const trimmed = data.trim();
    if (trimmed.startsWith("http")) return trimmed;
    try {
      return parseMelhorEnvioPdfResponse(JSON.parse(trimmed));
    } catch {
      return null;
    }
  }
  if (Array.isArray(data)) {
    const url = data.find((v) => typeof v === "string" && v.startsWith("http"));
    return typeof url === "string" ? url : null;
  }
  if (typeof data === "object" && data !== null) {
    if ("url" in data && typeof (data as { url: unknown }).url === "string") {
      return (data as { url: string }).url;
    }
    const url = Object.values(data).find((v) => typeof v === "string" && v.startsWith("http"));
    return typeof url === "string" ? url : null;
  }
  return null;
}

export async function fetchMelhorEnvioLabelPdfUrl(meOrderId: string): Promise<string> {
  const data = await melhorEnvioFetch<unknown>(`/me/imprimir/pdf/${meOrderId}`, {
    method: "GET",
  });
  const url = parseMelhorEnvioPdfResponse(data);
  if (!url) {
    throw new MelhorEnvioError("Melhor Envio não retornou URL do PDF da etiqueta");
  }
  return url;
}

function isLabelNotReadyYet(e: unknown): boolean {
  return (
    e instanceof MelhorEnvioError &&
    /precisa estar gerado|E-PRT-0011|E-PRT-0007|não processada/i.test(e.message)
  );
}

async function fetchLabelPdfUrlWithRetry(
  meOrderId: string,
  attempts = 4,
  delayMs = 1500
): Promise<string> {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      return await fetchMelhorEnvioLabelPdfUrl(meOrderId);
    } catch (e) {
      if (!isLabelNotReadyYet(e) || attempt === attempts) throw e;
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw new MelhorEnvioError("Etiqueta não ficou pronta a tempo, tente novamente em instantes");
}

export async function getMelhorEnvioLabelPdfUrlForOrder(orderId: string): Promise<string> {
  const admin = createAdminClient();
  const { data: order, error } = await admin
    .from("orders")
    .select("melhor_envio_order_id, melhor_envio_status")
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) throw new MelhorEnvioError("Pedido não encontrado");
  if (!order.melhor_envio_order_id) {
    throw new MelhorEnvioError("Etiqueta ainda não foi gerada para este pedido");
  }
  if (order.melhor_envio_status !== "generated") {
    throw new MelhorEnvioError("Etiqueta ainda não está pronta para impressão");
  }

  return fetchLabelPdfUrlWithRetry(order.melhor_envio_order_id);
}

function pickShipperField(value: unknown, fallback: string): string {
  const trimmed = String(value ?? "").trim();
  return trimmed || fallback;
}

function mapShipperFromRow(data: Record<string, unknown> | null): ShipperSettings {
  const d = data ?? {};
  return {
    name: pickShipperField(d.shipper_name, DEFAULT_SHIPPER.name),
    document: pickShipperField(d.shipper_document, DEFAULT_SHIPPER.document),
    phone: pickShipperField(d.shipper_phone, DEFAULT_SHIPPER.phone),
    email: pickShipperField(d.shipper_email, DEFAULT_SHIPPER.email),
    street: pickShipperField(d.shipper_street, DEFAULT_SHIPPER.street),
    number: pickShipperField(d.shipper_number, DEFAULT_SHIPPER.number),
    complement: pickShipperField(d.shipper_complement, DEFAULT_SHIPPER.complement),
    neighborhood: pickShipperField(d.shipper_neighborhood, DEFAULT_SHIPPER.neighborhood),
    city: pickShipperField(d.shipper_city, DEFAULT_SHIPPER.city),
    state: pickShipperField(d.shipper_state, DEFAULT_SHIPPER.state),
    zip: getMelhorEnvioOriginPostalCode(),
  };
}

function isValidMelhorEnvioServiceId(id: number): boolean {
  return Number.isFinite(id) && id > 0;
}

function shouldResetMelhorEnvioAttempt(status: string | null, error: string | null): boolean {
  if (status === "error") {
    return /service selecionado é inválido|service.*inválido/i.test(error ?? "");
  }
  return false;
}

function validateShipper(shipper: ShipperSettings): string | null {
  if (!shipper.name.trim()) return "Configure o nome do remetente em Admin → Configurações";
  const docError = validateCpfCnpjMessage(shipper.document);
  if (docError) return docError;
  if (shipper.zip.length < 8) return "Configure MELHOR_ENVIO_ORIGIN_POSTAL_CODE na Vercel";
  if (!shipper.street.trim() || !shipper.city.trim() || !shipper.state.trim()) {
    return "Complete o endereço do remetente em Admin → Configurações";
  }
  return null;
}

export type GenerateLabelResult = {
  labelUrl: string;
  trackingCode: string | null;
  melhorEnvioOrderId: string;
  status: "generated";
};

export async function generateMelhorEnvioLabelForOrder(orderId: string): Promise<GenerateLabelResult> {
  if (!isMelhorEnvioConfigured()) {
    throw new MelhorEnvioError("MELHOR_ENVIO_TOKEN não configurado");
  }

  const admin = createAdminClient();
  const { data: order, error } = await admin
    .from("orders")
    .select(
      `id, order_number, subtotal, shipping, shipping_method, shipping_service_id,
       shipping_address, customer_cpf, customer_phone, customer_email, customer_name,
       melhor_envio_cart_id, melhor_envio_order_id, melhor_envio_label_url, melhor_envio_status,
       melhor_envio_error,
       items:order_items(product_name, quantity, unit_price, variant_id)`
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) throw new MelhorEnvioError("Pedido não encontrado");

  if (shouldResetMelhorEnvioAttempt(order.melhor_envio_status, order.melhor_envio_error)) {
    await admin
      .from("orders")
      .update({
        melhor_envio_cart_id: null,
        melhor_envio_order_id: null,
        melhor_envio_status: null,
        melhor_envio_error: null,
      })
      .eq("id", orderId);
    order.melhor_envio_cart_id = null;
    order.melhor_envio_order_id = null;
    order.melhor_envio_status = null;
    order.melhor_envio_error = null;
  }

  if (order.melhor_envio_order_id && order.melhor_envio_status === "generated") {
    const labelUrl = await fetchLabelPdfUrlWithRetry(order.melhor_envio_order_id);
    if (labelUrl !== order.melhor_envio_label_url) {
      await admin.from("orders").update({ melhor_envio_label_url: labelUrl }).eq("id", orderId);
    }
    return {
      labelUrl,
      trackingCode: null,
      melhorEnvioOrderId: order.melhor_envio_order_id,
      status: "generated",
    };
  }

  const addr = (order.shipping_address ?? {}) as Record<string, string>;
  if (!addr.zip || !addr.street) {
    throw new MelhorEnvioError("Pedido sem endereço de entrega completo");
  }

  const { data: storeRow } = await admin.from("store_settings").select("*").eq("id", 1).maybeSingle();
  const shipper = mapShipperFromRow(storeRow as Record<string, unknown> | null);
  const shipperError = validateShipper(shipper);
  if (shipperError) throw new MelhorEnvioError(shipperError);

  const items = (order.items ?? []) as Array<{
    product_name: string;
    quantity: number;
    unit_price: number;
    variant_id: string | null;
  }>;

  const variantIds = items.map((i) => i.variant_id).filter(Boolean) as string[];
  const variantDims = new Map<
    string,
    { weight_grams: number; length_cm: number; width_cm: number; height_cm: number }
  >();

  if (variantIds.length) {
    const { data: variants } = await admin
      .from("product_variants")
      .select("id, weight_grams, length_cm, width_cm, height_cm")
      .in("id", variantIds);
    for (const v of variants ?? []) {
      variantDims.set(v.id, {
        weight_grams: v.weight_grams ?? 250,
        length_cm: v.length_cm ?? 15,
        width_cm: v.width_cm ?? 8,
        height_cm: v.height_cm ?? 8,
      });
    }
  }

  const shippingLabel =
    order.shipping_method ??
    [addr.shipping_carrier, addr.shipping_service].filter(Boolean).join(" ");

  const serviceId = await resolveMelhorEnvioServiceId({
    storedServiceId: order.shipping_service_id,
    addressOptionId: addr.shipping_option_id ?? addr.shipping_service_id,
    shippingMethod: shippingLabel,
    originZip: shipper.zip,
    destinationZip: addr.zip,
    items,
    variantDims,
    shippingPrice: Number(order.shipping ?? 0),
  });

  if (!serviceId) {
    throw new MelhorEnvioError("Não foi possível identificar o serviço de frete deste pedido.");
  }

  if (String(order.shipping_service_id) !== String(serviceId)) {
    await admin.from("orders").update({ shipping_service_id: String(serviceId) }).eq("id", orderId);
  }

  const recipientDoc =
    onlyDigits(addr.cpf ?? "") ||
    onlyDigits(order.customer_cpf ?? "") ||
    "";

  if (recipientDoc.length !== 11 && recipientDoc.length !== 14) {
    throw new MelhorEnvioError("CPF ou CNPJ do destinatário ausente no pedido");
  }

  const cartPayload = buildCartPayload({
    serviceId,
    shipper,
    recipient: {
      name: addr.full_name ?? order.customer_name ?? "Cliente",
      phone: addr.phone ?? order.customer_phone ?? "",
      email: addr.email ?? order.customer_email ?? CONTACT_EMAIL,
      document: recipientDoc,
      street: addr.street,
      number: addr.number ?? "S/N",
      complement: addr.complement ?? "",
      neighborhood: addr.neighborhood ?? "",
      city: addr.city ?? "",
      state: addr.state ?? "",
      zip: addr.zip,
    },
    items,
    variantDims,
    insuranceValue: Number(order.subtotal ?? 0),
  });

  let meOrderId = order.melhor_envio_order_id as string | null;

  try {
    if (!meOrderId) {
      let cartId = order.melhor_envio_cart_id as string | null;

      if (!cartId) {
        const cart = await melhorEnvioFetch<MelhorEnvioCartResponse>("/me/cart", {
          method: "POST",
          json: cartPayload,
        });
        cartId = cart.id;
        await admin
          .from("orders")
          .update({
            melhor_envio_cart_id: cartId,
            melhor_envio_status: "in_cart",
            melhor_envio_error: null,
          })
          .eq("id", orderId);
      }

      const checkout = await melhorEnvioFetch<MelhorEnvioCheckoutResponse>("/me/shipment/checkout", {
        method: "POST",
        json: { orders: [cartId] },
      });

      meOrderId = checkout.purchase?.orders?.[0]?.id ?? null;
      if (!meOrderId) {
        throw new MelhorEnvioError("Melhor Envio não retornou ID do envio após checkout");
      }

      await admin
        .from("orders")
        .update({
          melhor_envio_order_id: meOrderId,
          melhor_envio_status: "paid",
          melhor_envio_error: null,
        })
        .eq("id", orderId);
    }

    await melhorEnvioFetch("/me/shipment/generate", {
      method: "POST",
      json: { orders: [meOrderId] },
    });

    let trackingCode: string | null = null;
    try {
      const details = await melhorEnvioFetch<MelhorEnvioOrderDetails>(`/me/orders/${meOrderId}`);
      trackingCode = details.tracking ?? details.protocol ?? null;
    } catch {
      /* rastreio pode vir depois */
    }

    const labelUrl = await fetchLabelPdfUrlWithRetry(meOrderId);

    await admin
      .from("orders")
      .update({
        melhor_envio_label_url: labelUrl,
        melhor_envio_status: "generated",
        melhor_envio_error: null,
        tracking_code: trackingCode,
      })
      .eq("id", orderId);

    return {
      labelUrl,
      trackingCode,
      melhorEnvioOrderId: meOrderId,
      status: "generated",
    };
  } catch (e) {
    const message = e instanceof MelhorEnvioError ? e.message : "Erro ao gerar etiqueta";
    const isDocumentError =
      /from\.(document|company_document)|to\.(document|company_document)|cpf|cnpj|documento/i.test(
        message
      );

    const friendlyMessage = isDocumentError
      ? "Documento do remetente inválido. Configure o CNPJ da loja em Admin → Configurações."
      : message;

    const updates: Record<string, unknown> = {
      melhor_envio_status: "error",
      melhor_envio_error: friendlyMessage,
    };
    if (isDocumentError) {
      updates.melhor_envio_cart_id = null;
      updates.melhor_envio_order_id = null;
    }

    await admin.from("orders").update(updates).eq("id", orderId);
    throw e instanceof MelhorEnvioError ? new MelhorEnvioError(friendlyMessage) : new MelhorEnvioError(message);
  }
}
