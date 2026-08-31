import type { Coupon } from "@/types";

export function mapDbCoupon(row: Record<string, unknown>): Coupon {
  return {
    id: String(row.id),
    code: String(row.code),
    name: String(row.name),
    discount_percent: Number(row.discount_percent),
    active: Boolean(row.active),
    valid_from: row.valid_from ? String(row.valid_from) : null,
    valid_until: row.valid_until ? String(row.valid_until) : null,
    max_uses: row.max_uses != null ? Number(row.max_uses) : null,
    used_count: Number(row.used_count ?? 0),
    first_purchase_only: Boolean(row.first_purchase_only),
    created_at: row.created_at ? String(row.created_at) : undefined,
  };
}

export function normalizeCouponCode(code: string) {
  return code.trim().toUpperCase();
}

export function isCouponValidNow(coupon: Coupon, now = new Date()) {
  if (!coupon.active) return false;
  if (coupon.valid_from && new Date(coupon.valid_from) > now) return false;
  if (coupon.valid_until && new Date(coupon.valid_until) < now) return false;
  if (coupon.max_uses != null && coupon.used_count >= coupon.max_uses) return false;
  return true;
}

export function couponDiscountAmount(subtotal: number, discountPercent: number) {
  const raw = (subtotal * discountPercent) / 100;
  return Math.round(raw * 100) / 100;
}
