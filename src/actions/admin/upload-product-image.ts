"use server";

import { randomUUID } from "crypto";
import { requireAdmin } from "@/actions/admin/auth";
import { createAdminClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/config";
import {
  PRODUCT_IMAGE_ACCEPT,
  PRODUCT_IMAGE_MAX_BYTES,
} from "@/lib/product-image";

const ALLOWED = new Set(PRODUCT_IMAGE_ACCEPT.split(","));

function mimeFromFile(file: File): string | null {
  if (file.type && ALLOWED.has(file.type)) return file.type;
  const name = file.name.toLowerCase();
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".jpg") || name.endsWith(".jpeg")) return "image/jpeg";
  return file.type || null;
}

function extensionForMime(mime: string): string {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  return "jpg";
}

export async function uploadProductImage(formData: FormData) {
  await requireAdmin();

  if (!isSupabaseConfigured()) {
    return { error: "Upload disponível apenas com Supabase configurado." };
  }

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Selecione uma imagem do computador." };
  }

  const mime = mimeFromFile(file);
  if (!mime || !ALLOWED.has(mime)) {
    return {
      error:
        "Formato inválido. Use JPG, PNG ou WebP (fotos do iPhone em HEIC precisam ser convertidas).",
    };
  }

  if (file.size > PRODUCT_IMAGE_MAX_BYTES) {
    return { error: "Imagem muito grande. Máximo 2 MB." };
  }

  const ext = extensionForMime(mime);
  const path = `products/${randomUUID()}.${ext}`;
  const bytes = Buffer.from(await file.arrayBuffer());

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Storage não configurado no servidor (SUPABASE_SERVICE_ROLE_KEY)." };
  }

  const { error } = await admin.storage.from("product-images").upload(path, bytes, {
    contentType: mime,
    cacheControl: "31536000",
    upsert: false,
  });

  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("bucket") || msg.includes("not found")) {
      return {
        error:
          "Bucket product-images não existe no Supabase. Rode a migration 20260823150000_product_images_storage.sql.",
      };
    }
    return { error: error.message };
  }

  const { data } = admin.storage.from("product-images").getPublicUrl(path);
  return { url: data.publicUrl };
}
