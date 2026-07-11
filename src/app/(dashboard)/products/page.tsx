import Link from "next/link";
import { Plus } from "lucide-react";
import { listProducts } from "@/lib/products";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui";
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
      <div className="p-8">
        <ProductList products={products} />
      </div>
    </div>
  );
}
