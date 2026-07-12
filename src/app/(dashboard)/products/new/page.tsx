import { PageHeader } from "@/components/page-header";
import { ProductForm } from "../product-form";
import { createProductAction } from "../actions";

export default function NewProductPage() {
  return (
    <div>
      <PageHeader title="新增商品" />
      <div className="mx-auto max-w-5xl px-8 py-7">
        <div className="rounded-[22px] border border-hairline bg-card p-7 card-shadow">
          <ProductForm action={createProductAction} mode="new" />
        </div>
      </div>
    </div>
  );
}
