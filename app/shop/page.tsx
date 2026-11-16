"use client";

/**
 * HUBZONE – Shop page (app/shop/page.tsx). Tailwind only, no extra CSS files.
 * Needs: lib/products.ts, lib/shop-fonts.ts, lib/cart.tsx, components/{ShopShell,ProductCard,CartToast}.tsx
 */

import { useEffect, useMemo, useRef, useState } from "react";
import ProductCard from "@/components/ProductCard";
import ShopShell, { ShopTop, WRAP } from "@/components/ShopShell";
import { CATEGORIES, PRODUCTS, eff, type CategoryId, type Product } from "@/lib/products";
import { api } from "@/lib/api";

const PAGE_SIZE = 12;

type SortId = "featured" | "low" | "high" | "az";
const SORTS: { value: SortId; label: string }[] = [
  { value: "featured", label: "Featured" },
  { value: "low", label: "Price: low to high" },
  { value: "high", label: "Price: high to low" },
  { value: "az", label: "Name: A to Z" },
];

function Chevron({ dir = "down", className = "" }: { dir?: "down" | "left" | "right"; className?: string }) {
  const d = dir === "down" ? "M5 9l7 7 7-7" : dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7";
  return (
    <svg className={className} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function Dropdown<T extends string>({
  label,
  value,
  options,
  onChange,
  align = "left",
  small = false,
}: {
  label: string;
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
  align?: "left" | "right";
  small?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("touchstart", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("touchstart", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={[
          "inline-flex items-center gap-2 py-1 text-[#f6e9d0]",
          small
            ? "font-[family-name:var(--font-sans)] text-sm"
            : "font-[family-name:var(--font-serif)] text-[19px] font-medium sm:text-[22px]",
        ].join(" ")}
      >
        <span>{label}</span>
        <Chevron className={`transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <ul
          role="listbox"
          className={`absolute top-[calc(100%+10px)] z-20 min-w-[220px] rounded-xl border border-[#2a231e]/20 bg-white p-2 text-[#2a231e] shadow-[0_18px_40px_rgba(42,35,30,0.16)] ${align === "right" ? "right-0" : "left-0"}`}
        >
          {options.map((o) => (
            <li key={o.value} role="option" aria-selected={o.value === value}>
              <button
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`w-full rounded-lg px-3 py-2.5 text-left text-[15px] transition-colors hover:bg-[#f3ead7] ${o.value === value ? "font-medium text-[#b8613a]" : ""}`}
              >
                {o.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function pageList(total: number, cur: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const nums = Array.from(new Set([1, total, cur - 1, cur, cur + 1]))
    .filter((n) => n >= 1 && n <= total)
    .sort((a, b) => a - b);
  const out: (number | "…")[] = [];
  nums.forEach((n, i) => {
    if (i && n - nums[i - 1] > 1) out.push("…");
    out.push(n);
  });
  return out;
}

const PG =
  "flex h-10 w-10 items-center justify-center rounded-full border-[1.5px] text-[15px] font-medium transition duration-300 active:scale-90 disabled:cursor-not-allowed disabled:opacity-30 sm:h-[46px] sm:w-[46px]";

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (n: number) => void }) {
  if (total <= 1) return null;
  return (
    <nav className="mt-11 flex flex-wrap items-center justify-center gap-1.5 sm:mt-16 sm:gap-2.5" aria-label="Pagination">
      <button className={`${PG} border-[#2a231e]/20 hover:border-[#2a231e]`} disabled={page === 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <Chevron dir="left" />
      </button>
      {pageList(total, page).map((it, i) =>
        it === "…" ? (
          <span className="w-6 text-center text-[#6a5c4f]" key={`d${i}`}>…</span>
        ) : (
          <button
            key={it}
            aria-current={it === page ? "page" : undefined}
            aria-label={`Page ${it}`}
            onClick={() => onChange(it)}
            className={`${PG} ${it === page ? "border-[#2a231e] bg-[#2a231e] text-[#f6e9d0]" : "border-[#2a231e]/20 hover:-translate-y-0.5 hover:border-[#2a231e]"}`}
          >
            {it}
          </button>
        )
      )}
      <button className={`${PG} border-[#2a231e]/20 hover:border-[#2a231e]`} disabled={page === total} onClick={() => onChange(page + 1)} aria-label="Next page">
        <Chevron dir="right" />
      </button>
    </nav>
  );
}

const CHIP = "rounded-full border px-[18px] py-[9px] text-[13px] font-medium transition duration-200 active:scale-95";

export default function ShopPage() {
  const [productList, setProductList] = useState<Product[]>(PRODUCTS);
  const [cat, setCat] = useState<CategoryId | "all">("all");
  const [sort, setSort] = useState<SortId>("featured");
  const [page, setPage] = useState(1);
  const listRef = useRef<HTMLElement>(null);

  useEffect(() => {
    api.products.getAll()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setProductList(data as Product[]);
        }
      })
      .catch(() => {});
  }, []);

  const sorted = useMemo(() => {
    const base = cat === "all" ? [...productList] : productList.filter((p) => p.cat === cat);
    if (sort === "low") base.sort((a, b) => eff(a) - eff(b));
    if (sort === "high") base.sort((a, b) => eff(b) - eff(a));
    if (sort === "az") base.sort((a, b) => a.name.localeCompare(b.name));
    return base;
  }, [productList, cat, sort]);

  const pages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const current = Math.min(page, pages);
  const start = (current - 1) * PAGE_SIZE;
  const visible = sorted.slice(start, start + PAGE_SIZE);

  const chooseCat = (c: CategoryId | "all") => {
    setCat(c);
    setPage(1);
  };
  const chooseSort = (s: SortId) => {
    setSort(s);
    setPage(1);
  };
  const goTo = (n: number) => {
    setPage(n);
    requestAnimationFrame(() => listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };

  const catOptions = [{ value: "all" as const, label: "All products" }, ...CATEGORIES.map((c) => ({ value: c.id, label: c.label }))];
  const catLabel = cat === "all" ? "Category" : CATEGORIES.find((c) => c.id === cat)!.label;
  const sortLabel = SORTS.find((s) => s.value === sort)!.label;

  return (
    <ShopShell>
      <ShopTop>
        <h1 className="mb-9 font-[family-name:var(--font-serif)] text-[length:clamp(44px,8vw,92px)] font-medium leading-[1.02] tracking-[-0.01em]">
          Shop all products
        </h1>

        <div className="mb-[26px] flex flex-wrap gap-2.5" role="tablist" aria-label="Product categories">
          <button
            role="tab"
            aria-selected={cat === "all"}
            onClick={() => chooseCat("all")}
            className={`${CHIP} ${cat === "all" ? "border-[#f6e9d0] bg-[#f6e9d0] text-[#2a231e]" : "border-[#f6e9d0]/30 hover:border-[#f6e9d0]"}`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              role="tab"
              aria-selected={cat === c.id}
              onClick={() => chooseCat(c.id)}
              className={`${CHIP} ${cat === c.id ? "border-[#f6e9d0] bg-[#f6e9d0] text-[#2a231e]" : "border-[#f6e9d0]/30 hover:border-[#f6e9d0]"}`}
            >
              {c.brand}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3.5 border-t border-[#f6e9d0]/20 pb-[26px] pt-3.5 sm:gap-[22px]">
          <Dropdown label={catLabel} value={cat} options={catOptions} onChange={chooseCat} />
          <span className="text-sm text-[#f6e9d0]/65">
            {sorted.length === 0 ? "0 products" : `Showing ${start + 1}–${start + visible.length} of ${sorted.length}`}
          </span>
          <div className="flex-1" />
          <Dropdown small label={`Sort by: ${sortLabel}`} value={sort} options={SORTS} onChange={chooseSort} align="right" />
        </div>
      </ShopTop>

      <main ref={listRef} className={`${WRAP} scroll-mt-20 pb-[72px] pt-8 sm:pb-24 sm:pt-12`}>
        <div
          key={`${cat}-${sort}-${current}`}
          className="grid grid-cols-1 gap-x-3.5 gap-y-8 min-[381px]:grid-cols-2 sm:gap-x-[22px] sm:gap-y-11 md:grid-cols-3 min-[1101px]:grid-cols-4"
        >
          {visible.map((p, i) => (
            <ProductCard key={p.id} p={p} i={i} />
          ))}
        </div>
        <Pagination page={current} total={pages} onChange={goTo} />
      </main>
    </ShopShell>
  );
}
