"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/actions/admin/auth";
import { createAdminClient } from "@/lib/supabase/client";
import {
  couponDiscountAmount,
  isCouponValidNow,
  mapDbCoupon,
  normalizeCouponCode,
} from "@/lib/coupons";
import { isMockCatalogEnabled, isSupabaseConfigured } from "@/lib/config";
import { couponFormSchema } from "@/lib/validations";
import type { Coupon } from "@/types";

export async function listCouponsAdmin(): Promise<Coupon[]> {
  await requireAdmin();
  if (isMockCatalogEnabled() || !isSupabaseConfigured()) return [];

  const admin = createAdminClient();
  const { data } = await admin.from("coupons").select("*").order("created_at", { ascending: false });
  return (data ?? []).map((row) => mapDbCoupon(row));
}

export async function saveCoupon(raw: unknown) {
  await requireAdmin();
  if (isMockCatalogEnabled() || !isSupabaseConfigured()) {
    return { error: "Cupons disponíveis apenas com Supabase." };
  }

  const parsed = couponFormSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos" };
  }

  const admin = createAdminClient();
  const payload = {
    code: normalizeCouponCode(parsed.data.code),
    name: parsed.data.name.trim(),
    discount_percent: parsed.data.discount_percent,
    active: parsed.data.active,
    max_uses: parsed.data.max_uses ?? null,
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.id) {
    const { error } = await admin.from("coupons").update(payload).eq("id", parsed.data.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await admin.from("coupons").insert(payload);
    if (error) return { error: error.message };
  }

  revalidatePath("/admin/config");
  return { success: true };
}

export async function deleteCoupon(id: string) {
  await requireAdmin();
  if (isMockCatalogEnabled() || !isSupabaseConfigured()) {
    return { error: "Cupons disponíveis apenas com Supabase." };
  }

  const admin = createAdminClient();
  const { error } = await admin.from("coupons").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidatePath("/admin/config");
  return { success: true };
}

export async function validateCouponCode(code: string, subtotal: number) {
  if (isMockCatalogEnabled() || !isSupabaseConfigured()) {
    return { error: "Cupons indisponíveis no momento." };
  }

  const normalized = normalizeCouponCode(code);
  if (!normalized) return { error: "Informe um cupom válido." };

  const admin = createAdminClient();
  const { data } = await admin.from("coupons").select("*").eq("code", normalized).maybeSingle();
  if (!data) return { error: "Cupom não encontrado." };

  const coupon = mapDbCoupon(data);
  if (!isCouponValidNow(coupon)) return { error: "Cupom expirado ou indisponível." };

  const discount = couponDiscountAmount(subtotal, coupon.discount_percent);
  return {
    success: true,
    code: coupon.code,
    name: coupon.name,
    discount_percent: coupon.discount_percent,
    discount,
  };
}
