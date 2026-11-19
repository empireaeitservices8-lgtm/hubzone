import type { MetadataRoute } from "next";
import { CATEGORIES, PRODUCTS, type Product } from "@/lib/products";
import { SITE_URL } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Core static pages
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/shop`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  // Brand collection pages
  const brandRoutes: MetadataRoute.Sitemap = CATEGORIES.map((c) => ({
    url: `${SITE_URL}/brands/${c.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // Dynamic products
  let products: Product[] = PRODUCTS;
  try {
    const res = await fetch("http://localhost:5000/api/products", {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        products = data as Product[];
      }
    }
  } catch {}

  const productRoutes: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE_URL}/shop/${p.id}`,
    lastModified: (p as any).updated_at ? new Date((p as any).updated_at) : now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...brandRoutes, ...productRoutes];
}
