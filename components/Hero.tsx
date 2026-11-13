"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useState } from "react";
import { display, mono } from "@/lib/fonts";

type Slide = {
  image: string; // file in /public
  position: string; // CSS object-position, keeps the subject in frame
  eyebrow: string;
  title: [string, string]; // two lines
  text: string;
  cta: { label: string; href: string };
  showLogo?: boolean; // big circular logo on the right (first slide only)
};

const SLIDES: Slide[] = [
  {
    image: "/hero2.png", // change to any image you want for the welcome slide
    position: "50% 50%",
    eyebrow: "Welcome to the",
    title: ["Hybrid Universal", "Business Zone."],
    text: "Five brands. One roof.",
    cta: { label: "Shop all brands", href: "/shop" },
    showLogo: true,
  },
  {
    image: "/ayurvedic.jpg",
    position: "70% 65%",
    eyebrow: "HubCare Products",
    title: ["Ancient wisdom,", "for your skin."],
    text: "Plant-based care, made the traditional way.",
    cta: { label: "Shop cosmetics", href: "/shop" },
  },
  {
    image: "/hero_noir.jpeg", // add your HubNoir image to /public with this name (or change it here)
    position: "70% 50%",
    eyebrow: "HubNoir Perfumes",
    title: ["Dark notes.", "Bold presence."],
    text: "Signature fragrances that linger long after you leave.",
    cta: { label: "Shop perfumes", href: "/shop?brand=noir" },
  },
  {
    image: "/kitchen.jpg",
    position: "60% 50%",
    eyebrow: "HubCook Essentials",
    title: ["Built for", "every meal."],
    text: "Premium cookware that lasts for years.",
    cta: { label: "Shop kitchen", href: "/shop" },
  },
  {
    image: "/coffee_beans.jpg",
    position: "75% 50%",
    eyebrow: "HubCof Coffee",
    title: ["Roasted dark.", "Brewed bold."],
    text: "Freshly roasted beans for a richer cup.",
    cta: { label: "Shop coffee", href: "/shop" },
  },
  {
    image: "/cleaning.jpg",
    position: "50% 55%",
    eyebrow: "HubWash Chemicals",
    title: ["Spotless.", "Every surface."],
    text: "Professional-grade clean, effortless results.",
    cta: { label: "Shop cleaning", href: "/shop" },
  },
];

const INTERVAL = 6000; // ms per slide

// Same green -> orange as the HUBZone logo (lightened a little so it reads on the dark photo)
const LOGO_GRADIENT = "bg-gradient-to-r from-[#5cbf4f] to-[#f59a3c] bg-clip-text text-transparent";

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E\")";

// Staggered fade-up used by each piece of text
const reveal = (active: boolean, delay: string) =>
  `transition-all duration-700 ease-out ${active ? `translate-y-0 opacity-100 ${delay}` : "translate-y-5 opacity-0"}`;

export default function Hero() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  const go = useCallback((i: number) => setIndex((i + SLIDES.length) % SLIDES.length), []);

  return (
    <section
      className="relative isolate flex min-h-[100svh] overflow-hidden bg-[#07090b] text-[#f7f4f0]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured"
    >
      <style>{`
        @keyframes hz-progress { from { transform: scaleX(0) } to { transform: scaleX(1) } }
        .hz-bar { transform-origin: left; animation: hz-progress ${INTERVAL}ms linear forwards }
        @keyframes hz-zoom { from { transform: scale(1) } to { transform: scale(1.08) } }
        .hz-zoom { animation: hz-zoom ${INTERVAL + 1500}ms ease-out forwards }
        @media (prefers-reduced-motion: reduce) {
          .hz-bar { animation: none; transform: scaleX(1) }
          .hz-zoom { animation: none }
        }
      `}</style>

      {/* ------------------------------ Backgrounds ------------------------------ */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {SLIDES.map((s, i) => (
          <div
            key={s.image}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === index ? "opacity-100" : "opacity-0"}`}
          >
            <Image
              src={s.image}
              alt=""
              fill
              priority={i === 0}
              sizes="100vw"
              className={`object-cover ${i === index ? "hz-zoom" : ""}`}
              style={{ objectPosition: s.position, animationPlayState: paused ? "paused" : "running" }}
            />
          </div>
        ))}

        {/* Dark gradient on the text side + top/bottom, so text is always readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/10 sm:from-black/80 sm:via-black/45" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/40" />
        <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
      </div>

      {/* -------------------------------- Content -------------------------------- */}
      <div className="mx-auto flex w-full max-w-[1500px] flex-col justify-between px-5 pb-6 pt-24 sm:px-8 sm:pb-8 sm:pt-28 lg:pt-24">
        {/* All slides share one grid cell so height never jumps between slides */}
        <div className="grid flex-1 items-center">
          {SLIDES.map((s, i) => {
            const active = i === index;
            return (
              <div
                key={s.title[0]}
                aria-hidden={!active}
                className={`col-start-1 row-start-1 grid w-full items-center gap-8 lg:grid-cols-[minmax(0,1fr)_auto] ${active ? "" : "pointer-events-none"}`}
              >
                {/* LEFT: text */}
                <div className="max-w-4xl">
                  <div className={`flex items-center gap-3 ${reveal(active, "delay-200")}`}>
                    <p className={`${mono.className} text-[clamp(0.7rem,1vw,0.85rem)] uppercase tracking-[0.22em] text-white`}>
                      {s.eyebrow}
                    </p>
                    <span className="h-px w-12 bg-white/40" />
                  </div>

                  {/* First slide: title uses the logo colours. Other slides: cream text.
                      (drop-shadow instead of text-shadow, because text-shadow shows through gradient text) */}
                  <h1
                    className={`${display.className} mt-5 text-[clamp(2.5rem,6vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.05em] ${
                      s.showLogo
                        ? `w-fit pb-[0.08em] drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)] ${LOGO_GRADIENT}`
                        : "text-[#f7f4f0] [text-shadow:0_2px_30px_rgba(0,0,0,0.55)]"
                    } ${reveal(active, "delay-300")}`}
                  >
                    {s.title[0]}
                    <br />
                    {s.title[1]}
                  </h1>

                  <p
                    className={`${display.className} mt-5 max-w-md text-[clamp(1rem,1.3vw,1.2rem)] font-medium leading-snug tracking-[-0.01em] text-white [text-shadow:0_1px_18px_rgba(0,0,0,0.6)] ${reveal(active, "delay-500")}`}
                  >
                    {s.text}
                  </p>

                  <div className={`mt-8 flex flex-wrap items-center gap-3 ${reveal(active, "delay-700")}`}>
                    <Link
                      href={s.cta.href}
                      tabIndex={active ? 0 : -1}
                      className={`${mono.className} inline-flex items-center gap-4 rounded-full bg-[#f7f4f0] px-6 py-3.5 text-xs uppercase text-neutral-900 transition-transform hover:scale-[1.03] active:scale-95`}
                    >
                      {s.cta.label}
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    </Link>
                    <Link
                      href="/contact"
                      tabIndex={active ? 0 : -1}
                      className={`${mono.className} inline-flex items-center gap-4 rounded-full bg-black/50 px-6 py-3.5 text-xs uppercase text-white ring-1 ring-white/25 backdrop-blur-md transition-transform hover:scale-[1.03] active:scale-95`}
                    >
                      Get in touch
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                    </Link>
                  </div>
                </div>

                {/* RIGHT: big circular logo (first slide only) */}
                {s.showLogo && (
                  <div
                    className={`order-first flex flex-col items-center text-center lg:order-none lg:pr-6 xl:pr-16 ${reveal(active, "delay-500")}`}
                  >
                    <div className="grid h-36 w-36 place-items-center rounded-full bg-white shadow-[0_25px_70px_-10px_rgba(0,0,0,0.65)] ring-8 ring-white/20 sm:h-48 sm:w-48 lg:h-[min(20rem,42svh)] lg:w-[min(20rem,42svh)] xl:h-[min(24rem,46svh)] xl:w-[min(24rem,46svh)]">
                      {/* logo-centered.png is the logo cropped to a tight square, so it sits dead centre */}
                      <Image
                        src="/logo.png"
                        alt="HubZone logo"
                        width={389}
                        height={389}
                        priority
                        className="h-[94%] w-[94%] object-contain"
                      />
                    </div>
                    <p
                      className={`${display.className} mt-4 text-[clamp(1.25rem,2.2vw,2.2rem)] font-bold tracking-[-0.02em] drop-shadow-[0_2px_18px_rgba(0,0,0,0.5)] ${LOGO_GRADIENT}`}
                    >
                      Hybrid Universal Business Zone
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Controls: progress bars + counter + arrows */}
        <div className="mt-6 flex items-center gap-4 sm:gap-6">
          <div className="flex flex-1 gap-2">
            {SLIDES.map((s, i) => (
              <button
                key={s.title[0]}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}: ${s.eyebrow}`}
                aria-current={i === index}
                className="group relative h-6 max-w-24 flex-1"
              >
                <span className="absolute inset-x-0 top-1/2 h-[3px] -translate-y-1/2 overflow-hidden rounded-full bg-white/25 group-hover:bg-white/40">
                  {i === index && (
                    <span
                      key={index}
                      className="hz-bar block h-full w-full rounded-full bg-white"
                      style={{ animationPlayState: paused ? "paused" : "running" }}
                      onAnimationEnd={() => go(index + 1)}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>

          <span className={`${mono.className} hidden text-xs uppercase tracking-widest text-white/80 sm:block`}>
            0{index + 1} / 0{SLIDES.length}
          </span>

          <div className="flex gap-2">
            <button
              onClick={() => go(index - 1)}
              aria-label="Previous slide"
              className="grid h-10 w-10 place-items-center rounded-full bg-black/50 ring-1 ring-white/25 backdrop-blur-md transition-transform hover:scale-105 active:scale-95"
            >
              ←
            </button>
            <button
              onClick={() => go(index + 1)}
              aria-label="Next slide"
              className="grid h-10 w-10 place-items-center rounded-full bg-[#f7f4f0] text-neutral-900 transition-transform hover:scale-105 active:scale-95"
            >
              →
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
