"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { mono } from "@/lib/fonts";
import { CATEGORIES, PRODUCTS, getLiveProducts, setLiveProducts, sortProducts, type CategoryId, type Product } from "@/lib/products"; // adjust the path to where your products file lives
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { api } from "@/lib/api";
import { toast } from "sonner";

/* -------------------------------------------------------------------------- */
/*  Config – edit these to match your project                                  */
/* -------------------------------------------------------------------------- */

const LOGO_SRC = "/logo.png"; // file lives in /public/logo.png
const LOGO_ALT = "HubZone";
const MEGA_BG = "#0e1a15"; // header + panel colour when a menu is open

/* Shop + Brands menus are built from your products file: one column per category.
   Add a product to RAW in the products file and it shows up here automatically. */
const BRAND_LOOK: Record<CategoryId, { name: string; color: string }> = {
  care: { name: "HubCare", color: "#4caf50" },
  perfume: { name: "HubNoir", color: "#8574ed" },
  cook: { name: "HubCook", color: "#f08a24" },
  coffee: { name: "HubCof", color: "#d4a24c" },
  wash: { name: "HubWash", color: "#2fa8e8" },
};

type MenuId = "shop" | "brands" | null;

// `color` is the hover colour of the big links in the mobile menu
// `href: null` means the item is only a dropdown toggle (no page of its own)
const NAV_LINKS: { label: string; href: string | null; color: string; menu: MenuId }[] = [
  { label: "Home", href: "/", color: "#4caf50", menu: null },
  { label: "Brands", href: null, color: "#bddbda", menu: "brands" },
  { label: "About Us", href: "/about", color: "#f08a24", menu: null },
  { label: "Shop", href: "/shop", color: "#d4a24c", menu: "shop" },
  { label: "Contact Us", href: "/contact", color: "#2fa8e8", menu: null },
];

type HeaderProps = {
  /** number shown on the cart badge */
  cartCount?: number;
};

/* -------------------------------------------------------------------------- */
/*  Small icons (no extra dependency needed)                                   */
/* -------------------------------------------------------------------------- */

const CartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 7h12l-1.2 12.2a1.5 1.5 0 0 1-1.5 1.3H8.7a1.5 1.5 0 0 1-1.5-1.3L6 7Z" />
    <path d="M9 7V6a3 3 0 0 1 6 0v1" />
  </svg>
);

const ArrowIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M7 17 17 7M8 7h9v9" />
  </svg>
);

const SmallArrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const Chevron = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const BRAND_LINE = "bg-[linear-gradient(90deg,#4caf50_0%,#d4a24c_35%,#f08a24_65%,#2fa8e8_100%)]";

/* -------------------------------------------------------------------------- */
/*  Component                                                                  */
/* -------------------------------------------------------------------------- */

export default function Header({ cartCount = 0 }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const effectiveCartCount = count || cartCount;

  const [open, setOpen] = useState(false); // full-screen menu (phones/tablets)
  const [menu, setMenu] = useState<MenuId>(null); // desktop dropdown that is open
  const [mobileOpen, setMobileOpen] = useState<MenuId>(null); // mobile accordion that is open (none by default)
  const [scrolled, setScrolled] = useState(false);
  const [shopProducts, setShopProducts] = useState<Product[]>(PRODUCTS);

  useEffect(() => {
    const cached = getLiveProducts();
    if (cached && cached.length > 0) {
      setShopProducts(cached);
    }

    const loadProducts = () => {
      api.products.getAll()
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setShopProducts(data as Product[]);
            setLiveProducts(data as Product[]);
          }
        })
        .catch(() => {});
    };
    loadProducts();

    const handleProductsUpdated = () => {
      loadProducts();
    };

    window.addEventListener("hubzone_products_updated", handleProductsUpdated);
    return () => {
      window.removeEventListener("hubzone_products_updated", handleProductsUpdated);
    };
  }, []);

  const shopBrands = useMemo(() => {
    return CATEGORIES.map((c) => ({
      id: c.id,
      name: BRAND_LOOK[c.id].name,
      color: BRAND_LOOK[c.id].color,
      items: sortProducts(shopProducts.filter((p) => p.cat === c.id)),
    }));
  }, [shopProducts]);

  const shopOpen = menu === "shop";
  const brandsOpen = menu === "brands";
  const panelOpen = menu !== null;

  const close = useCallback(() => setOpen(false), []);
  const onHero = !scrolled && !open && !panelOpen; // transparent + white text over the hero
  const light = onHero || panelOpen || open; // white text/buttons over the hero or the coloured panel
  const isActive = (href: string | null) =>
    !href ? false : href === "/" ? pathname === "/" : !!pathname?.startsWith(href);

  // Close menus when the page changes
  useEffect(() => {
    setMenu(null);
    setOpen(false);
  }, [pathname]);

  // Always start with the accordions closed when the mobile menu is closed/reopened
  useEffect(() => {
    if (!open) setMobileOpen(null);
  }, [open]);

  // Add a soft shadow under the bar once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the desktop dropdowns on Escape
  useEffect(() => {
    if (!panelOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [panelOpen]);

  // Lock body scroll + close on Escape while the full-screen menu is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <>
      {/* ------------------------------ Top bar ------------------------------ */}
      <header
        onMouseLeave={() => setMenu(null)}
        style={panelOpen ? { backgroundColor: MEGA_BG } : undefined}
        className={[
          "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300",
          panelOpen
            ? "border-white/10 text-white"
            : onHero
              ? "border-white/20 bg-transparent text-white"
              : open
                ? "border-white/10 bg-transparent text-white"
                : "border-black/10 bg-white/95 text-neutral-900 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.25)] backdrop-blur",
        ].join(" ")}
      >
        <div className="mx-auto flex h-[88px] max-w-[1500px] items-center justify-between gap-4 px-5 sm:h-[104px] sm:px-8">
          {/* Logo in a round white badge so it reads on any background */}
          <Link href="/" onClick={close} aria-label={`${LOGO_ALT} home`} className="flex shrink-0 items-center">
            <span className="grid h-14 w-14 place-items-center rounded-full bg-white shadow-sm ring-1 ring-black/5 sm:h-[72px] sm:w-[72px] lg:h-20 lg:w-20">
              <Image
                src={LOGO_SRC}
                alt={LOGO_ALT}
                width={389}
                height={389}
                priority
                className="h-[94%] w-[94%] object-contain"
              />
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden flex-1 justify-end lg:flex" aria-label="Main">
            <ul className="flex items-center gap-8 xl:gap-12">
              {NAV_LINKS.map((l) => {
                const active = isActive(l.href) || (l.menu !== null && menu === l.menu);
                const linkClass = [
                  mono.className,
                  "relative block py-2 text-[13px] uppercase transition-opacity duration-200 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-current after:transition-transform after:duration-300 hover:opacity-70 hover:after:scale-x-100",
                  active ? "after:scale-x-100" : "after:scale-x-0",
                ].join(" ");

                return (
                  <li key={l.label} onMouseEnter={() => setMenu(l.menu)} className="flex items-center gap-1">
                    {l.href ? (
                      <Link
                        href={l.href}
                        aria-current={isActive(l.href) ? "page" : undefined}
                        onFocus={() => setMenu(l.menu)}
                        className={linkClass}
                      >
                        {l.label}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setMenu((m) => (m === l.menu ? null : l.menu))}
                        onFocus={() => setMenu(l.menu)}
                        aria-expanded={menu === l.menu}
                        aria-controls={`${l.menu}-menu`}
                        className={linkClass}
                      >
                        {l.label}
                      </button>
                    )}
                    {l.menu && (
                      <button
                        type="button"
                        onClick={() => setMenu((m) => (m === l.menu ? null : l.menu))}
                        aria-expanded={menu === l.menu}
                        aria-controls={`${l.menu}-menu`}
                        aria-label={menu === l.menu ? `Close ${l.label} menu` : `Open ${l.label} menu`}
                        className={`grid h-6 w-6 place-items-center rounded-full transition-colors ${light ? "hover:bg-white/10" : "hover:bg-black/5"}`}
                      >
                        <Chevron />
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Right side actions */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href="/cart"
              onClick={(e) => {
                if (!user) {
                  e.preventDefault();
                  toast.error("Please sign in to access your cart.");
                  router.push("/login?redirect=/cart");
                }
              }}
              aria-label={`Cart, ${effectiveCartCount} items`}
              className={[
                "relative flex h-11 w-11 items-center justify-center rounded-full border transition-colors",
                light ? "border-white/30 hover:bg-white/10" : "border-black/10 bg-white hover:border-black/25",
              ].join(" ")}
            >
              <CartIcon />
              {effectiveCartCount > 0 && (
                <span className={`absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-bold ${light ? "bg-white text-black" : "bg-neutral-900 text-white"}`}>
                  {effectiveCartCount}
                </span>
              )}
            </Link>

            {user ? (
              <div className="hidden items-center gap-2 sm:flex">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-1.5 rounded-full bg-[#f08a24]/15 border border-[#f08a24]/40 px-3.5 py-1.5 text-[12px] font-semibold uppercase tracking-wider text-[#f08a24] hover:bg-[#f08a24]/25 transition"
                  >
                    <span className="h-2 w-2 rounded-full bg-[#f08a24] animate-pulse" />
                    Admin
                  </Link>
                )}
                <Link
                  href="/orders"
                  className={`${mono.className} px-2.5 py-1.5 text-[13px] uppercase tracking-wide transition-opacity hover:opacity-70`}
                >
                  Orders
                </Link>
                <Link
                  href="/profile"
                  className={`${mono.className} px-2.5 py-1.5 text-[13px] uppercase tracking-wide transition-opacity hover:opacity-70`}
                >
                  {user.username.split(" ")[0]}
                </Link>
                <button
                  onClick={logout}
                  className={[
                    mono.className,
                    "rounded-full px-3.5 py-1.5 text-[12px] uppercase transition hover:opacity-75",
                    light ? "border border-white/30 text-white hover:bg-white/10" : "border border-black/20 text-[#2a231e] hover:bg-black/5"
                  ].join(" ")}
                >
                  Logout
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/login"
                  className={`${mono.className} hidden px-3 py-2 text-[13px] uppercase transition-opacity hover:opacity-70 sm:inline-block`}
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className={[
                    mono.className,
                    "hidden items-center gap-3 rounded-full px-6 py-3 text-[13px] uppercase transition-transform hover:scale-[1.03] active:scale-95 sm:inline-flex",
                    light ? "bg-white text-neutral-900" : "bg-neutral-900 text-white",
                  ].join(" ")}
                >
                  Sign up
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                </Link>
              </>
            )}

            {/* Menu / close button – phones & tablets only (desktop uses the nav above) */}
            <button
              type="button"
              onClick={() => {
                setMenu(null);
                setOpen((v) => !v);
              }}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={[
                "relative flex h-11 w-11 items-center justify-center rounded-full border transition-colors lg:hidden",
                open
                  ? "border-white bg-white text-neutral-900"
                  : light
                    ? "border-white/30 hover:bg-white/10"
                    : "border-black/10 bg-white hover:border-black/25",
              ].join(" ")}
            >
              <span className="relative block h-3.5 w-5 shrink-0">
                <span className={`absolute left-0 h-[2px] w-5 rounded bg-current transition-all duration-300 ${open ? "top-[6px] rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 top-[6px] h-[2px] w-5 rounded bg-current transition-all duration-200 ${open ? "opacity-0" : "opacity-100"}`} />
                <span className={`absolute left-0 h-[2px] w-5 rounded bg-current transition-all duration-300 ${open ? "top-[6px] -rotate-45" : "top-[12px]"}`} />
              </span>
            </button>
          </div>
        </div>

        {/* ------------------------- Desktop Brands menu ------------------------- */}
        <div
          id="brands-menu"
          aria-hidden={!brandsOpen}
          style={{ backgroundColor: MEGA_BG }}
          className={[
            "absolute inset-x-0 top-full hidden border-t border-white/10 text-white shadow-[0_40px_60px_-30px_rgba(0,0,0,0.6)] transition-all duration-300 ease-out lg:block",
            brandsOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
          ].join(" ")}
        >
          <div aria-hidden="true" className={`absolute inset-x-0 top-0 h-[2px] ${BRAND_LINE}`} />
          <div className="mx-auto max-w-[1500px] px-8 pb-10 pt-8">
            <ul className="grid grid-cols-5 gap-x-6 xl:gap-x-10">
              {shopBrands.map((b, i) => (
                <li
                  key={b.id}
                  style={{ transitionDelay: brandsOpen ? `${60 + i * 60}ms` : "0ms" }}
                  className={[
                    "transition-all duration-500",
                    brandsOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                  ].join(" ")}
                >
                  <Link
                    href={`/brands/${b.id}`}
                    tabIndex={brandsOpen ? 0 : -1}
                    className="group/b block"
                  >
                    <span className="block text-[15px] font-semibold uppercase tracking-wide text-white">
                      {b.name}
                    </span>
                    <span
                      className="mt-3 block h-[3px] w-8 rounded-full transition-all duration-500 group-hover/b:w-14"
                      style={{ background: b.color }}
                    />
                  
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* ------------------------- Desktop Shop mega menu ------------------------- */}
        <div
          id="shop-menu"
          aria-hidden={!shopOpen}
          style={{ backgroundColor: MEGA_BG }}
          className={[
            "absolute inset-x-0 top-full hidden border-t border-white/10 text-white shadow-[0_40px_60px_-30px_rgba(0,0,0,0.6)] transition-all duration-300 ease-out lg:block",
            shopOpen ? "visible translate-y-0 opacity-100" : "invisible -translate-y-2 opacity-0",
          ].join(" ")}
        >
          {/* four-brand colour line */}
          <div aria-hidden="true" className={`absolute inset-x-0 top-0 h-[2px] ${BRAND_LINE}`} />

          <div className="mx-auto max-w-[1500px] px-8 pb-12 pt-10">
            <div className="grid grid-cols-5 items-start gap-x-6 xl:gap-x-10">
              {shopBrands.map((b, i) => (
                <div
                  key={b.id}
                  style={{ transitionDelay: shopOpen ? `${60 + i * 60}ms` : "0ms" }}
                  className={[
                    "group/col min-w-0 transition-all duration-500",
                    shopOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
                  ].join(" ")}
                >
                  {/* Category heading with its colour bar */}
                  <Link
                    href={`/shop?category=${b.id}`}
                    tabIndex={shopOpen ? 0 : -1}
                    className="block text-[15px] font-semibold text-white"
                  >
                    {b.name}
                  </Link>
                  <span
                    className="mt-3 block h-[3px] w-8 rounded-full transition-all duration-500 group-hover/col:w-14"
                    style={{ background: b.color }}
                  />

                  {/* Products */}
                  <ul className="mt-5 space-y-2.5">
                    {b.items.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/shop/${p.id}`}
                          tabIndex={shopOpen ? 0 : -1}
                          className="block text-[14px] leading-snug text-white/65 transition-colors hover:text-white"
                        >
                          {p.name}
                        </Link>
                      </li>
                    ))}
                    <li className="pt-2">
                      <Link
                        href={`/shop?category=${b.id}`}
                        tabIndex={shopOpen ? 0 : -1}
                        className="inline-flex items-center gap-2 text-[14px] font-medium underline-offset-4 hover:underline"
                        style={{ color: b.color }}
                      >
                        Shop all
                        <SmallArrow />
                      </Link>
                    </li>
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* --------------------------- Full-screen menu (phones/tablets) ------------------------- */}
      <div
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        style={{ backgroundColor: MEGA_BG }}
        aria-hidden={!open}
        className={[
          "fixed inset-0 z-40 overflow-y-auto text-white transition-all duration-500 ease-out lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        ].join(" ")}
      >
        {/* four-brand colour line, same as desktop */}
        <div aria-hidden="true" className={`absolute inset-x-0 top-[88px] h-[2px] sm:top-[104px] ${BRAND_LINE}`} />
        {/* soft brand glow + dot grid */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-emerald-500/20 blur-[120px]" />
          <div className="absolute -bottom-48 -left-40 h-[520px] w-[520px] rounded-full bg-sky-500/20 blur-[120px]" />
          <div className="absolute bottom-0 right-1/3 h-[360px] w-[360px] rounded-full bg-amber-500/15 blur-[110px]" />
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage: "radial-gradient(rgba(255,255,255,.08) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
              maskImage: "radial-gradient(70% 70% at 60% 50%, black 0%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(70% 70% at 60% 50%, black 0%, transparent 100%)",
            }}
          />
        </div>

        <div
          onClick={(e) => e.target === e.currentTarget && close()}
          className="relative mx-auto flex min-h-full w-full max-w-[1400px] flex-col gap-10 px-5 pb-10 pt-[116px] sm:px-8 sm:pt-[146px]"
        >
          {/* Big links */}
          <nav aria-label="Menu" className="flex w-full flex-col">
            <p className={`${mono.className} mb-3 text-[12px] uppercase text-white/50`}>Menu</p>
            {NAV_LINKS.map((l, i) => {
              const expanded = l.menu !== null && mobileOpen === l.menu;
              const toggle = () => setMobileOpen(expanded ? null : l.menu);
              const rowClass = [
                mono.className,
                "group flex min-w-0 items-center gap-3 py-4 text-[clamp(1.125rem,5vw,1.5rem)] uppercase transition-colors hover:text-[color:var(--c)]",
                isActive(l.href) ? "text-[color:var(--c)]" : "text-white",
              ].join(" ");

              return (
                <div key={l.label} className="border-b border-white/10">
                  <div
                    style={{ transitionDelay: open ? `${120 + i * 70}ms` : "0ms", ["--c" as string]: l.color }}
                    className={[
                      "flex items-center gap-3 transition-all duration-500",
                      open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
                    ].join(" ")}
                  >
                    {l.href ? (
                      <Link href={l.href} onClick={close} tabIndex={open ? 0 : -1} className={rowClass}>
                        <span className="transition-transform duration-300 group-hover:translate-x-3">{l.label}</span>
                        {!l.menu && (
                          <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                            <ArrowIcon />
                          </span>
                        )}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={toggle}
                        tabIndex={open ? 0 : -1}
                        className={`${rowClass} flex-1 text-left`}
                      >
                        <span className="transition-transform duration-300 group-hover:translate-x-3">{l.label}</span>
                      </button>
                    )}

                    {l.menu && (
                      <button
                        type="button"
                        onClick={toggle}
                        aria-expanded={expanded}
                        aria-controls={`mobile-${l.menu}`}
                        aria-label={expanded ? `Hide ${l.label}` : `Show ${l.label}`}
                        tabIndex={open ? 0 : -1}
                        className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-white/25 text-white transition-colors hover:bg-white/10"
                      >
                        <span className={`transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}>
                          <Chevron size={18} />
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Brands accordion */}
                  {l.menu === "brands" && (
                    <div
                      id="mobile-brands"
                      aria-hidden={!expanded}
                      className={[
                        "grid transition-[grid-template-rows,opacity] duration-500 ease-out",
                        expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      ].join(" ")}
                    >
                      <div className="overflow-hidden">
                        <ul className="space-y-1 pb-6 pt-3">
                          {shopBrands.map((b) => (
                            <li key={b.id}>
                              <Link
                                href={`/brands/${b.id}`}
                                onClick={close}
                                tabIndex={open && expanded ? 0 : -1}
                                className="flex items-center gap-3 py-2.5 text-[15px] font-semibold uppercase tracking-wide text-white"
                              >
                                <span className="h-[3px] w-6 rounded-full" style={{ background: b.color }} />
                                {b.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}

                  {/* Shop accordion – collapsed by default, opens with the chevron */}
                  {l.menu === "shop" && (
                    <div
                      id="mobile-shop"
                      aria-hidden={!expanded}
                      className={[
                        "grid transition-[grid-template-rows,opacity] duration-500 ease-out",
                        expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                      ].join(" ")}
                    >
                      <div className="overflow-hidden">
                        <div className="grid gap-8 pb-6 pt-5 sm:grid-cols-2">
                          {shopBrands.map((b) => (
                            <div key={b.id}>
                              <Link
                                href={`/shop?category=${b.id}`}
                                onClick={close}
                                tabIndex={open && expanded ? 0 : -1}
                                className="block text-[15px] font-semibold text-white"
                              >
                                {b.name}
                              </Link>
                              <span className="mt-2 block h-[3px] w-8 rounded-full" style={{ background: b.color }} />
                              <ul className="mt-4 space-y-3">
                                {b.items.map((p) => (
                                  <li key={p.id}>
                                    <Link
                                      href={`/shop/${p.id}`}
                                      onClick={close}
                                      tabIndex={open && expanded ? 0 : -1}
                                      className="text-[15px] text-white/65 transition-colors hover:text-white"
                                    >
                                      {p.name}
                                    </Link>
                                  </li>
                                ))}
                                <li>
                                  <Link
                                    href={`/shop?category=${b.id}`}
                                    onClick={close}
                                    tabIndex={open && expanded ? 0 : -1}
                                    className="inline-flex items-center gap-2 text-[15px] font-medium underline-offset-4 hover:underline"
                                    style={{ color: b.color }}
                                  >
                                    Shop all {b.name}
                                    <SmallArrow />
                                  </Link>
                                </li>
                              </ul>
                            </div>
                          ))}
                          <Link
                            href="/shop"
                            onClick={close}
                            tabIndex={open && expanded ? 0 : -1}
                            className="inline-flex items-center gap-2 px-1 text-[15px] font-semibold underline underline-offset-4 sm:col-span-2"
                          >
                            View all products
                            <SmallArrow />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Account row – phones only (Login / Sign up live in the bar from sm up) */}
            <div
              style={{ transitionDelay: open ? "420ms" : "0ms" }}
              className={[
                "mt-8 flex flex-wrap items-center gap-3 transition-all duration-500 sm:hidden",
                open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
              ].join(" ")}
            >
              {user ? (
                <>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={close}
                      tabIndex={open ? 0 : -1}
                      className={`${mono.className} rounded-full bg-[#f08a24] text-black px-6 py-3 text-[13px] uppercase font-bold tracking-wider`}
                    >
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/profile"
                    onClick={close}
                    tabIndex={open ? 0 : -1}
                    className={`${mono.className} rounded-full border border-white/25 px-6 py-3 text-[13px] uppercase text-white`}
                  >
                    Profile
                  </Link>
                  <Link
                    href="/orders"
                    onClick={close}
                    tabIndex={open ? 0 : -1}
                    className={`${mono.className} rounded-full border border-white/25 px-6 py-3 text-[13px] uppercase text-white`}
                  >
                    My Orders
                  </Link>
                  <button
                    onClick={() => {
                      close();
                      logout();
                    }}
                    tabIndex={open ? 0 : -1}
                    className={`${mono.className} rounded-full bg-white/10 px-6 py-3 text-[13px] uppercase text-white`}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={close}
                    tabIndex={open ? 0 : -1}
                    className={`${mono.className} rounded-full border border-white/25 px-6 py-3 text-[13px] uppercase text-white transition-colors hover:bg-white/10`}
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={close}
                    tabIndex={open ? 0 : -1}
                    className={`${mono.className} rounded-full bg-white px-6 py-3 text-[13px] uppercase text-neutral-900`}
                  >
                    Sign up
                  </Link>
                </>
              )}
              <Link
                href="/cart"
                onClick={(e) => {
                  close();
                  if (!user) {
                    e.preventDefault();
                    toast.error("Please sign in to access your cart.");
                    router.push("/login?redirect=/cart");
                  }
                }}
                tabIndex={open ? 0 : -1}
                className={`${mono.className} flex items-center gap-2 rounded-full border border-white/25 px-6 py-3 text-[13px] uppercase text-white transition-colors hover:bg-white/10`}
              >
                <CartIcon />
                Cart{effectiveCartCount > 0 ? ` (${effectiveCartCount})` : ""}
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
