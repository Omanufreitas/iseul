export type ProductVariant = {
  id: string;
  product_id: string;
  label: string;
  sku: string | null;
  price: number;
  compare_at_price: number | null;
  stock: number;
  image_url: string | null;
  sort_order: number;
  active: boolean;
};

export type Coupon = {
  id: string;
  code: string;
  name: string;
  discount_percent: number;
  active: boolean;
  valid_from: string | null;
  valid_until: string | null;
  max_uses: number | null;
  used_count: number;
  first_purchase_only: boolean;
  created_at?: string;
};

export type Product = {
  id: string;
  shopee_id: number | null;
  sku: string | null;
  ncm: string | null;
  tax_origin: number;
  unit: string;
  bling_product_id: string | null;
  bling_sync_status: string | null;
  bling_sync_error: string | null;
  slug: string;
  name: string;
  full_name: string;
  brand: string;
  category_slug: string;
  category_label: string;
  price: number;
  compare_at_price: number | null;
  pitch: string;
  image_url: string;
  image_urls: string[];
  image_fallback_url: string | null;
  shopee_url: string | null;
  sold_count: number;
  rating: number;
  review_count: number;
  stock: number;
  active: boolean;
  featured: boolean;
  sort_order: number;
  skin_types: string[];
  created_at?: string;
  updated_at?: string;
  variants?: ProductVariant[];
  has_variants?: boolean;
};

export type StoreSettings = {
  id: number;
  store_name: string;
  tagline: string;
  announcement: string;
  free_shipping_threshold: number;
  pix_discount_percent: number;
  trust_rating: number;
  trust_rating_label: string;
};

export type OrderStatus =
  | "aguardando_pagamento"
  | "pago"
  | "separando"
  | "enviado"
  | "entregue"
  | "cancelado";

export type PaymentStatus = "pendente" | "aprovado" | "recusado" | "reembolsado" | "cancelado";

export type Order = {
  id: string;
  order_number: number;
  customer_id: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  payment_method: string;
  mercadopago_payment_id: string | null;
  asaas_payment_id: string | null;
  asaas_checkout_id: string | null;
  bling_order_id: string | null;
  bling_sync_status: string | null;
  bling_sync_error: string | null;
  nfe_number: string | null;
  nfe_key: string | null;
  nfe_url: string | null;
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  coupon_code: string | null;
  shipping_method: string | null;
  shipping_service_id: string | null;
  tracking_code: string | null;
  notes: string | null;
  melhor_envio_cart_id: string | null;
  melhor_envio_order_id: string | null;
  melhor_envio_label_url: string | null;
  melhor_envio_status: string | null;
  melhor_envio_error: string | null;
  shipping_address: Record<string, string> | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string | null;
  customer_cpf: string | null;
  ordered_at: string;
  paid_at: string | null;
  confirmation_email_sent_at?: string | null;
  shipped_email_sent_at?: string | null;
};

export type OrderItem = {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  product_brand: string | null;
  quantity: number;
  unit_price: number;
  line_total: number;
};

export type CartItem = {
  productId: string;
  variantId?: string | null;
  variantLabel?: string | null;
  slug: string;
  name: string;
  brand: string;
  price: number;
  /** Preço cheio (cartão) — compare_at_price no catálogo. */
  listPrice?: number;
  image_url: string;
  image_fallback_url: string | null;
  quantity: number;
};

export type SeedProduct = {
  id: number;
  name: string;
  full: string;
  brand: string;
  cat: string;
  catLabel: string;
  price: number;
  before: number;
  sold: number;
  rating: number;
  rcount: number;
  img: string;
  fallback: string;
  shopee: string;
  pitch: string;
};
