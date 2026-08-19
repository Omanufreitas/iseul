"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { deleteProduct } from "@/actions/admin/products";

type Props = {
  id: string;
  name: string;
};

export function DeleteProductButton({ id, name }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(`Excluir "${name}"? Esta ação não pode ser desfeita.`)) return;

    startTransition(async () => {
      const result = await deleteProduct(id);
      if ("error" in result && result.error) {
        toast.error(result.error);
        return;
      }
      toast.success("Produto excluído");
      router.push("/admin/produtos");
      router.refresh();
    });
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={pending}
      className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-60"
    >
      {pending ? "Excluindo..." : "Excluir produto"}
    </button>
  );
}
