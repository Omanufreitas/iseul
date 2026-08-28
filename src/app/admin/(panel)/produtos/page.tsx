import Link from "next/link";
import { ProductsAdminPanel } from "@/components/admin/ProductsAdminPanel";
import { PageHeader } from "@/components/admin/ui/PageHeader";
import { listAllProductsAdmin } from "@/lib/catalog";

export default async function AdminProductsPage() {
  const products = await listAllProductsAdmin();

  return (
    <div>
      <PageHeader
        title="Produtos"
        description="Gerencie catálogo, estoque e preços"
        action={
          <Link
            href="/admin/produtos/novo"
            className="rounded-xl bg-iseul-accent px-4 py-2.5 text-center text-sm font-medium text-white shadow-sm transition hover:bg-iseul-accent/90"
          >
            + Novo produto
          </Link>
        }
      />

      <ProductsAdminPanel products={products} />
    </div>
  );
}
