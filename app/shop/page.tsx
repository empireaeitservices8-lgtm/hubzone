import type { Metadata } from "next";
import { Suspense } from "react";
import ShopShell, { ShopTop } from "@/components/ShopShell";
import ShopView from "@/components/ShopView";
import { PRODUCTS, sortProducts, type Product } from "@/lib/products";
import { getBreadcrumbSchema, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "Shop All Products | HubCare, HubNoir, HubCook, HubCof & HubWash",
  description:
    "Explore the complete collection of HubZone products: Ayurvedic hair & body care, signature long-lasting perfumes, healthy cookware, 100% pure Wayanad coffee, and effective home cleaning solutions.",
  alternates: {
    canonical: `${SITE_URL}/shop`,
  },
  openGraph: {
    title: "Shop All Products | HubZone",
    description:
      "Explore the complete collection of HubZone products: Ayurvedic wellness, perfumes, cookware, pure coffee, and home cleaners.",
    url: `${SITE_URL}/shop`,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "HubZone Shop",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Shop All Products | HubZone",
    description:
      "Explore the complete collection of HubZone products across all five premium brands.",
    images: ["/logo.png"],
  },
};

export default function ShopPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
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
    </>
  );
}

async function ShopData() {
  let initialProducts: Product[] = PRODUCTS;
  try {
    const res = await fetch("http://localhost:5000/api/products", { next: { revalidate: 60 } });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        initialProducts = data as Product[];
      }
    }
  } catch {}

  const sorted = sortProducts(initialProducts);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: sorted.map((p, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: p.name,
      url: `${SITE_URL}/shop/${p.id}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />
      <ShopView initialProducts={sorted} />
    </>
  );
}
