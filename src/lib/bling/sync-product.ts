import { createAdminClient } from "@/lib/supabase/client";
import { blingFetch, isBlingConfigured } from "@/lib/bling/client";
import { normalizeNcm } from "@/lib/bling/product-fiscal";
import { expandSkuCandidates, findBlingProductId } from "@/lib/bling/resolve-entities";

type DbProduct = {
  id: string;
  name: string;
  full_name: string;
  slug: string;
  sku: string | null;
  price: number;
  stock: number;
  active: boolean;
  ncm: string | null;
  tax_origin: number;
  unit: string;
  bling_product_id: string | null;
};

function buildBlingProductBody(product: DbProduct, codigo: string) {
  const ncm = normalizeNcm(product.ncm);
  if (!ncm) {
    throw new Error("NCM inválido — informe 8 dígitos.");
  }

  return {
    nome: product.full_name?.trim() || product.name,
    codigo,
    preco: Number(product.price),
    tipo: "P",
    formato: "S",
    situacao: product.active ? "A" : "I",
    unidade: product.unit?.trim() || "UN",
    tributacao: {
      ncm,
      origem: Number(product.tax_origin ?? 1),
    },
  };
}

async function persistBlingSyncResult(
  productId: string,
  result:
    | { ok: true; blingProductId: string }
    | { ok: false; error: string },
) {
  const admin = createAdminClient();
  if (result.ok) {
    await admin
      .from("products")
      .update({
        bling_product_id: result.blingProductId,
        bling_sync_status: "synced",
        bling_sync_error: null,
      })
      .eq("id", productId);
    return;
  }

  await admin
    .from("products")
    .update({
      bling_sync_status: "error",
      bling_sync_error: result.error,
    })
    .eq("id", productId);
}

/** Cria ou atualiza produto no Bling a partir do cadastro Iseul. */
export async function syncProductToBling(productId: string): Promise<{ ok: boolean; error?: string }> {
  if (!isBlingConfigured()) {
    return { ok: true };
  }

  const admin = createAdminClient();
  const { data: product, error } = await admin
    .from("products")
    .select(
      "id, name, full_name, slug, sku, price, stock, active, ncm, tax_origin, unit, bling_product_id",
    )
    .eq("id", productId)
    .maybeSingle();

  if (error || !product) {
    return { ok: false, error: "Produto não encontrado." };
  }

  const codigo = (product.sku?.trim() || product.slug?.trim() || "").toUpperCase();
  if (!codigo) {
    const message = "Informe SKU ou slug para sincronizar com o Bling.";
    await persistBlingSyncResult(productId, { ok: false, error: message });
    return { ok: false, error: message };
  }

  if (!normalizeNcm(product.ncm)) {
    const message = "NCM obrigatório (8 dígitos) para sincronizar com o Bling.";
    await persistBlingSyncResult(productId, { ok: false, error: message });
    return { ok: false, error: message };
  }

  await admin
    .from("products")
    .update({ bling_sync_status: "pending", bling_sync_error: null })
    .eq("id", productId);

  try {
    const body = buildBlingProductBody(product as DbProduct, codigo);
    let blingId = product.bling_product_id ? Number(product.bling_product_id) : null;

    if (!blingId) {
      const candidates = expandSkuCandidates(codigo);
      blingId = candidates.length ? await findBlingProductId(candidates) : null;
    }

    const result = blingId
      ? await blingFetch<{ data?: { id?: number } }>(`/produtos/${blingId}`, {
          method: "PUT",
          body: JSON.stringify(body),
        })
      : await blingFetch<{ data?: { id?: number } }>("/produtos", {
          method: "POST",
          body: JSON.stringify(body),
        });

    if (!result.ok) {
      await persistBlingSyncResult(productId, { ok: false, error: result.error });
      return { ok: false, error: result.error };
    }

    const savedId = result.data.data?.id ?? blingId;
    if (!savedId) {
      const message = "Bling não retornou ID do produto.";
      await persistBlingSyncResult(productId, { ok: false, error: message });
      return { ok: false, error: message };
    }

    await persistBlingSyncResult(productId, {
      ok: true,
      blingProductId: String(savedId),
    });

    if (!product.sku?.trim()) {
      await admin.from("products").update({ sku: codigo }).eq("id", productId);
    }

    return { ok: true };
  } catch (e) {
    const message = e instanceof Error ? e.message : "Erro ao sincronizar produto com Bling";
    await persistBlingSyncResult(productId, { ok: false, error: message });
    return { ok: false, error: message };
  }
}
