"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/actions/admin/auth";
import { createAdminClient } from "@/lib/supabase/client";
import { isMockCatalogEnabled } from "@/lib/config";
import { syncOrderByReference, confirmOrderPaymentManually } from "@/lib/orders/fulfill";
import { sendOrderConfirmedEmail, sendOrderShippedEmail } from "@/lib/email/order-emails";
import type { OrderStatus } from "@/types";

export async function updateOrderFulfillment(
  orderId: string,
  input: {
    status: OrderStatus;
    tracking_code?: string | null;
    notes?: string | null;
  }
) {
  await requireAdmin();
  if (isMockCatalogEnabled()) return { error: "Pedidos disponíveis apenas com Supabase." };

  const admin = createAdminClient();
  const { data: current } = await admin.from("orders").select("status").eq("id", orderId).maybeSingle();

  const updates: Record<string, string | null> = {
    status: input.status,
    tracking_code: input.tracking_code?.trim() || null,
    notes: input.notes?.trim() || null,
  };
  if (input.status === "cancelado") {
    updates.payment_status = "cancelado";
  }

  const { error } = await admin.from("orders").update(updates).eq("id", orderId);

  if (error) return { error: error.message };

  if (input.status === "enviado" && current?.status !== "enviado") {
    try {
      await sendOrderShippedEmail(orderId);
    } catch (e) {
      console.error("[email:enviado]", e);
    }
  }

  if (input.status === "cancelado") {
    await admin.from("stock_reservations").delete().eq("order_id", orderId);
  }

  revalidatePath("/admin/pedidos");
  revalidatePath(`/admin/pedidos/${orderId}`);
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteOrder(orderId: string) {
  await requireAdmin();
  if (isMockCatalogEnabled()) return { error: "Pedidos disponíveis apenas com Supabase." };

  const admin = createAdminClient();
  const { data: order } = await admin
    .from("orders")
    .select("id, order_number, payment_status, customer_name")
    .eq("id", orderId)
    .maybeSingle();

  if (!order) return { error: "Pedido não encontrado." };
  if (order.payment_status === "aprovado") {
    return { error: "Pedidos pagos não podem ser excluídos. Altere o status ou cancele no Bling se necessário." };
  }

  await admin.from("stock_reservations").delete().eq("order_id", orderId);

  const { error } = await admin.from("orders").delete().eq("id", orderId);
  if (error) return { error: error.message };

  revalidatePath("/admin/pedidos");
  return { success: true };
}

export async function syncOrderPaymentAdmin(orderId: string) {
  await requireAdmin();
  if (isMockCatalogEnabled()) return { error: "Pedidos disponíveis apenas com Supabase." };

  try {
    const result = await syncOrderByReference(orderId);
    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/pedidos/${orderId}`);
    if (result.paid) {
      return { success: true, message: "Pagamento confirmado no Asaas." };
    }
    return {
      error:
        "Nenhum pagamento confirmado encontrado no Asaas para este pedido. Verifique o painel Asaas ou confirme manualmente.",
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao consultar Asaas" };
  }
}

export async function confirmOrderPaymentManuallyAdmin(orderId: string) {
  await requireAdmin();
  if (isMockCatalogEnabled()) return { error: "Pedidos disponíveis apenas com Supabase." };

  try {
    const result = await confirmOrderPaymentManually(orderId);
    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/pedidos/${orderId}`);
    revalidatePath("/admin");

    if (!result.ok) {
      return { error: result.error };
    }

    if (result.source === "asaas") {
      return { success: true, message: "Pagamento encontrado e confirmado no Asaas." };
    }
    if (result.source === "already_paid") {
      return { success: true, message: "Pedido já estava pago." };
    }
    return {
      success: true,
      message: "Pagamento confirmado manualmente. Estoque atualizado e pedido enviado ao Bling.",
    };
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Erro ao confirmar pagamento" };
  }
}

export async function resendOrderEmailAdmin(orderId: string, kind: "confirmado" | "enviado") {
  await requireAdmin();
  if (isMockCatalogEnabled()) return { error: "Pedidos disponíveis apenas com Supabase." };

  const result =
    kind === "confirmado"
      ? await sendOrderConfirmedEmail(orderId, { force: true })
      : await sendOrderShippedEmail(orderId, { force: true });

  if (!result.ok) {
    return { error: result.error || "Não foi possível enviar o e-mail." };
  }

  revalidatePath(`/admin/pedidos/${orderId}`);
  return {
    success: true,
    message: kind === "confirmado" ? "E-mail de pedido confirmado enviado." : "E-mail de pedido enviado disparado.",
  };
}
