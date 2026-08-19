import Link from "next/link";
import { formatCurrency } from "@/lib/utils";
import type { Product, StoreSettings } from "@/types";

const TRUST_ITEMS = [
  { label: "Produto original importado", tone: "bg-iseul-dew/70 text-iseul-accent" },
  { label: "Estoque no Brasil", tone: "bg-iseul-paper2 text-iseul-ink" },
  { label: "Envio em até 24h", tone: "bg-iseul-dew/70 text-iseul-accent" },
  { label: "Embalagem lacrada", tone: "bg-iseul-paper2 text-iseul-ink" },
] as const;

type Props = {
  product: Product;
  settings: StoreSettings;
};

export function ProductDetailInfo({ product, settings }: Props) {
  const inStock = product.stock > 0;
  const stockLabel =
    product.stock > 10 ? "Em estoque" : product.stock > 0 ? `Restam ${product.stock} unidades` : "Esgotado";

  return (
    <div className="mt-8 space-y-5">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
        {TRUST_ITEMS.map((item) => (
          <div
            key={item.label}
            className={`rounded-iseul px-3 py-3 text-center text-[11px] font-medium leading-snug ${item.tone}`}
          >
            {item.label}
          </div>
        ))}
      </div>

      <div className="overflow-hidden rounded-iseul border border-iseul-line bg-iseul-paper2 shadow-card">
        <div className="border-b border-iseul-line/80 bg-iseul-dew/40 px-5 py-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-iseul-accent">
            Sobre o produto
          </h2>
        </div>
        <p className="px-5 py-4 text-[15px] leading-relaxed text-iseul-muted">{product.full_name}</p>
      </div>

      <div className="overflow-hidden rounded-iseul border border-iseul-line bg-iseul-card shadow-card">
        <div className="border-b border-iseul-line/80 bg-white px-5 py-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-iseul-muted">
            Detalhes
          </h2>
        </div>
        <dl className="divide-y divide-iseul-line/70 px-5 text-sm">
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-iseul-muted">Marca</dt>
            <dd className="font-medium text-iseul-ink">{product.brand}</dd>
          </div>
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-iseul-muted">Categoria</dt>
            <dd>
              <Link
                href="/#catalogo"
                className="font-medium text-iseul-accent hover:text-iseul-ink"
              >
                {product.category_label}
              </Link>
            </dd>
          </div>
          <div className="flex justify-between gap-4 py-3">
            <dt className="text-iseul-muted">Disponibilidade</dt>
            <dd className={inStock ? "font-semibold text-iseul-accent" : "font-semibold text-iseul-sale"}>
              {stockLabel}
            </dd>
          </div>
          {product.rating > 0 && (
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-iseul-muted">Avaliações</dt>
              <dd className="font-medium text-iseul-ink">
                {product.rating.toFixed(1)} de 5 ({product.review_count}{" "}
                {product.review_count === 1 ? "avaliação" : "avaliações"})
              </dd>
            </div>
          )}
          {product.sold_count > 0 && (
            <div className="flex justify-between gap-4 py-3">
              <dt className="text-iseul-muted">Vendas</dt>
              <dd className="font-medium text-iseul-ink">{product.sold_count} unidades</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="overflow-hidden rounded-iseul border border-iseul-accent/15 bg-gradient-to-br from-iseul-dew/60 to-iseul-paper2 shadow-card">
        <div className="border-b border-iseul-accent/10 px-5 py-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.14em] text-iseul-accent">
            Entrega e pagamento
          </h2>
        </div>
        <ul className="space-y-2.5 px-5 py-4 text-sm leading-relaxed text-iseul-muted">
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-iseul-accent" />
            Frete grátis em compras acima de {formatCurrency(settings.free_shipping_threshold)}.
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-iseul-accent" />
            Despacho em até 24h úteis, estoque no Brasil.
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-iseul-accent" />
            Parcelamento em até 3x sem juros no cartão.
          </li>
          <li className="flex gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-iseul-accent" />
            {settings.pix_discount_percent}% de desconto no Pix no checkout.
          </li>
        </ul>
      </div>
    </div>
  );
}
