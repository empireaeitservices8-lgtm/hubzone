"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { discountPct, eff, getCategory, getImages, hasOffer, inr, tileStyle, type Product } from "@/lib/products";

function JarPlaceholder({ name, active = true }: { name: string; active?: boolean }) {
  return (
    <svg
      className="absolute inset-[14%] h-[72%] w-[72%] transition-[opacity,transform] duration-300 group-hover:scale-[1.08]"
      style={{ opacity: active ? 0.9 : 0 }}
      viewBox="0 0 120 150"
      role="img"
      aria-label={`${name} placeholder`}
    >
      <rect x="30" y="8" width="60" height="26" rx="5" fill="#3b4a45" />
      <rect x="22" y="30" width="76" height="108" rx="14" fill="#fff" fillOpacity=".55" stroke="#2a231e" strokeOpacity=".25" />
      <rect x="30" y="58" width="60" height="52" rx="4" fill="#fbf1de" />
      <text x="60" y="80" textAnchor="middle" fontFamily="Georgia,serif" fontSize="9" fill="#2a231e">HUBZONE</text>
      <rect x="40" y="88" width="40" height="1" fill="#2a231e" fillOpacity=".4" />
    </svg>
  );
}

const EXTS = ["jpg", "jpeg", "webp", "png"];
const HAS_EXT = /\.(jpe?g|png|webp|avif|gif)$/i;
/**
 * Product photo (its white background is multiplied into the tile colour), or a placeholder jar if no file is found.
 * `src` may include an extension (/products/a.jpg) or not (/products/a): without one, jpg, jpeg, webp, png are tried in order.
 */
export function TileArt({
  src,
  name,
  pad = "10%",
  active = true,
}: {
  src: string;
  name: string;
  pad?: string;
  active?: boolean;
}) {
  const candidates = HAS_EXT.test(src) ? [src] : EXTS.map((e) => `${src}.${e}`);
  const [n, setN] = useState(0);
  const [ok, setOk] = useState(true);

  return ok ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={candidates[n]}
      alt={active ? name : ""}
      aria-hidden={!active}
      loading="lazy"
      onError={() => (n + 1 < candidates.length ? setN(n + 1) : setOk(false))}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        objectFit: "contain",
        mixBlendMode: "multiply",
        padding: pad,
        filter: "brightness(1.05)",
        opacity: active ? 1 : 0,
        transition: "opacity 300ms ease, transform 700ms ease-out",
      }}
      className="block group-hover:scale-[1.08]"
    />
  ) : (
    <JarPlaceholder name={name} active={active} />
  );
}

const BagPlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 7h12l-1.2 12.2a1.5 1.5 0 0 1-1.5 1.3H8.7a1.5 1.5 0 0 1-1.5-1.3L6 7Z" />
    <path d="M9 7V6a3 3 0 0 1 6 0v1" />
    <path d="M12 11.5v5M9.5 14h5" />
  </svg>
);

const CheckIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

export default function ProductCard({ p }: { p: Product; i?: number }) {
  const router = useRouter();
  const { user } = useAuth();
  const { add } = useCart();
  const [done, setDone] = useState(false);
  const [idx, setIdx] = useState(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const c = getCategory(p.cat);
  const offer = hasOffer(p);
  const href = `/shop/${p.id}`;
  const imgs = getImages(p);
  const many = imgs.length > 1;

  const handleProductClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      toast.error("Please sign in to view product details.");
      router.push(`/login?redirect=${encodeURIComponent(href)}`);
    }
  };

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      toast.error("Please sign in to add items to your cart.");
      router.push(`/login?redirect=${encodeURIComponent(href)}`);
      return;
    }
    if ((p as any).status === "out_of_stock") {
      toast.warning(`${p.name} is currently out of stock.`);
      return;
    }
    add(p.id);
    toast.success(`Added "${p.name}" to cart!`);
    setDone(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), 1500);
  };

  const go = (d: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIdx((i) => (i + d + imgs.length) % imgs.length);
  };

  return (
    <article className="group flex h-full min-w-0 flex-col" style={{ ["--tile" as string]: c.tile }}>
      {/* Tile: 5:4, add-to-cart sits on its corner */}
      <div className="relative">
        <Link href={href} onClick={handleProductClick} className="block" tabIndex={-1} aria-hidden="true">
          <div
            className="relative aspect-[5/4] overflow-hidden rounded-2xl shadow-[inset_0_0_0_1px_rgba(42,35,30,0.07)] transition-[transform,box-shadow] duration-500 ease-out group-hover:-translate-y-1 group-hover:shadow-[0_22px_38px_-22px_rgba(42,35,30,0.45),inset_0_0_0_1px_rgba(42,35,30,0.07)] group-active:scale-[0.98]"
            style={tileStyle(c.tile)}
          >
           {imgs.map((src, n) => (
  <TileArt key={src} src={src} name={p.name} pad="6%" active={n === idx} />
))}
            <span className="absolute left-2.5 top-2.5 z-[2] rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-medium leading-none text-[#2a231e] backdrop-blur-sm">
              {c.label}
            </span>
            {(p as any).status === "out_of_stock" && (
              <span className="absolute left-2.5 bottom-2.5 z-[2] rounded-full bg-neutral-900/85 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-white backdrop-blur-sm">
                Out of Stock
              </span>
            )}
            {offer && (
              <span className="absolute right-2.5 top-2.5 z-[2] rounded-full bg-[#b8613a] px-2.5 py-1 text-[11px] font-medium leading-none text-white">
                {discountPct(p)}% off
              </span>
            )}
          </div>
        </Link>

        {many && (
          <>
            {(["prev", "next"] as const).map((dir) => (
              <button
                key={dir}
                type="button"
                onClick={go(dir === "prev" ? -1 : 1)}
                aria-label={dir === "prev" ? "Previous image" : "Next image"}
                className={`absolute top-1/2 z-[3] flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-[#2a231e] opacity-0 shadow transition hover:bg-white active:scale-90 group-hover:opacity-100 [@media(hover:none)]:opacity-100 ${dir === "prev" ? "left-2" : "right-2"}`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d={dir === "prev" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"} />
                </svg>
              </button>
            ))}
            <div className="pointer-events-none absolute bottom-3 left-1/2 z-[3] flex -translate-x-1/2 gap-1.5">
              {imgs.map((_, n) => (
                <span key={n} className={`h-1.5 rounded-full bg-[#2a231e] transition-all ${n === idx ? "w-4 opacity-80" : "w-1.5 opacity-25"}`} />
              ))}
            </div>
          </>
        )}

        <button
          type="button"
          onClick={addToCart}
          aria-label={done ? `${p.name} added to cart` : `Add ${p.name} to cart`}
          className={[
            "absolute bottom-2.5 right-2.5 z-[3] flex h-10 w-10 items-center justify-center rounded-full shadow-[0_6px_16px_-6px_rgba(42,35,30,0.5)] transition duration-300 group-hover:-translate-y-1 active:scale-90",
            done
              ? "bg-[#2a231e] text-[#f6e9d0]"
              : "bg-white text-[#2a231e] hover:scale-110 hover:bg-[#b8613a] hover:text-white",
          ].join(" ")}
        >
          {done ? <CheckIcon /> : <BagPlusIcon />}
        </button>
      </div>

      {/* Info: name on top, price pinned to the bottom so prices line up across a row */}
      <Link href={href} onClick={handleProductClick} className="group/meta flex flex-1 flex-col px-0.5 pt-3">
        <h2 className="line-clamp-2 break-words font-[family-name:var(--font-serif)] text-[length:clamp(17px,1.5vw,20px)] font-medium leading-[1.2] transition-colors group-hover/meta:text-[#b8613a]">
          {p.name}
        </h2>
        <div className="mt-auto flex items-baseline gap-2 pt-1.5 text-[15px]">
          <span className="font-semibold">{inr(eff(p))}</span>
          {offer && (
            <s className="text-[13px] text-[#6a5c4f] decoration-[1.5px]" aria-label={`Original price ${inr(p.price)}`}>
              {inr(p.price)}
            </s>
          )}
        </div>
      </Link>
    </article>
  );
}
