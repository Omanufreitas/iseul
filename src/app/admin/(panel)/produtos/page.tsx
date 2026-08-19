import Link from "next/link";
import { ProductsAdminPanel } from "@/components/admin/ProductsAdminPanel";
import { listAllProductsAdmin } from "@/lib/catalog";
import { isMockCatalogEnabled } from "@/lib/config";

export default async function AdminProductsPage() {
  const products = await listAllProductsAdmin();
  const demoMode = isMockCatalogEnabled();

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Produtos</h1>
          <p className="text-sm text-neutral-500">Gerencie catálogo, estoque e preços</p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="rounded-lg bg-iseul-accent px-4 py-2 text-center text-sm font-medium text-white"
        >
          + Novo produto
        </Link>
      </div>

      <div className="mt-6">
        <ProductsAdminPanel products={products} demoMode={demoMode} />
      </div>
    </div>
  );
}
