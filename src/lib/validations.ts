import { z } from "zod";

export const checkoutAddressSchema = z.object({
  full_name: z.string().min(3, "Informe o nome completo"),
  email: z.string().email("E-mail inválido"),
  cpf: z.string().min(11, "CPF inválido"),
  phone: z.string().min(10, "Telefone inválido"),
  zip: z.string().min(8, "CEP inválido"),
  street: z.string().min(2, "Informe a rua"),
  number: z.string().min(1, "Informe o número"),
  complement: z.string().optional(),
  neighborhood: z.string().min(2, "Informe o bairro"),
  city: z.string().min(2, "Informe a cidade"),
  state: z.string().length(2, "UF inválida"),
});

export const createCheckoutSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      })
    )
    .min(1, "Sacola vazia"),
  address: checkoutAddressSchema,
  shipping_price: z.number().min(0),
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
  image_fallback_url: z.string().optional(),
  shopee_url: z.string().optional(),
  shopee_id: z.number().nullable().optional(),
  sold_count: z.number().int().min(0).optional(),
  rating: z.number().min(0).max(5).optional(),
  review_count: z.number().int().min(0).optional(),
  stock: z.number().int().min(0),
  active: z.boolean(),
  featured: z.boolean().optional(),
});
