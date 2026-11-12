"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { display, mono } from "@/lib/fonts";
import { useCallback, useEffect, useState } from "react";

/* -------------------------------------------------------------------------- */
/*  Config – edit these to match your project                                  */
/* -------------------------------------------------------------------------- */

const LOGO_SRC = "/logo.png"; // file lives in /public/logo.png
const LOGO_ALT = "HubZone";
const CONTACT_EMAIL = "hello@yourstore.com";
const MEGA_BG = "#0e1a15"; // header + panel colour when Shop is open. Change to any colour you like

/* Shop categories (brands) and their subcategories.
   Links go to /shop?brand=<id>&category=<slug> – make your shop page filter on these. */
const SHOP_BRANDS = [
  {
    id: "care",
    name: "HubCare",
    tag: "Ayurvedic hair & skin care",
    logo: "/logos/hub_care.webp",
    tint: "#e3f2df",
    ink: "#2e7d32",
    color: "#4caf50",
    sub: [
      { label: "Soaps", hint: "Ayurveda Soap", slug: "soap" },
      { label: "Hair Care", hint: "Hair Oil, Shampoo", slug: "hair-care" },
      { label: "Herbal Powders", hint: "Mehandi, Neelayamari", slug: "powders" },
      { label: "Pain Relief", hint: "Pain Oil, Joot", slug: "pain-relief" },
    ],
  },
  {
    id: "cook",
    name: "HubCook",
    tag: "Healthy, easy cooking",
    logo: "/logos/hub_cook.webp",
    tint: "#fde5cc",
    ink: "#c2570c",
    color: "#f08a24",
    sub: [
      { label: "Fry Pans", hint: "Stainless steel", slug: "fry-pans" },
      { label: "Tawas", hint: "Non-stick", slug: "tawas" },
      { label: "Bowls & Containers", hint: "Uro bowl, oven-safe", slug: "bowls" },
    ],
  },
  {
    id: "cof",
    name: "HubCof",
    tag: "100% pure Wayanad coffee",
    logo: "/logos/hubcof.webp",
    tint: "#f4e6c8",
    ink: "#8a5a14",
    color: "#d4a24c",
    sub: [
      { label: "Coffee Jars", hint: "125g, 250g", slug: "jars" },
      { label: "Coffee Pouch", hint: "500g", slug: "pouch" },
    ],
  },
  {
    id: "wash",
    name: "HubWash",
    tag: "Fresh, clean, every wash",
    logo: "/logos/hubwash.webp",
    tint: "#d6edfb",
    ink: "#0b78b8",
    color: "#2fa8e8",
    sub: [
      { label: "Home Cleaners", hint: "Brass, Toilet cleaner", slug: "home-cleaners" },
      { label: "Laundry", hint: "Detergent, Fabric stiffener", slug: "laundry" },
      { label: "Car Care", hint: "Car wash", slug: "car-care" },
      { label: "Hand Wash", hint: "Moisturizing", slug: "hand-wash" },
    ],
  },
];

// `color` is the hover colour of the big links in the mobile menu (taken from the four brands)
const NAV_LINKS = [
  { label: "Home", href: "/", color: "#2e7d32", mega: false },
  { label: "About Us", href: "/about", color: "#c2570c", mega: false },
  { label: "Shop", href: "/shop", color: "#8a5a14", mega: true },
  { label: "Contact Us", href: "/contact", color: "#0b78b8", mega: false },
];

const SOCIALS = [
  { label: "LinkedIn", href: "#", icon: "in" },
  { label: "Instagram", href: "#", icon: "ig" },
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
  const pathname = usePathname();
  const [open, setOpen] = useState(false); // full-screen menu (phones/tablets)
  const [shopOpen, setShopOpen] = useState(false); // desktop mega menu
  const [mobileShop, setMobileShop] = useState(false); // mobile accordion
  const [scrolled, setScrolled] = useState(false);

  const close = useCallback(() => setOpen(false), []);
  const onHero = !scrolled && !open && !shopOpen; // transparent + white text over the hero
  const light = onHero || shopOpen; // white text/buttons over the hero or the coloured panel
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  // Close menus when the page changes
  useEffect(() => {
    setShopOpen(false);
    setOpen(false);
  }, [pathname]);

  // Add a soft shadow under the bar once the page scrolls
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mega menu on Escape
  useEffect(() => {
    if (!shopOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setShopOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [shopOpen]);

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
        onMouseLeave={() => setShopOpen(false)}
        style={shopOpen ? { backgroundColor: MEGA_BG } : undefined}
        className={[
          "fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300",
          shopOpen
            ? "border-white/10 text-white"
            : onHero
              ? "border-white/20 bg-transparent text-white"
              : open
                ? "border-transparent bg-transparent text-neutral-900"
                : "border-black/10 bg-white/95 text-neutral-900 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.25)] backdrop-blur",
        ].join(" ")}
      >
        <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between gap-4 px-5 sm:h-[88px] sm:px-8">
          {/* Logo on a white badge so it reads on any background */}
          <Link href="/" onClick={close} aria-label={`${LOGO_ALT} home`} className="flex shrink-0 items-center">
            <span className="flex items-center rounded-2xl bg-white px-3 py-1.5 shadow-sm ring-1 ring-black/5 sm:px-4 sm:py-2">
              <Image src={LOGO_SRC} alt={LOGO_ALT} width={320} height={96} priority className="h-9 w-auto sm:h-11 lg:h-12" />
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden flex-1 justify-end lg:flex" aria-label="Main">
            <ul className="flex items-center gap-8 xl:gap-12">
              {NAV_LINKS.map((l) => {
                const active = isActive(l.href) || (l.mega && shopOpen);
                return (
                  <li key={l.href} onMouseEnter={() => setShopOpen(l.mega)} className="flex items-center gap-1">
                    <Link
                      href={l.href}
                      aria-current={isActive(l.href) ? "page" : undefined}
                      onFocus={() => setShopOpen(l.mega)}
                      className={[
                        mono.className,
                        "relative block py-2 text-[13px] uppercase transition-opacity duration-200 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:origin-left after:bg-current after:transition-transform after:duration-300 hover:opacity-70 hover:after:scale-x-100",
                        active ? "after:scale-x-100" : "after:scale-x-0",
                      ].join(" ")}
                    >
                      {l.label}
                    </Link>
                    {l.mega && (
                      <button
                        type="button"
                        onClick={() => setShopOpen((v) => !v)}
                        aria-expanded={shopOpen}
                        aria-controls="shop-menu"
                        aria-label={shopOpen ? "Close shop categories" : "Open shop categories"}
                        className={`grid h-6 w-6 place-items-center rounded-full transition-colors ${light ? "hover:bg-white/10" : "hover:bg-black/5"}`}
                      >
                        <span className={`transition-transform duration-300 ${shopOpen ? "rotate-180" : ""}`}>
                          <Chevron />
                        </span>
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
              aria-label={`Cart, ${cartCount} items`}
              className={[
                "relative grid h-11 w-11 place-items-center rounded-full border transition-colors",
                light ? "border-white/30 hover:bg-white/10" : "border-black/10 bg-white hover:border-black/25",
              ].join(" ")}
            >
              <CartIcon />
              {cartCount > 0 && (
                <span className={`absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full px-1 text-[11px] font-bold ${light ? "bg-white text-black" : "bg-neutral-900 text-white"}`}>
                  {cartCount}
                </span>
              )}
            </Link>

            <Link
              href="/login"
              className={`${mono.className} hidden px-3 py-2 text-[13px] uppercase transition-opacity hover:opacity-70 sm:inline-block`}
            >
              Login
            </Link>

            <Link
              href="/signup"
              className={[
                mono.className,
                "hidden items-center gap-3 rounded-full px-6 py-3 text-[13px] uppercase transition-transform hover:scale-[1.03] active:scale-95 sm:inline-flex",
                light ? "bg-white text-neutral-900" : "bg-neutral-900 text-white",
              ].join(" ")}
            >
              Sign up
              <span className="h-1.5 w-1.5 rounded-full bg-current" />
            </Link>

            {/* Menu / close button – phones & tablets only (desktop uses the nav above) */}
            <button
              type="button"
              onClick={() => {
                setShopOpen(false);
                setOpen((v) => !v);
              }}
              aria-expanded={open}
              aria-controls="site-menu"
              aria-label={open ? "Close menu" : "Open menu"}
              className={[
                "relative grid h-11 w-11 place-items-center rounded-full border transition-colors lg:hidden",
                open
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : light
                    ? "border-white/30 hover:bg-white/10"
                    : "border-black/10 bg-white hover:border-black/25",
              ].join(" ")}
            >
              <span className="relative block h-3.5 w-5">
                <span className={`absolute left-0 h-[2px] w-5 rounded bg-current transition-all duration-300 ${open ? "top-[6px] rotate-45" : "top-0"}`} />
                <span className={`absolute left-0 top-[6px] h-[2px] w-5 rounded bg-current transition-all duration-200 ${open ? "opacity-0" : "opacity-100"}`} />
                <span className={`absolute left-0 h-[2px] w-5 rounded bg-current transition-all duration-300 ${open ? "top-[6px] -rotate-45" : "top-[12px]"}`} />
              </span>
            </button>
          </div>
        </div>

       {/* ------------------------- Desktop mega menu ------------------------- */}
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
    <div className="grid grid-cols-4 gap-10">
      {SHOP_BRANDS.map((b, i) => (
        <div
          key={b.id}
          style={{ transitionDelay: shopOpen ? `${60 + i * 60}ms` : "0ms" }}
          className={[
            "group/col transition-all duration-500",
            shopOpen ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0",
          ].join(" ")}
        >
          {/* Column heading = brand, with its colour bar */}
          <Link
            href={`/shop?brand=${b.id}`}
            tabIndex={shopOpen ? 0 : -1}
            className="block text-[15px] font-semibold text-white"
          >
            {b.name}
          </Link>
          <span
            className="mt-3 block h-[3px] w-8 rounded-full transition-all duration-500 group-hover/col:w-14"
            style={{ background: b.color }}
          />

          {/* Subcategories */}
          <ul className="mt-5 space-y-3.5">
            {b.sub.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/shop?brand=${b.id}&category=${s.slug}`}
                  tabIndex={shopOpen ? 0 : -1}
                  className="text-[15px] text-white/65 transition-colors hover:text-white"
                >
                  {s.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href={`/shop?brand=${b.id}`}
                tabIndex={shopOpen ? 0 : -1}
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
        aria-hidden={!open}
        className={[
          "fixed inset-0 z-40 overflow-y-auto bg-[#f7f8f5]/90 text-neutral-900 backdrop-blur-2xl transition-all duration-500 ease-out lg:hidden",
          open ? "visible opacity-100" : "invisible opacity-0",
        ].join(" ")}
      >
        {/* pastel ambient light + dot grid */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -right-40 -top-40 h-[560px] w-[560px] rounded-full bg-emerald-200/60 blur-[120px]" />
          <div className="absolute -bottom-48 -left-40 h-[520px] w-[520px] rounded-full bg-sky-200/60 blur-[120px]" />
          <div className="absolute bottom-0 right-1/3 h-[360px] w-[360px] rounded-full bg-amber-200/40 blur-[110px]" />
          <div
            className="absolute inset-0 opacity-60"
            style={{
              backgroundImage: "radial-gradient(rgba(0,0,0,.13) 1px, transparent 1px)",
              backgroundSize: "26px 26px",
              maskImage: "radial-gradient(70% 70% at 60% 50%, black 0%, transparent 100%)",
              WebkitMaskImage: "radial-gradient(70% 70% at 60% 50%, black 0%, transparent 100%)",
            }}
          />
        </div>

        <div
          onClick={(e) => e.target === e.currentTarget && close()}
          className="relative mx-auto flex min-h-full max-w-[1400px] flex-col gap-10 px-5 pb-10 pt-[110px] sm:px-8 sm:pt-[130px]"
        >
          {/* Big links */}
          <nav aria-label="Menu" className="flex flex-col">
            <p className="mb-4 text-sm font-medium text-neutral-500">Menu</p>
            {NAV_LINKS.map((l, i) => (
              <div key={l.href}>
                <div
                  style={{ transitionDelay: open ? `${120 + i * 70}ms` : "0ms", ["--c" as string]: l.color }}
                  className={[
                    "flex items-center gap-3 transition-all duration-500",
                    open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
                  ].join(" ")}
                >
                  <Link
                    href={l.href}
                    onClick={close}
                    tabIndex={open ? 0 : -1}
                    className={[
                      display.className,
                      "group flex items-center gap-4 py-1 text-[clamp(2.5rem,11vw,6rem)] font-extrabold leading-[1.05] tracking-tight transition-colors hover:text-[color:var(--c)]",
                      isActive(l.href) ? "text-[color:var(--c)]" : "text-neutral-950",
                    ].join(" ")}
                  >
                    <span className="transition-transform duration-300 group-hover:translate-x-3">{l.label}</span>
                    {!l.mega && (
                      <span className="opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <ArrowIcon />
                      </span>
                    )}
                  </Link>

                  {l.mega && (
                    <button
                      type="button"
                      onClick={() => setMobileShop((v) => !v)}
                      aria-expanded={mobileShop}
                      aria-controls="mobile-shop"
                      aria-label={mobileShop ? "Hide shop categories" : "Show shop categories"}
                      tabIndex={open ? 0 : -1}
                      className="grid h-11 w-11 place-items-center rounded-full border border-black/15 bg-white/70 backdrop-blur transition-colors hover:bg-white"
                    >
                      <span className={`transition-transform duration-300 ${mobileShop ? "rotate-180" : ""}`}>
                        <Chevron size={18} />
                      </span>
                    </button>
                  )}
                </div>

                {/* Shop accordion */}
                {l.mega && (
                  <div
                    id="mobile-shop"
                    className={`grid transition-[grid-template-rows] duration-500 ease-out ${mobileShop ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
                  >
                    <div className="overflow-hidden">
                      <div className="space-y-3 pb-4 pt-3">
                        {SHOP_BRANDS.map((b) => (
                          <div key={b.id} className="rounded-2xl p-4" style={{ background: b.tint }}>
                            <Link
                              href={`/shop?brand=${b.id}`}
                              onClick={close}
                              tabIndex={open && mobileShop ? 0 : -1}
                              className="flex items-center gap-3"
                            >
                              <span className="h-10 w-10 shrink-0 overflow-hidden rounded-full bg-white ring-2 ring-white/80">
                                <Image src={b.logo} alt="" width={80} height={80} className="h-full w-full object-cover" />
                              </span>
                              <span className="min-w-0">
                                <span className={`${display.className} block text-lg font-extrabold leading-tight`}>{b.name}</span>
                                <span className="block truncate text-[13px] text-neutral-600">{b.tag}</span>
                              </span>
                            </Link>
                            <div className="mt-3 flex flex-wrap gap-2">
                              {b.sub.map((s) => (
                                <Link
                                  key={s.slug}
                                  href={`/shop?brand=${b.id}&category=${s.slug}`}
                                  onClick={close}
                                  tabIndex={open && mobileShop ? 0 : -1}
                                  className="rounded-full bg-white/85 px-3.5 py-1.5 text-[13.5px] font-medium text-neutral-900 transition-colors hover:bg-white"
                                  style={{ boxShadow: `inset 0 0 0 1px ${b.color}55` }}
                                >
                                  {s.label}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                        <Link
                          href="/shop"
                          onClick={close}
                          tabIndex={open && mobileShop ? 0 : -1}
                          className="inline-flex items-center gap-2 px-1 text-[15px] font-semibold underline underline-offset-4"
                        >
                          View all products
                          <SmallArrow />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}

            {/* Account row – phones only (Login / Sign up live in the bar from sm up) */}
            <div
              style={{ transitionDelay: open ? "420ms" : "0ms" }}
              className={[
                "mt-8 flex flex-wrap items-center gap-3 transition-all duration-500 sm:hidden",
                open ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0",
              ].join(" ")}
            >
              <Link
                href="/login"
                onClick={close}
                tabIndex={open ? 0 : -1}
                className="rounded-full border border-black/15 bg-white/70 px-6 py-3 text-[15px] font-medium backdrop-blur transition-colors hover:bg-white"
              >
                Login
              </Link>
              <Link
                href="/signup"
                onClick={close}
                tabIndex={open ? 0 : -1}
                className="rounded-full bg-neutral-900 px-6 py-3 text-[15px] font-semibold text-white shadow-lg shadow-black/15"
              >
                Sign up
              </Link>
              <Link
                href="/cart"
                onClick={close}
                tabIndex={open ? 0 : -1}
                className="flex items-center gap-2 rounded-full border border-black/15 bg-white/70 px-6 py-3 text-[15px] font-medium backdrop-blur transition-colors hover:bg-white"
              >
                <CartIcon />
                Cart{cartCount > 0 ? ` (${cartCount})` : ""}
              </Link>
            </div>
          </nav>

          {/* Get in touch card */}
          <aside
            style={{ transitionDelay: open ? "300ms" : "0ms" }}
            className={[
              "relative w-full overflow-hidden rounded-[28px] bg-white p-6 text-neutral-900 shadow-2xl shadow-black/10 ring-1 ring-black/5 transition-all duration-500 sm:p-8",
              open ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
            ].join(" ")}
          >
            <div aria-hidden="true" className={`absolute inset-x-0 top-0 h-1 ${BRAND_LINE}`} />

            <h2 className={`${display.className} text-4xl font-extrabold tracking-tight sm:text-5xl`}>
              Get in touch <span aria-hidden="true">👋</span>
            </h2>
            <p className="mt-3 text-neutral-500">Questions about an order or a product? We reply within a day.</p>

            <div className="mt-7 flex items-center justify-between gap-4">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                tabIndex={open ? 0 : -1}
                className="break-all text-lg font-semibold tracking-tight underline decoration-black/20 underline-offset-4 transition-colors hover:decoration-black"
              >
                {CONTACT_EMAIL}
              </a>
              <div className="flex shrink-0 gap-2">
                {SOCIALS.map((s) => (
                  <a
                    key={s.label}
                    href={s.href}
                    aria-label={s.label}
                    tabIndex={open ? 0 : -1}
                    className="grid h-10 w-10 place-items-center rounded-full border border-neutral-300 text-sm font-bold transition-colors hover:border-neutral-900 hover:bg-neutral-900 hover:text-white"
                  >
                    {s.icon === "in" ? (
                      "in"
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="5" />
                        <circle cx="12" cy="12" r="4" />
                        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" stroke="none" />
                      </svg>
                    )}
                  </a>
                ))}
              </div>
            </div>

            {/* Image / promo area – swap the gradient for an <Image> of your store */}
            <div className="mt-7 aspect-[16/10] overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-200 via-amber-100 to-sky-200" />

            <Link
              href="/contact"
              onClick={close}
              tabIndex={open ? 0 : -1}
              className="mt-6 flex items-center justify-between rounded-full bg-neutral-900 px-6 py-4 text-[15px] font-semibold text-white transition-transform hover:scale-[1.01] active:scale-[0.99]"
            >
              Let&apos;s talk
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
            </Link>
          </aside>
        </div>
      </div>
    </>
  );
}