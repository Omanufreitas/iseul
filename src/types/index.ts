export type Product = {
  id: string;
  shopee_id: number | null;
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
  image_fallback_url: string | null;
  shopee_url: string | null;
  sold_count: number;
  rating: number;
  review_count: number;
  stock: number;
  active: boolean;
  featured: boolean;
  sort_order: number;
  created_at?: string;
  updated_at?: string;
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

export type PaymentStatus = "pendente" | "aprovado" | "recusado" | "reembolsado";

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
  subtotal: number;
  shipping: number;
  discount: number;
  total: number;
  shipping_address: Record<string, string> | null;
  customer_email: string;
  customer_name: string;
  customer_phone: string | null;
  customer_cpf: string | null;
  ordered_at: string;
  paid_at: string | null;
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
  slug: string;
  name: string;
  brand: string;
  price: number;
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
