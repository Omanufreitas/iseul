import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { getProductById } from "@/lib/catalog";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const product = await getProductById(decodeURIComponent(id));
  if (!product) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Editar produto</h1>
      <ProductForm product={product} />
    </div>
  );
}
