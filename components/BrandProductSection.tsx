"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { api } from "@/lib/api";
import { setLiveProducts, sortProducts, type CategoryId, type Product } from "@/lib/products";

export default function BrandProductSection({
  initialProducts,
  categoryLabel,
  categoryId,
}: {
  initialProducts: Product[];
  categoryLabel: string;
  categoryId: CategoryId;
}) {
  const [products, setProducts] = useState<Product[]>(() => sortProducts(initialProducts || []));

  useEffect(() => {
    if (initialProducts && initialProducts.length > 0) {
      setLiveProducts(initialProducts);
      setProducts(sortProducts(initialProducts));
    }

    const loadCategoryProducts = () => {
      api.products
        .getAll({ category: categoryId })
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const sortedData = sortProducts(data as Product[]);
            setProducts(sortedData);
            setLiveProducts(sortedData);
          }
        })
        .catch(() => {});
    };

    loadCategoryProducts();

    const onUpdated = () => {
      loadCategoryProducts();
    };

    window.addEventListener("hubzone_products_updated", onUpdated);
    return () => window.removeEventListener("hubzone_products_updated", onUpdated);
  }, [categoryId, initialProducts]);

  return (
    <>
      <div className="mb-8 flex flex-wrap items-end justify-between gap-3 sm:mb-10">
        <h2 className="font-[family-name:var(--font-serif)] text-[length:clamp(28px,4vw,44px)] font-medium leading-tight">
          Products in {categoryLabel}
        </h2>
        <span className="text-sm text-[#6a5c4f]">
          {products.length} {products.length === 1 ? "product" : "products"}
        </span>
      </div>

      {products.length === 0 ? (
        <p className="text-[#6a5c4f]">New products are coming soon.</p>
      ) : (
        <div className="grid grid-cols-1 gap-x-3.5 gap-y-8 min-[381px]:grid-cols-2 sm:gap-x-[22px] sm:gap-y-11 md:grid-cols-3 min-[1101px]:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} p={p} i={i} />
          ))}
        </div>
      )}
    </>
  );
}

