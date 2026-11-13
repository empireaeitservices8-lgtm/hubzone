"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { display } from "@/lib/fonts";

const BRANDS = [
  {
    id: "care", name: "HubCare", tag: "Herbal Unisex Body Care",
    desc: "Herbal unisex products made with pure natural ingredients.",
    logo: "/logos/hub_care.webp", tint: "#e3f2df", ink: "#2e7d32", color: "#4caf50",
  },
    {
    id: "noir", name: "HubNoir", tag: "Heritage Urban Bliss",
    desc: "Bold, long-lasting fragrances with rich notes, made for every mood and occasion.",
    logo: "/logos/hub_noir.png", tint: "#e9e1f3", ink: "#4a2a78", color: "#7e57c2",
  },
  {
    id: "cook", name: "HubCook", tag: "Home Universal Best Cook",
    desc: "Stainless steel non-stick cookware for gas, induction and oven, plus PP5 oven-safe containers.",
    logo: "/logos/hub_cook.webp", tint: "#fde5cc", ink: "#c2570c", color: "#f08a24",
  },
  {
    id: "cof", name: "HubCof", tag: "High Range Ultimate Beans Coffee",
    desc: "Zero chicory, no fillers. Just rich aroma and bold, authentic taste.",
    logo: "/logos/hubcof.webp", tint: "#f4e6c8", ink: "#8a5a14", color: "#d4a24c",
  },
  {
    id: "wash", name: "HubWash", tag: "Hygiene Universal Brilliance",
    desc: "Complete home cleaning solutions that keep every corner spotless and hygienic.",
    logo: "/logos/hubwash.webp", tint: "#d6edfb", ink: "#0b78b8", color: "#2fa8e8",
  },
];
type Brand = (typeof BRANDS)[number];

/* Fires once when the element scrolls into view */
function useReveal<T extends HTMLElement>(threshold = 0.2) {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && (setShown(true), io.disconnect()), { threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return { ref, shown };
}

const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const Plus = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" aria-hidden="true">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

/* Round logo: floats, with a slowly turning dashed ring, tilts when active */
function Logo({ b, i, active }: { b: Brand; i: number; active: boolean }) {
  return (
    <span className="hz-float relative block h-full w-full" style={{ animation: `hz-float 6s ease-in-out ${i * -1.5}s infinite` }}>
      <span
        aria-hidden="true"
        className="hz-float absolute -inset-[8%] rounded-full border-2 border-dashed opacity-50"
        style={{ borderColor: b.ink, animation: "hz-spin 40s linear infinite" }}
      />
      <span
        className={`block h-full w-full rounded-full bg-white shadow-xl shadow-black/10 ring-[6px] transition-transform duration-700 ease-out group-hover:rotate-[8deg] ${active ? "rotate-[10deg]" : ""}`}
        style={{ ["--tw-ring-color" as string]: b.tint }}
      >
        <Image src={b.logo} alt={`${b.name} logo`} width={400} height={400} className="h-full w-full rounded-full object-cover" />
      </span>
    </span>
  );
}

function ShopButton({ b, focusable }: { b: Brand; focusable: boolean }) {
  return (
    <Link
      href={`/shop?brand=${b.id}`}
      tabIndex={focusable ? 0 : -1}
      onClick={(e) => e.stopPropagation()}
      className="group/btn inline-flex w-fit items-center gap-3 rounded-full bg-neutral-900 py-1.5 pl-5 pr-1.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95"
    >
      Shop {b.name}
      <span className="grid h-8 w-8 place-items-center rounded-full bg-white" style={{ color: b.ink }}>
        <span className="transition-transform duration-300 group-hover/btn:translate-x-0.5">
          <Arrow />
        </span>
      </span>
    </Link>
  );
}

/* ------------------- Desktop: panels that stretch open ------------------- */
function Panel({ b, i, open, onOpen, onToggle }: { b: Brand; i: number; open: boolean; onOpen: () => void; onToggle: () => void }) {
  const LOGO_CLOSED = 96;
  const LOGO_OPEN = 150;
  const size = open ? LOGO_OPEN : LOGO_CLOSED;

  return (
    <article
      onClick={() => !open && onOpen()}
      className={`group relative isolate min-w-0 overflow-hidden rounded-[2.25rem] border-2 outline outline-1 outline-offset-4 transition-[flex-grow,background-color,box-shadow,outline-color] duration-700 ease-[cubic-bezier(.2,.8,.2,1)] ${open ? "flex-[3]" : "flex-1 cursor-pointer hover:bg-white"}`}
      style={{
        borderColor: b.color,
        outlineColor: open ? `${b.color}66` : "transparent",
        background: open ? b.tint : "#fff",
        boxShadow: open ? `0 28px 60px -28px ${b.color}` : "none",
      }}
    >
      {/* big faint name behind everything */}
      <span
        aria-hidden="true"
        className={`${display.className} pointer-events-none absolute -bottom-4 right-6 -z-10 select-none whitespace-nowrap text-[6.5rem] font-extrabold leading-none tracking-[-0.05em] transition-opacity duration-700 ${open ? "opacity-[0.06]" : "opacity-0"}`}
        style={{ color: b.ink }}
      >
        {b.name}
      </span>

      {/* logo glides from centre (closed) to the right (open) */}
      <div
        className="pointer-events-none absolute top-1/2 -translate-y-1/2 transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)]"
        style={{ width: size, height: size, left: open ? `calc(100% - ${LOGO_OPEN}px - 32px)` : `calc(50% - ${LOGO_CLOSED / 2}px)` }}
      >
        <Logo b={b} i={i} active={open} />
      </div>

      <div className="relative flex h-full flex-col justify-between p-5 2xl:p-7">
        <div className="flex items-start justify-between gap-3">
          <h3 className={`${display.className} text-xl font-extrabold tracking-tight text-neutral-950 2xl:text-2xl`}>{b.name}</h3>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
            aria-expanded={open}
            aria-label={`${open ? "Close" : "Open"} ${b.name}`}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 bg-white/60 transition-all duration-300 hover:scale-105 hover:bg-white"
            style={{ color: b.ink, borderColor: b.color, transform: open ? "rotate(45deg)" : undefined }}
          >
            <Plus />
          </button>
        </div>

        <div className="min-w-0 max-w-[52%]">
          <span className="mb-3 block h-1 rounded-full transition-all duration-500" style={{ background: b.color, width: open ? 64 : 32 }} />
          <p className="text-sm font-semibold leading-snug text-neutral-900 2xl:text-base">{b.tag}</p>

          <div className={`grid transition-[grid-template-rows] duration-500 ease-out ${open ? "grid-rows-[1fr] delay-200" : "grid-rows-[0fr]"}`}>
            <div className="overflow-hidden">
              <div className={`pt-2 transition-opacity duration-500 ${open ? "opacity-100 delay-300" : "opacity-0"}`}>
                <p className="text-[15px] leading-snug text-neutral-700">{b.desc}</p>
                <div className="mt-4">
                  <ShopButton b={b} focusable={open} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ------------------- Mobile / tablet: stacked, tap to open ------------------- */
function Row({ b, i, open, onToggle }: { b: Brand; i: number; open: boolean; onToggle: () => void }) {
  return (
    <article
      className="group overflow-hidden rounded-[2rem] border-2 transition-[background-color,box-shadow] duration-500"
      style={{ borderColor: b.color, background: open ? b.tint : "#fff", boxShadow: open ? `0 20px 44px -24px ${b.color}` : "none" }}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        aria-controls={`brand-${b.id}`}
        className="flex w-full items-center gap-4 p-4 text-left"
      >
        <span className="block h-20 w-20 shrink-0">
          <Logo b={b} i={i} active={open} />
        </span>
        <span className="min-w-0 flex-1">
          <span className={`${display.className} block text-2xl font-extrabold tracking-tight text-neutral-950`}>{b.name}</span>
          <span className="mt-0.5 block text-sm font-medium leading-snug text-neutral-700">{b.tag}</span>
        </span>
        <span
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 bg-white/60 transition-transform duration-300"
          style={{ color: b.ink, borderColor: b.color, transform: open ? "rotate(45deg)" : "none" }}
        >
          <Plus />
        </span>
      </button>

      <div id={`brand-${b.id}`} className={`grid transition-[grid-template-rows] duration-500 ease-out ${open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <div className="px-4 pb-5 transition-opacity duration-500" style={{ opacity: open ? 1 : 0 }}>
            <span className="mb-3 block h-1 w-12 rounded-full" style={{ background: b.color }} />
            <p className="leading-relaxed text-neutral-700">{b.desc}</p>
            <div className="mt-4">
              <ShopButton b={b} focusable={open} />
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* -------------------------------- Section -------------------------------- */
export default function Brands() {
  const { ref, shown } = useReveal<HTMLDivElement>(0.3);
  const grid = useReveal<HTMLDivElement>(0.15);
  const [openId, setOpenId] = useState<string | null>("care");
  const words = "Meet the brands inside HubZone".split(" ");
  const toggle = (id: string) => setOpenId((cur) => (cur === id ? null : id));

  return (
    <section id="brands" className="bg-white px-5 py-12 sm:px-8 sm:py-16">
      <style>{`
        @keyframes hz-float { 0%,100% { transform: translateY(0) rotate(0deg) } 50% { transform: translateY(-8px) rotate(2deg) } }
        @keyframes hz-spin { to { transform: rotate(360deg) } }
        @media (prefers-reduced-motion: reduce) {
          .hz-rv { transition: none !important; opacity: 1 !important; transform: none !important }
          .hz-float { animation: none !important }
        }
      `}</style>

      <div className="mx-auto max-w-[1400px]">
        {/* Heading: words rise one after another */}
        <div ref={ref} className="mb-6 flex flex-col justify-between gap-4 sm:mb-8 lg:flex-row lg:items-end">
          <h2 className={`${display.className} max-w-2xl text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.04] tracking-[-0.03em] text-neutral-950`}>
            {words.map((w, i) => (
              <span key={i} className="inline-block overflow-hidden pb-[0.12em] align-bottom">
                <span
                  className="hz-rv inline-block"
                  style={{
                    transform: shown ? "translateY(0)" : "translateY(110%)",
                    transition: `transform 800ms cubic-bezier(.2,.8,.2,1) ${i * 90}ms`,
                  }}
                >
                  {w}&nbsp;
                </span>
              </span>
            ))}
          </h2>
          <p
            className="hz-rv max-w-sm text-lg leading-relaxed text-neutral-600"
            style={{
              opacity: shown ? 1 : 0,
              transform: shown ? "none" : "translateY(16px)",
              transition: "opacity 900ms ease 500ms, transform 900ms ease 500ms",
            }}
          >
            Multiple brands, one standard of quality. Tap a brand to learn more.
          </p>
        </div>

        {/* four-colour line that draws itself */}
        <div aria-hidden="true" className="mb-8 flex h-[3px] gap-1">
          {BRANDS.map((b, i) => (
            <span
              key={b.id}
              className="hz-rv h-full flex-1 origin-left rounded-full"
              style={{
                background: b.color,
                transform: shown ? "scaleX(1)" : "scaleX(0)",
                transition: `transform 900ms cubic-bezier(.2,.8,.2,1) ${400 + i * 150}ms`,
              }}
            />
          ))}
        </div>

        <div
          ref={grid.ref}
          className="hz-rv"
          style={{
            opacity: grid.shown ? 1 : 0,
            transform: grid.shown ? "none" : "translateY(40px)",
            transition: "opacity 800ms ease, transform 900ms cubic-bezier(.2,.8,.2,1)",
          }}
        >
          {/* Desktop */}
          <div className="hidden h-[320px] gap-6 xl:flex 2xl:h-[340px]">
            {BRANDS.map((b, i) => (
              <Panel key={b.id} b={b} i={i} open={openId === b.id} onOpen={() => setOpenId(b.id)} onToggle={() => toggle(b.id)} />
            ))}
          </div>

          {/* Mobile / tablet */}
          <div className="grid gap-3 sm:grid-cols-2 sm:items-start sm:gap-4 xl:hidden">
            {BRANDS.map((b, i) => (
              <Row key={b.id} b={b} i={i} open={openId === b.id} onToggle={() => toggle(b.id)} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
