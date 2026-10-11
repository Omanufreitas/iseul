import Link from "next/link";
import { ProductForm } from "@/components/admin/ProductForm";
import { countHomeBestsellers } from "@/actions/admin/products";
import { listProductCategories } from "@/lib/categories";
import { listSkinTypes } from "@/lib/skin-types";

export default async function NewProductPage() {
  const [categories, skinTypeOptions, otherFeaturedCount] = await Promise.all([
    listProductCategories(),
    listSkinTypes(),
    countHomeBestsellers(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/produtos" className="text-sm text-neutral-500 hover:text-neutral-900">
          Voltar aos produtos
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">Novo produto</h1>
        <p className="mt-1 text-sm text-neutral-500">Cadastre um item no catálogo Iseul</p>
      </div>
      <ProductForm
        categories={categories}
        skinTypeOptions={skinTypeOptions}
        otherFeaturedCount={otherFeaturedCount}
      />
    </div>
  );
}
