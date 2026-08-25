"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/actions/admin/auth";
import { isMelhorEnvioConfigured } from "@/lib/melhor-envio/client";
import {
  generateMelhorEnvioLabelForOrder,
  getMelhorEnvioLabelPdfUrlForOrder,
} from "@/lib/melhor-envio/label";

export async function generateMelhorEnvioLabel(orderId: string) {
  await requireAdmin();
  if (!isMelhorEnvioConfigured()) {
    return { error: "Configure MELHOR_ENVIO_TOKEN na Vercel" };
  }
  if (!orderId) return { error: "Pedido inválido" };

  try {
    const result = await generateMelhorEnvioLabelForOrder(orderId);
    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/pedidos/${orderId}`);
    return {
      success: true,
      labelUrl: result.labelUrl,
      trackingCode: result.trackingCode,
      melhorEnvioOrderId: result.melhorEnvioOrderId,
    };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao gerar etiqueta";
    revalidatePath("/admin/pedidos");
    revalidatePath(`/admin/pedidos/${orderId}`);
    return { error: message };
  }
}

export async function getMelhorEnvioLabelPdfUrl(orderId: string) {
  await requireAdmin();
  if (!isMelhorEnvioConfigured()) {
    return { error: "Configure MELHOR_ENVIO_TOKEN na Vercel" };
  }
  if (!orderId) return { error: "Pedido inválido" };

  try {
    const labelUrl = await getMelhorEnvioLabelPdfUrlForOrder(orderId);
    return { success: true, labelUrl };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao abrir etiqueta";
    return { error: message };
  }
}
