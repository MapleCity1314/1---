import { PageHeader } from "@/components/page-header";
import { ProductForm } from "../product-form";
import { createProductAction } from "../actions";

export default function NewProductPage() {
  return (
    <div>
      <PageHeader title="新增商品" subtitle="填写商品信息，利润会自动推算" />
      <div className="mx-auto max-w-4xl px-6 py-6">
        <div className="rounded-[22px] border border-hairline bg-white p-7 card-shadow">
          <ProductForm action={createProductAction} mode="new" />
        </div>
      </div>
    </div>
  );
}
