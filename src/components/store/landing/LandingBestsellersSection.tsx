import Link from "next/link";
import { ProductCard } from "@/components/store/ProductCard";
import { HOME_BESTSELLERS_LIMIT, homeBestsellers } from "@/lib/catalog-filter";
import type { Product } from "@/types";

type Props = {
  products: Product[];
};

export function LandingBestsellersSection({ products }: Props) {
  if (products.length === 0) return null;

  const bestsellers = homeBestsellers(products, HOME_BESTSELLERS_LIMIT);
  const total = products.length;

  return (
    <section id="catalogo" className="landing-section scroll-mt-[70px] bg-iseul-areia/50">
      <div className="wrap">
        <div className="cab mb-8 flex flex-col gap-4 sm:mb-9 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">mais vendidos</p>
            <h2>
              O que a pele <em>mais pede.</em>
            </h2>
          </div>
          <Link
            href="/produtos"
            className="inline-flex shrink-0 items-center justify-center rounded-full border border-iseul-ink bg-white px-5 py-2.5 text-sm font-medium text-iseul-ink transition hover:bg-iseul-ink hover:text-iseul-paper"
          >
            Ver todos os produtos ({total})
          </Link>
        </div>

        {/* Mobile: horizontal carousel */}
        <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] md:hidden [&::-webkit-scrollbar]:hidden">
          {bestsellers.map((p, i) => (
            <div
              key={p.id}
              className="w-[min(72vw,260px)] shrink-0 snap-start"
            >
              <ProductCard product={p} allProducts={products} index={i} visible compact />
            </div>
          ))}
        </div>

        {/* Tablet+: grid */}
        <div className="hidden grid-cols-3 gap-3.5 md:grid xl:grid-cols-4">
          {bestsellers.map((p, i) => (
            <ProductCard
              key={p.id}
              product={p}
              allProducts={products}
              index={i}
              visible
              compact
            />
          ))}
        </div>

        <div className="mt-8 flex justify-center md:hidden">
          <Link
            href="/produtos"
            className="rounded-full border border-iseul-ink px-5 py-2.5 text-sm font-medium text-iseul-ink transition hover:bg-iseul-ink hover:text-iseul-paper"
          >
            Ver todos os produtos ({total})
          </Link>
        </div>
      </div>
    </section>
  );
}
