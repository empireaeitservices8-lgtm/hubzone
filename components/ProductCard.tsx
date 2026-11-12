"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useCart } from "@/lib/cart";
import { discountPct, eff, getCategory, hasOffer, inr, tileStyle, type Product } from "@/lib/products";

function JarPlaceholder({ name }: { name: string }) {
  return (
    <svg
      className="absolute inset-[14%] h-[72%] w-[72%] opacity-90 transition-transform duration-700 ease-out group-hover:scale-[1.08]"
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

/** Product photo (its white background is multiplied into the tile colour), or a placeholder jar if the file is missing. */
export function TileArt({ src, name, pad = "10%" }: { src: string; name: string; pad?: string }) {
  const [ok, setOk] = useState(true);
  return ok ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setOk(false)}
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "multiply", padding: pad, filter: "brightness(1.05)" }}
      className="block transition-transform duration-700 ease-out group-hover:scale-[1.08]"
    />
  ) : (
    <JarPlaceholder name={name} />
  );
}

const BagPlusIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 7h12l-1.2 12.2a1.5 1.5 0 0 1-1.5 1.3H8.7a1.5 1.5 0 0 1-1.5-1.3L6 7Z" />
    <path d="M9 7V6a3 3 0 0 1 6 0v1" />
    <path d="M12 11.5v5M9.5 14h5" />
  </svg>
);

const CheckIcon = () => (
  <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

export default function ProductCard({ p }: { p: Product; i?: number }) {
  const { add } = useCart();
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const c = getCategory(p.cat);
  const offer = hasOffer(p);
  const href = `/shop/${p.id}`;

  const addToCart = () => {
    add(p.id);
    setDone(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), 1500);
  };

  return (
    <article className="group min-w-0" style={{ ["--tile" as string]: c.tile }}>
      <Link href={href} className="block" tabIndex={-1} aria-hidden="true">
        <div
          className={`relative aspect-square overflow-hidden rounded-2xl shadow-[inset_0_0_0_1px_rgba(42,35,30,0.06)] transition-[transform,box-shadow] duration-500 ease-out group-hover:-translate-y-1.5 group-hover:shadow-[0_26px_44px_-20px_rgba(42,35,30,0.4),inset_0_0_0_1px_rgba(42,35,30,0.06)] group-active:scale-[0.97] sm:rounded-[20px]`}
          style={tileStyle(c.tile)}
        >
          <TileArt src={p.img} name={p.name} />
          <span className="absolute left-2.5 top-2.5 z-[2] rounded-full bg-white/90 px-2.5 py-[5px] text-[11px] font-medium text-[#2a231e] backdrop-blur-sm sm:left-3 sm:top-3">
            {c.label}
          </span>
          {offer && (
            <span className="absolute right-2.5 top-2.5 z-[2] rounded-full bg-[#b8613a] px-2.5 py-[5px] text-[11px] font-medium text-white sm:right-3 sm:top-3">
              {discountPct(p)}% off
            </span>
          )}
          <span className="absolute inset-x-3 bottom-3 z-[2] flex translate-y-4 items-center justify-between rounded-full bg-[#2a231e] px-4 py-[11px] text-[13px] font-medium text-[#f6e9d0] opacity-0 transition duration-500 group-hover:translate-y-0 group-hover:opacity-100 [@media(hover:none)]:hidden">
            View details
            <ArrowIcon />
          </span>
        </div>
      </Link>

      <div className="flex items-start justify-between gap-2 pt-4 sm:gap-3">
        <Link href={href} className="group/meta block min-w-0 flex-1">
          <h2 className="break-words font-[family-name:var(--font-serif)] text-[length:clamp(19px,1.7vw,23px)] font-medium leading-[1.15] transition-colors group-hover/meta:text-[#b8613a]">
            {p.name}
          </h2>
          <div className="mt-1.5 flex flex-wrap items-baseline gap-x-2.5 gap-y-1 text-[15px]">
            <span className="font-medium">{inr(eff(p))}</span>
            {offer && (
              <s className="text-[13px] text-[#6a5c4f] decoration-[1.5px]" aria-label={`Original price ${inr(p.price)}`}>
                {inr(p.price)}
              </s>
            )}
          </div>
        </Link>
        <button
          type="button"
          onClick={addToCart}
          aria-label={done ? `${p.name} added to cart` : `Add ${p.name} to cart`}
          className={[
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[1.5px] transition duration-300 active:scale-90",
            done
              ? "border-[#2a231e] bg-[#2a231e] text-[#f6e9d0]"
              : "border-[#2a231e] text-[#2a231e] hover:-rotate-[8deg] hover:scale-110 hover:border-[#b8613a] hover:bg-[#b8613a] hover:text-white",
          ].join(" ")}
        >
          {done ? <CheckIcon /> : <BagPlusIcon />}
        </button>
      </div>
    </article>
  );
}
