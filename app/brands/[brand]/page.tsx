/**
 * HUBZONE – Brand page (app/brands/[brand]/page.tsx)
 * URLs: /brands/care, /brands/perfume, /brands/cook, /brands/coffee, /brands/wash
 * Uses the same ShopShell, ShopTop and ProductCard as the shop page.
 */

import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import BrandProductSection from "@/components/BrandProductSection";
import ShopShell, { ShopTop, WRAP } from "@/components/ShopShell";
import { CATEGORIES, PRODUCTS, sortProducts, type CategoryId, type Product } from "@/lib/products";
import { getBreadcrumbSchema, SITE_NAME, SITE_URL } from "@/lib/seo";
import { BACKEND_URL } from "@/lib/api";

/* Edit the text here. `about` is the paragraph under the brand name, `points` are the small highlights. */
const BRAND_INFO: Record<CategoryId, { tagline: string; about: string; points: string[] }> = {
  care: {
    tagline: "HUBCARE Group of Ayurveda - Herbal Unisex Body Care",
    about:
      "HUBCARE combines the power of nature and Ayurveda to care for your hair and skin. Our herbal unisex products are made with pure natural ingredients to nourish, protect, and enhance your natural beauty. Formulated by Ayurvedic doctors and enriched with ingredients sourced from natural forests.",
    points: ["Ayurvedic formulas", "Natural ingredients"],
  },
  perfume: {
    tagline: "Heritage Urban Bliss",
    about:
      "HUBNOIR is our fragrance line. Signature perfumes and fragrances with deep, long-lasting notes that stay with you well after you leave the room.",
    points: ["Long-lasting scent", "Signature fragrances"],
  },
  cook: {
    tagline: "Home Universal Best Cook",
    about:
      "HUBCOOK offers durable stainless steel non-stick cookware for easy, healthy cooking with even heat and less oil. It works on gas, induction, and oven. Also included are PP5 (polypropylene) plastic oven-safe containers – safe, reusable, lightweight, and ideal for storing and reheating food.",
    points: ["Durable build", "Made for daily use"],
  },
  coffee: {
    tagline: "High Range Ultimate Beans Coffee",
    about:
      "Pure Wayanad coffee with zero chicory—crafted from 100% real coffee beans. No fillers, no blending—just a rich aroma and bold, authentic taste in every cup. Experience coffee in its truest form: pure, powerful, and uncompromised. ☕",
    points: ["100% pure coffee", "Grown in Wayanad"],
  },
  wash: {
    tagline: "Hygiene • Universal • Brilliance",
    about:
      "HUBWASH provides a complete range of home cleaning and washing solutions. Designed for maximum effectiveness, safety, and freshness, our products ensure every corner of your home remains spotless, hygienic, and bright.",
    points: ["Whole-home range", "Fresh, clean finish"],
  },
};

type Params = { brand: string };

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ brand: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { brand } = await params;
  const c = CATEGORIES.find((x) => x.id === brand);
  if (!c) return {};
  const info = BRAND_INFO[c.id];
  const title = `${c.label} - ${info.tagline} | HubZone`;
  const url = `${SITE_URL}/brands/${c.id}`;

  return {
    title,
    description: info.about,
    alternates: {
      canonical: url,
    },
    openGraph: {
      title,
      description: info.about,
      url,
      siteName: SITE_NAME,
      type: "website",
      images: [
        {
          url: "/logo.png",
          width: 800,
          height: 800,
          alt: `${c.label} on HubZone`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: info.about,
      images: ["/logo.png"],
    },
  };
}

/* Next 16 wants `params` read inside <Suspense>, so the page shell shows instantly
   and the brand content streams in. generateStaticParams above pre-renders all 5 brands. */
export default function BrandPage({ params }: { params: Promise<Params> }) {
  return (
    <Suspense
      fallback={
        <ShopShell>
          <ShopTop bottom="pb-12 sm:pb-16">
            <div className="h-[220px]" />
          </ShopTop>
        </ShopShell>
      }
    >
      <BrandContent params={params} />
    </Suspense>
  );
}

async function BrandContent({ params }: { params: Promise<Params> }) {
  const { brand } = await params;
  const cat = CATEGORIES.find((c) => c.id === brand);
  if (!cat) notFound();

  const info = BRAND_INFO[cat.id];
  let products: Product[] = PRODUCTS.filter((p) => p.cat === cat.id);
  try {
    const res = await fetch(`${BACKEND_URL}/api/products?category=${encodeURIComponent(cat.id)}`, {
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        products = data as Product[];
      }
    }
  } catch {
    // fallback to static PRODUCTS
  }
  const sortedProducts = sortProducts(products);
  const others = CATEGORIES.filter((c) => c.id !== cat.id);

  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "Shop", url: "/shop" },
    { name: cat.label, url: `/brands/${cat.id}` },
  ]);

  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${cat.label} - ${info.tagline}`,
    description: info.about,
    url: `${SITE_URL}/brands/${cat.id}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: sortedProducts.map((p, idx) => ({
        "@type": "ListItem",
        position: idx + 1,
        name: p.name,
        url: `${SITE_URL}/shop/${p.id}`,
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
      />
      <ShopShell>
        <ShopTop bottom="pb-12 sm:pb-16">
          {/* Breadcrumbs */}
          <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap items-center gap-2.5 text-sm text-[#f6e9d0]/65">
            <Link href="/" className="transition-colors hover:text-[#f6e9d0]">Home</Link>
            <span className="opacity-50">/</span>
            <Link href="/shop" className="transition-colors hover:text-[#f6e9d0]">Shop</Link>
            <span className="opacity-50">/</span>
            <span className="text-[#f6e9d0]">{cat.label}</span>
          </nav>

          <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16">
            <div>
              <span
                className="mb-5 block h-1.5 w-14 rounded-full"
                style={{ background: cat.tile }}
                aria-hidden="true"
              />
              <h1 className="font-[family-name:var(--font-serif)] text-[length:clamp(48px,9vw,104px)] font-medium leading-[1] tracking-[-0.01em]">
                {cat.label}
              </h1>
              <p className="mt-4 font-[family-name:var(--font-serif)] text-[length:clamp(20px,2.6vw,30px)] leading-snug text-[#f6e9d0]/85">
                {info.tagline}
              </p>
            </div>

            <div>
              <p className="max-w-[52ch] text-[16px] leading-relaxed text-[#f6e9d0]/75 sm:text-[17px]">{info.about}</p>
              <ul className="mt-6 flex flex-wrap gap-2.5">
                {info.points.map((t) => (
                  <li
                    key={t}
                    className="rounded-full border border-[#f6e9d0]/30 px-4 py-2 text-[13px] font-medium text-[#f6e9d0]"
                  >
                    {t}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </ShopTop>

        <main className={`${WRAP} pb-[72px] pt-10 sm:pb-24 sm:pt-14`}>
          <BrandProductSection
            initialProducts={sortedProducts}
            categoryLabel={cat.label}
            categoryId={cat.id}
          />

          {/* Other brands */}
          <section className="mt-16 border-t border-[#2a231e]/15 pt-10 sm:mt-24" aria-label="Other brands">
            <h2 className="mb-6 font-[family-name:var(--font-serif)] text-[length:clamp(24px,3vw,34px)] font-medium">
              More from HubZone
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {others.map((c) => (
                <Link
                  key={c.id}
                  href={`/brands/${c.id}`}
                  className="rounded-full border border-[#2a231e]/25 px-5 py-2.5 text-[14px] font-medium transition duration-200 hover:border-[#2a231e] hover:bg-[#2a231e] hover:text-[#f6e9d0] active:scale-95"
                >
                  {c.label}
                </Link>
              ))}
              <Link
                href="/shop"
                className="rounded-full bg-[#2a231e] px-5 py-2.5 text-[14px] font-medium text-[#f6e9d0] transition duration-200 hover:bg-[#b8613a] active:scale-95"
              >
                Shop all products
              </Link>
            </div>
          </section>
        </main>
      </ShopShell>
    </>
  );
}
