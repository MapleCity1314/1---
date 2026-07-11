import Link from "next/link";
import { listProducts } from "@/lib/products";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui";
import { Plus } from "@/components/icons";
import { ProductList } from "./product-list";

export const dynamic = "force-dynamic";

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <div>
      <PageHeader
        title="商品管理"
        subtitle={`共 ${products.length} 件商品`}
        actions={
          <Link href="/products/new">
            <Button>
              <Plus size={16} />
              新增商品
            </Button>
          </Link>
        }
      />
      <div className="mx-auto max-w-5xl px-8 py-7">
        <ProductList products={products} />
      </div>
    </div>
  );
}
