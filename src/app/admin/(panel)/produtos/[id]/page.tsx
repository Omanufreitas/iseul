import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProductById } from "@/lib/catalog";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(decodeURIComponent(id));
  if (!product) notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/produtos" className="text-sm text-neutral-500 hover:text-neutral-900">
          Voltar aos produtos
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Editar produto</h1>
        <p className="mt-1 text-sm text-neutral-500">{product.name}</p>
      </div>
      <ProductForm product={product} />
    </div>
  );
}
