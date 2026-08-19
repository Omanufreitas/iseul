import Link from "next/link";
import { listAllProductsAdmin } from "@/lib/catalog";
import { formatCurrency } from "@/lib/utils";

export default async function AdminProductsPage() {
  const products = await listAllProductsAdmin();

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Produtos</h1>
          <p className="text-sm text-neutral-500">{products.length} itens no catálogo</p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="rounded-lg bg-iseul-accent px-4 py-2 text-sm font-medium text-white"
        >
          + Novo produto
        </Link>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b bg-neutral-50 text-neutral-500">
            <tr>
              <th className="px-4 py-3 font-medium">Produto</th>
              <th className="px-4 py-3 font-medium">Marca</th>
              <th className="px-4 py-3 font-medium">Categoria</th>
              <th className="px-4 py-3 font-medium">Preço</th>
              <th className="px-4 py-3 font-medium">Estoque</th>
              <th className="px-4 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-neutral-50">
                <td className="px-4 py-3">
                  <Link href={`/admin/produtos/${encodeURIComponent(p.id)}`} className="font-medium hover:text-iseul-accent">
                    {p.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-neutral-600">{p.brand}</td>
                <td className="px-4 py-3 text-neutral-600">{p.category_label}</td>
                <td className="px-4 py-3">{formatCurrency(p.price)}</td>
                <td className="px-4 py-3">{p.stock}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      p.active ? "bg-green-100 text-green-800" : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {p.active ? "Ativo" : "Inativo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
