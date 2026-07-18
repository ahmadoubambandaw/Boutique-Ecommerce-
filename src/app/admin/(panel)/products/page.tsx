import { listNativeProducts } from "@/lib/commerce/repository";
import { isDbConfigured } from "@/lib/db/client";
import { ProductManager } from "@/components/admin/product-manager";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const products = await listNativeProducts();
  const readOnly = !isDbConfigured();

  return <ProductManager products={products} readOnly={readOnly} />;
}
