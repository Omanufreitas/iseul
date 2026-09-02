import { z } from "zod";
import { normalizePostalCode } from "@/lib/melhor-envio";

export const checkoutAddressSchema = z.object({
  full_name: z.string().min(3, "Informe o nome completo"),
  email: z.string().email("E-mail inválido"),
  cpf: z.string().min(11, "CPF inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  zip: z
    .string()
    .refine((value) => normalizePostalCode(value).length === 8, "CEP inválido"),
  street: z.string().min(2, "Informe a rua"),
  number: z.string().min(1, "Informe o número"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Informe o bairro"),
  city: z.string().min(2, "Informe a cidade"),
  state: z.string().length(2, "UF inválida"),
  city_ibge: z.coerce
    .number()
    .int()
    .positive("CEP não encontrado. Verifique o CEP informado."),
  marketing_opt_in: z.boolean().optional().default(false),
});

export const createCheckoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().optional().nullable(),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1, "Sacola vazia"),
  address: checkoutAddressSchema,
  shipping_option_id: z.number().int(),
  shipping_price: z.number().min(0),
  coupon_code: z.string().optional(),
  payment_method: z.enum(["pix", "credit_card"]),
});

export const productVariantSchema = z.object({
  id: z.string().optional(),
  label: z.string().min(1, "Informe o nome da variação"),
  sku: z.string().optional(),
  price: z.number().min(0),
  compare_at_price: z.number().nullable().optional(),
  stock: z.number().int().min(0),
  image_url: z.string().url().optional().or(z.literal("")).nullable(),
  active: z.boolean(),
});

export const couponFormSchema = z.object({
  id: z.string().optional(),
  code: z.string().trim().min(2, "Informe o código"),
  name: z.string().trim().min(2, "Informe o nome"),
  discount_percent: z.number().min(1).max(100),
  active: z.boolean(),
  max_uses: z.number().int().min(1).nullable().optional(),
  first_purchase_only: z.boolean().optional().default(false),
});

export const waitlistEmailSchema = z.object({
  email: z.string().trim().email("E-mail inválido"),
});

export const productFormSchema = z.object({
  name: z.string().min(2),
  full_name: z.string().optional(),
  slug: z.string().optional(),
  sku: z.string().trim().min(1, "Informe o SKU"),
  ncm: z
    .string()
    .trim()
    .min(1, "Informe o NCM")
    .refine((v) => v.replace(/\D/g, "").length === 8, "NCM deve ter 8 dígitos"),
  tax_origin: z.number().int().min(0).max(8),
  unit: z.string().trim().min(1, "Informe a unidade"),
  brand: z.string().optional(),
  category_slug: z.string().min(1),
  category_label: z.string().min(1),
  price: z.number().min(0),
  compare_at_price: z.number().nullable().optional(),
  pitch: z.string().optional(),
  image_url: z.string().url().optional().or(z.literal("")).nullable(),
  image_urls: z
    .array(z.string().url())
    .min(1, "Adicione ao menos uma foto do produto")
    .optional(),
  image_fallback_url: z.string().optional(),
  shopee_url: z.string().optional(),
  shopee_id: z.number().nullable().optional(),
  sold_count: z.number().int().min(0).optional(),
  rating: z.number().min(0).max(5).optional(),
  review_count: z.number().int().min(0).optional(),
  stock: z.number().int().min(0),
  active: z.boolean(),
  featured: z.boolean().optional(),
  variants: z.array(productVariantSchema).optional(),
});
