import { Suspense } from "react";
import ShopShell, { ShopTop } from "@/components/ShopShell";
import ShopView from "@/components/ShopView";
import { PRODUCTS, sortProducts, type Product } from "@/lib/products";

export default function ShopPage() {
  return (
    <Suspense
      fallback={
        <ShopShell>
          <ShopTop>
            <div className="h-[200px]" />
          </ShopTop>
        </ShopShell>
      }
    >
      <ShopData />
    </Suspense>
  );
}

async function ShopData() {
  let initialProducts: Product[] = PRODUCTS;
  try {
    const res = await fetch("http://localhost:5000/api/products", { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        initialProducts = data as Product[];
      }
    }
  } catch {}

  return <ShopView initialProducts={sortProducts(initialProducts)} />;
}
