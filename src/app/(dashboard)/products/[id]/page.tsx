import { notFound } from "next/navigation";
import { getProduct } from "@/lib/products";
import { PageHeader } from "@/components/page-header";
import { ProductForm } from "../product-form";
import { updateProductAction } from "../actions";

export const dynamic = "force-dynamic";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(decodeURIComponent(id));
  if (!product) notFound();

  return (
    <div>
      <PageHeader title="编辑商品" subtitle={`${product.id} · ${product.title}`} />
      <div className="mx-auto max-w-5xl px-8 py-7">
        <div className="rounded-[22px] border border-hairline bg-card p-7 card-shadow">
          <ProductForm product={product} action={updateProductAction} mode="edit" />
        </div>
      </div>
    </div>
  );
}
