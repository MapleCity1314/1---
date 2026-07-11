import { PageHeader } from "@/components/page-header";
import { ProductForm } from "../product-form";
import { createProductAction } from "../actions";

export default function NewProductPage() {
  return (
    <div>
      <PageHeader title="新增商品" subtitle="填写商品信息，利润会自动推算" />
      <div className="p-8">
        <ProductForm action={createProductAction} mode="new" />
      </div>
    </div>
  );
}
