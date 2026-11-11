"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { display } from "@/lib/fonts";

const BRANDS = [
  {
    id: "care", name: "HubCare", tag: "Ayurvedic hair & skin care",
    desc: "Herbal unisex products by Ayurvedic doctors, made with pure natural ingredients.",
    logo: "/logos/hub_care.webp", tint: "#e3f2df", ink: "#2e7d32", color: "#4caf50", span: "lg:col-span-7",
  },
  {
    id: "cook", name: "HubCook", tag: "Healthy, easy cooking",
    desc: "Stainless steel non-stick cookware for gas, induction and oven, plus PP5 oven-safe containers.",
    logo: "/logos/hub_cook.webp", tint: "#fde5cc", ink: "#c2570c", color: "#f08a24", span: "lg:col-span-5",
  },
  {
    id: "cof", name: "HubCof", tag: "100% pure Wayanad coffee",
    desc: "Zero chicory, no fillers. Just rich aroma and bold, authentic taste.",
    logo: "/logos/hubcof.webp", tint: "#f4e6c8", ink: "#8a5a14", color: "#d4a24c", span: "lg:col-span-5",
  },
  {
    id: "wash", name: "HubWash", tag: "Fresh, clean, every wash",
    desc: "Complete home cleaning solutions that keep every corner spotless and hygienic.",
    logo: "/logos/hubwash.webp", tint: "#d6edfb", ink: "#0b78b8", color: "#2fa8e8", span: "lg:col-span-7",
  },
];

/* Fires once when the element scrolls into view */
function useReveal<T extends HTMLElement>(threshold = 0.18) {
  const ref = useRef<T>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold }
    );
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

/* ------------------------------ Brand card ------------------------------ */
function BrandCard({ b, i }: { b: (typeof BRANDS)[number]; i: number }) {
  const { ref, shown } = useReveal<HTMLDivElement>();
  const d = (i % 2) * 140; // stagger within a row

  return (
    <div
      ref={ref}
      className={`hz-rv ${b.span}`}
      style={{
        opacity: shown ? 1 : 0,
        transform: shown ? "none" : "translateY(56px) scale(0.96)",
        transition: `opacity 800ms ease ${d}ms, transform 900ms cubic-bezier(.2,.8,.2,1) ${d}ms`,
      }}
    >
      <article
        className="group relative isolate flex h-full min-h-[340px] flex-col justify-between overflow-hidden rounded-[2rem] p-7 transition-[transform,box-shadow] duration-500 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-black/10 sm:min-h-[400px] sm:p-9"
        style={{ background: b.tint }}
      >
        {/* big faint name behind everything */}
        <span
          aria-hidden="true"
          className={`${display.className} pointer-events-none absolute right-5 top-2 -z-10 select-none whitespace-nowrap text-[clamp(4rem,9vw,7rem)] font-extrabold leading-none tracking-[-0.05em] opacity-[0.08] transition-all duration-700 group-hover:-translate-x-3 group-hover:opacity-[0.15]`}
          style={{ color: b.ink }}
        >
          {b.name}
        </span>

        {/* logo: rolls in, floats gently, tilts on hover */}
{/* logo: rolls in, floats gently, tilts on hover (kept fully inside the card) */}
<div className="pointer-events-none absolute right-6 top-6 -z-10 aspect-square w-[34%] max-w-[280px] sm:bottom-9 sm:right-9 sm:top-auto sm:w-[40%]">          <div
            className="hz-rv h-full w-full"
            style={{
              opacity: shown ? 1 : 0,
              transform: shown ? "rotate(0deg) translate(0,0) scale(1)" : "rotate(-40deg) translate(35%,35%) scale(0.6)",
              transition: `opacity 700ms ease ${d + 250}ms, transform 1300ms cubic-bezier(.2,.9,.25,1.15) ${d + 250}ms`,
            }}
          >
            <div className="hz-float relative h-full w-full" style={{ animation: `hz-float 6s ease-in-out ${i * -1.5}s infinite` }}>
              {/* slowly turning dashed ring */}
              <span
                aria-hidden="true"
                className="hz-float absolute -inset-[7%] rounded-full border-2 border-dashed opacity-40"
                style={{ borderColor: b.ink, animation: "hz-spin 40s linear infinite" }}
              />
              <div className="h-full w-full rounded-full bg-white shadow-2xl shadow-black/15 ring-8 ring-white/70 transition-transform duration-700 ease-out group-hover:-translate-x-2 group-hover:-translate-y-2 group-hover:rotate-[10deg] group-hover:scale-105">
                <Image src={b.logo} alt={`${b.name} logo`} width={640} height={640} className="h-full w-full rounded-full object-cover" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-[56%] sm:max-w-[52%]">
          <span className="mb-4 block h-1 w-10 rounded-full transition-all duration-500 group-hover:w-20" style={{ background: b.color }} />
          <h3 className={`${display.className} text-3xl font-extrabold tracking-tight text-neutral-950 sm:text-4xl`}>{b.name}</h3>
          <p className="mt-2 font-medium text-neutral-800">{b.tag}</p>
          <p className="mt-3 text-neutral-600">{b.desc}</p>
        </div>

        <Link
          href={`/shop?brand=${b.id}`}
          className="group/btn inline-flex w-fit items-center gap-3 rounded-full bg-neutral-900 py-1.5 pl-5 pr-1.5 text-sm font-semibold text-white transition-transform hover:scale-[1.03] active:scale-95"
        >
          Shop {b.name}
          <span className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-white transition-colors duration-300" style={{ color: b.ink }}>
            <span className="transition-transform duration-300 group-hover/btn:translate-x-0.5">
              <Arrow />
            </span>
          </span>
        </Link>
      </article>
    </div>
  );
}

/* -------------------------------- Section -------------------------------- */
export default function Brands() {
  const { ref, shown } = useReveal<HTMLDivElement>(0.3);
  const words = "Meet the brands inside HubZone".split(" ");

  return (
    <section id="brands" className="bg-white px-5 py-20 sm:px-8 sm:py-28">
      <style>{`
        @keyframes hz-float { 0%,100% { transform: translateY(0) rotate(0deg) } 50% { transform: translateY(-10px) rotate(2deg) } }
        @keyframes hz-spin { to { transform: rotate(360deg) } }
        @media (prefers-reduced-motion: reduce) {
          .hz-rv { transition: none !important; opacity: 1 !important; transform: none !important }
          .hz-float { animation: none !important }
        }
      `}</style>

      <div className="mx-auto max-w-[1400px]">
        {/* Heading: words rise one after another */}
        <div ref={ref} className="mb-8 flex flex-col justify-between gap-6 sm:mb-10 lg:flex-row lg:items-end">
          <h2 className={`${display.className} max-w-2xl text-[clamp(2.2rem,5vw,4rem)] font-extrabold leading-[1.02] tracking-[-0.03em] text-neutral-950`}>
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
            className="hz-rv max-w-md text-lg leading-relaxed text-neutral-600"
            style={{
              opacity: shown ? 1 : 0,
              transform: shown ? "none" : "translateY(16px)",
              transition: "opacity 900ms ease 500ms, transform 900ms ease 500ms",
            }}
          >
            Four everyday brands, each with its own focus and all backed by the same standard of quality.
          </p>
        </div>

        {/* four-colour line that draws itself */}
        <div aria-hidden="true" className="mb-10 flex h-[3px] gap-1 sm:mb-14">
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

        <div className="grid gap-4 sm:gap-5 md:grid-cols-2 lg:grid-cols-12">
          {BRANDS.map((b, i) => (
            <BrandCard key={b.id} b={b} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
