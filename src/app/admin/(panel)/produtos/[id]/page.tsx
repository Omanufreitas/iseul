import Link from "next/link";

export const dynamic = "force-dynamic";
import { notFound } from "next/navigation";
import { ProductForm } from "@/components/admin/ProductForm";
import { countHomeBestsellers } from "@/actions/admin/products";
import { getProductById } from "@/lib/catalog";
import { listProductCategories } from "@/lib/categories";
import { listSkinTypes } from "@/lib/skin-types";

type Props = { params: Promise<{ id: string }> };

export default async function EditProductPage({ params }: Props) {
  const { id } = await params;
  const decodedId = decodeURIComponent(id);
  const [product, categories, skinTypeOptions, otherFeaturedCount] = await Promise.all([
    getProductById(decodedId),
    listProductCategories(),
    listSkinTypes(),
    countHomeBestsellers(decodedId),
  ]);
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
      <ProductForm
        product={product}
        categories={categories}
        skinTypeOptions={skinTypeOptions}
        otherFeaturedCount={otherFeaturedCount}
      />
    </div>
  );
}
