import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import ProductCard from "@/components/ProductCard";
import ShopShell, { ShopTop, WRAP } from "@/components/ShopShell";
import { PRODUCTS, discountPct, eff, getCategory, getImages, getProduct, hasOffer, inr } from "@/lib/products";
import OrderPanel from "./OrderPanel";
import ProductGallery from "./ProductGallery";

/** Next.js 15: params is a Promise. (On Next 13/14 change the type to `{ params: { id: string } }` and drop the awaits.) */
type Props = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const p = getProduct(id);
  if (!p) return { title: "Product not found | HUBZONE" };
  return {
    title: `${p.name} | HUBZONE`,
    description: p.desc ?? `${p.name} from ${getCategory(p.cat).brand}. ${getCategory(p.cat).blurb}.`,
  };
}

/** Reads the id from the URL, so it renders inside <Suspense> (see ProductPage below). */
async function ProductContent({ params }: Props) {
  const { id } = await params;
  const p = getProduct(id);
  if (!p) notFound();

  const c = getCategory(p.cat);
  const offer = hasOffer(p);
  const same = PRODUCTS.filter((x) => x.cat === p.cat && x.id !== p.id);
  const others = PRODUCTS.filter((x) => x.cat !== p.cat);
  const related = [...same, ...others].slice(0, 4);

  return (
    <ShopShell>
      <ShopTop bottom="pb-10 sm:pb-12">
        <nav className="mb-[22px] flex flex-wrap items-center gap-2.5 text-sm text-[#f6e9d0]/65" aria-label="Breadcrumb">
          <Link href="/shop" className="transition-colors hover:text-[#f6e9d0]">Shop</Link>
          <span className="opacity-50">/</span>
          <span>{c.label}</span>
        </nav>
        <h1 className="font-[family-name:var(--font-serif)] text-[length:clamp(40px,6.4vw,84px)] font-medium leading-[1.02] tracking-[-0.01em]">
          {p.name}
        </h1>
      </ShopTop>

      <main className={WRAP}>
        <section
          className="grid items-start gap-[30px] pt-8 sm:pt-12 md:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] md:gap-10 lg:gap-16"
          style={{ ["--tile" as string]: c.tile }}
        >
          <div className="md:sticky md:top-[110px]">
            <ProductGallery
              images={getImages(p)}
              name={p.name}
              tile={c.tile}
              label={c.label}
              discount={offer ? discountPct(p) : undefined}
            />
          </div>

          <div className="md:pt-2">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1.5">
              <span className="font-[family-name:var(--font-serif)] text-[length:clamp(40px,5vw,60px)] font-medium leading-none">{inr(eff(p))}</span>
              {offer && <s className="text-xl text-[#6a5c4f] decoration-[1.5px]">{inr(p.price)}</s>}
            </div>

           <h2 className="mt-[18px] font-[family-name:var(--font-serif)] text-2xl font-medium text-black">Description</h2>
<p className="mt-2 max-w-[52ch] text-lg leading-relaxed text-[#6a5c4f]">
  {p.desc ?? `${c.blurb}. Part of the ${c.brand} range from HUBZONE.`}
</p>
            {p.ingredients && (
              <div className="mt-8">
                <h2 className="font-[family-name:var(--font-serif)] text-2xl font-medium">Ingredients</h2>
                <p className="mt-2 max-w-[52ch] text-[15.5px] leading-relaxed text-[#6a5c4f]">{p.ingredients}</p>
              </div>
            )}

            <OrderPanel id={p.id} name={p.name} unit={eff(p)} />
            
            <dl className="mt-10 border-t border-[#2a231e]/20">
              {[
                ["Brand", c.brand],
                ["Category", c.label],
                ["Price", inr(eff(p))],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-[#2a231e]/20 py-[15px] text-[15px]">
                  <dt className="text-[#6a5c4f]">{k}</dt>
                  <dd className="text-right font-medium">{v}</dd>
                </div>
              ))}
            </dl>

            <Link href="/shop" className="mt-7 inline-block text-[15px] font-medium underline underline-offset-4 transition-colors hover:text-[#b8613a]">
              ← Back to all products
            </Link>
          </div>
        </section>

        <section className="pb-20 pt-16 sm:pb-[110px] sm:pt-[88px]" aria-labelledby="more-h">
          <h2 id="more-h" className="mb-8 font-[family-name:var(--font-serif)] text-[length:clamp(32px,4vw,48px)] font-medium leading-[1.1]">
            You may also like
          </h2>
          <div className="grid grid-cols-1 gap-x-3.5 gap-y-8 min-[381px]:grid-cols-2 sm:gap-x-[22px] sm:gap-y-11 md:grid-cols-3 min-[1101px]:grid-cols-4">
            {related.map((r, i) => (
              <ProductCard key={r.id} p={r} i={i} />
            ))}
          </div>
        </section>
      </main>
    </ShopShell>
  );
}

/** Loading placeholder shown while the id is read from the URL. Same shell as the real page, so nothing jumps. */
function ProductSkeleton() {
  return (
    <ShopShell>
      <ShopTop bottom="pb-10 sm:pb-12">
        <div className="mb-[22px] h-5 w-40 animate-pulse rounded bg-[#f6e9d0]/15" />
        <div className="h-14 w-4/5 max-w-[640px] animate-pulse rounded-xl bg-[#f6e9d0]/15 sm:h-20" />
      </ShopTop>
      <main className={`${WRAP} pt-8 sm:pt-12`}>
        <div className="aspect-square max-w-[560px] animate-pulse rounded-[22px] bg-[#efe3cb] sm:rounded-[30px]" />
      </main>
    </ShopShell>
  );
}

export default function ProductPage({ params }: Props) {
  return (
    <Suspense fallback={<ProductSkeleton />}>
      <ProductContent params={params} />
    </Suspense>
  );
}
