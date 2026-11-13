"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { display, mono } from "@/lib/fonts";

type Slide = {
  image: string; // file in /public (for a video slide it is the poster shown until the video loads)
  video?: string; // optional video in /public, plays muted in a loop as the slide background
  duration?: number; // ms this slide stays on screen (defaults to INTERVAL)
  position: string; // where the picture is anchored when it has to be cropped ("cover" only)
  eyebrow: string;
  title: [string, string]; // two lines
  text: string;
  cta: { label: string; href: string };
  showLogo?: boolean; // big circular logo on the right (first slide only)
};

const SLIDES: Slide[] = [
  {
    image: "/hero2.png", // poster / fallback image for the video
    video: "/hero.mp4", // put your video in /public/hero.mp4 (or change the name here)
    duration: 10000, // first slide stays longer so the video can play
    position: "50% 50%",
    eyebrow: "Welcome to the",
    title: ["Hybrid Universal", "Business Zone."],
    text: "Multiple brands. One roof.",
    cta: { label: "Shop all brands", href: "/shop" },
    showLogo: true,
  },
  {
    image: "/ayurvedic.jpg",
    position: "70% 65%",
    eyebrow: "HubCare Products",
    title: ["Rooted in Ayurveda,", "made for everyday care."],
    text: "Hair oil, soap, facial pack, pain oil and more, made the traditional way.",
    cta: { label: "Shop HubCare", href: "/shop?category=care" },
  },
  {
    image: "/hero_noir.jpeg", // add your HubNoir image to /public with this name (or change it here)
    position: "70% 50%",
    eyebrow: "HubNoir Perfumes",
    title: ["Dark notes.", "Bold presence."],
    text: "Signature fragrances that linger long after you leave.",
    cta: { label: "Shop HubNoir", href: "/shop?brand=noir" },
  },
  {
    image: "/kitchen.jpg",
    position: "60% 50%",
    eyebrow: "HubCook Essentials",
    title: ["Built for", "every meal."],
    text: "Premium cookware that lasts for years.",
    cta: { label: "Shop HubCook", href: "/shop" },
  },
  {
    image: "/coffee_beans.jpg",
    position: "75% 50%",
    eyebrow: "HubCof Coffee",
    title: ["Roasted dark.", "Brewed bold."],
    text: "Freshly roasted beans for a richer cup.",
    cta: { label: "Shop HubCof", href: "/shop" },
  },
  {
    image: "/cleaning.jpg",
    position: "50% 55%",
    eyebrow: "HubWash Chemicals",
    title: ["Spotless.", "Every surface."],
    text: "Professional-grade clean, effortless results.",
    cta: { label: "Shop HubWash", href: "/shop" },
  },
];

const INTERVAL = 6000; // default ms per slide

/**
 * How the picture fits behind the text:
 *  "cover"   = fills the whole screen, edges may be cropped (most immersive)
 *  "contain" = the WHOLE picture is always visible, with dark bars if the shapes differ
 * MOBILE_FIT is for phones/tablets, DESKTOP_FIT for lg screens and up.
 * Text always sits on top of the picture.
 */
const MOBILE_FIT: "cover" | "contain" = "cover";
const DESKTOP_FIT: "cover" | "contain" = "cover";

// Same green -> orange as the HUBZone logo (lightened a little so it reads on the dark background)
const LOGO_GRADIENT = "bg-gradient-to-r from-[#5cbf4f] to-[#f59a3c] bg-clip-text text-transparent";

// Staggered fade-up used by each piece of text
const reveal = (active: boolean, delay: string) =>
  `transition-all duration-700 ease-out ${active ? `translate-y-0 opacity-100 ${delay}` : "translate-y-5 opacity-0"}`;

// Static strings so Tailwind can see them
const MOBILE_FIT_CLASS = MOBILE_FIT === "cover" ? "object-cover [object-position:var(--pos)]" : "object-contain";
const DESKTOP_FIT_CLASS =
  DESKTOP_FIT === "cover" ? "lg:object-cover lg:[object-position:var(--pos)]" : "lg:object-contain";
const FIT_CLASS = `${MOBILE_FIT_CLASS} ${DESKTOP_FIT_CLASS}`;

/** Background video: plays only while its slide is showing. */
function HeroVideo({
  src,
  poster,
  position,
  active,
}: {
  src: string;
  poster: string;
  position: string;
  active: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    v.muted = true; // browsers only autoplay muted video
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (active && !reduceMotion) {
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [active]);

  return (
    <video
      ref={ref}
      src={src}
      poster={poster}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full ${FIT_CLASS}`}
      style={{ ["--pos" as string]: position }}
    />
  );
}

export default function Hero() {
  const [index, setIndex] = useState(0);

  const go = useCallback((i: number) => setIndex((i + SLIDES.length) % SLIDES.length), []);

  return (
    <section
      className="relative isolate flex min-h-[100svh] overflow-hidden bg-[#07090b] text-[#f7f4f0]"
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured"
    >
      <style>{`
        @keyframes hz-progress { from { transform: scaleX(0) } to { transform: scaleX(1) } }
        .hz-bar { transform-origin: left; animation: hz-progress ${INTERVAL}ms linear forwards }
        @media (prefers-reduced-motion: reduce) {
          .hz-bar { animation: none; transform: scaleX(1) }
        }
      `}</style>

      {/* ------------------------------ Pictures (behind the text on every screen size) ------------------------------ */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {SLIDES.map((s, i) => (
          <div
            key={s.image}
            className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${i === index ? "opacity-100" : "opacity-0"}`}
          >
            {s.video ? (
              <HeroVideo src={s.video} poster={s.image} position={s.position} active={i === index} />
            ) : (
              <Image
                src={s.image}
                alt=""
                fill
                priority={i === 0}
                sizes="100vw"
                className={FIT_CLASS}
                style={{ ["--pos" as string]: s.position }}
              />
            )}
          </div>
        ))}

        {/* Phones/tablets: shade from the bottom up, so text over the lower part stays readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/15 lg:hidden" />
        {/* Desktop: light shade only on the left where text sits, plus a little at the very top and bottom */}
        <div className="absolute inset-0 hidden bg-gradient-to-r from-black/60 via-black/20 to-transparent lg:block" />
        <div className="absolute inset-x-0 top-0 hidden h-36 bg-gradient-to-b from-black/35 to-transparent lg:block" />
        <div className="absolute inset-x-0 bottom-0 hidden h-40 bg-gradient-to-t from-black/45 to-transparent lg:block" />
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
                className={`col-start-1 row-start-1 grid w-full items-center gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-8 ${active ? "" : "pointer-events-none"}`}
              >
                {/* LEFT: text */}
                <div className="max-w-4xl">
                  <div className={`flex items-center gap-3 ${reveal(active, "delay-200")}`}>
                    <p className={`${mono.className} text-[clamp(0.7rem,1vw,0.85rem)] uppercase tracking-[0.22em] text-white [text-shadow:0_1px_14px_rgba(0,0,0,0.7)]`}>
                      {s.eyebrow}
                    </p>
                    <span className="h-px w-12 bg-white/40" />
                  </div>

                  {/* First slide: title uses the logo colours. Other slides: cream text.
                      (drop-shadow instead of text-shadow, because text-shadow shows through gradient text) */}
                  <h1
                    className={`${display.className} mt-4 text-[clamp(2.25rem,6vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.05em] sm:mt-5 ${
                      s.showLogo
                        ? `w-fit pb-[0.08em] drop-shadow-[0_2px_20px_rgba(0,0,0,0.7)] ${LOGO_GRADIENT}`
                        : "text-[#f7f4f0] [text-shadow:0_2px_26px_rgba(0,0,0,0.7)]"
                    } ${reveal(active, "delay-300")}`}
                  >
                    {s.title[0]}
                    <br />
                    {s.title[1]}
                  </h1>

                  <p
                    className={`${display.className} mt-4 max-w-md text-[clamp(1rem,1.3vw,1.2rem)] font-medium leading-snug tracking-[-0.01em] text-white [text-shadow:0_1px_16px_rgba(0,0,0,0.75)] sm:mt-5 ${reveal(active, "delay-500")}`}
                  >
                    {s.text}
                  </p>

                  <div className={`mt-6 flex flex-wrap items-center gap-3 sm:mt-8 ${reveal(active, "delay-700")}`}>
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
                    <div className="grid h-24 w-24 place-items-center rounded-full bg-white shadow-[0_25px_70px_-10px_rgba(0,0,0,0.65)] ring-8 ring-white/20 sm:h-40 sm:w-40 lg:h-[min(20rem,42svh)] lg:w-[min(20rem,42svh)] xl:h-[min(24rem,46svh)] xl:w-[min(24rem,46svh)]">
                      <Image
                        src="/logo.png"
                        alt="HubZone logo"
                        width={389}
                        height={389}
                        priority
                        className="h-[94%] w-[94%] object-contain"
                      />
                    </div>

                    {/* Caption in the exact logo colours: dark green "HUB" + orange gradient "Zone".
                        Sits on a white pill, because the dark green would disappear on a dark background. */}
                    <p
                      className={`${display.className} mt-3 rounded-full bg-white px-5 py-1.5 text-[clamp(1.1rem,2.2vw,2.2rem)] font-extrabold leading-none tracking-[-0.02em] shadow-[0_10px_30px_-8px_rgba(0,0,0,0.5)] sm:mt-4 sm:px-6 sm:py-2`}
                    >
                      <span className="text-[#1f5a1d]">HUB</span>
                      <span className="ml-[0.12em] bg-gradient-to-r from-[#f7a23e] to-[#b5501a] bg-clip-text text-transparent">
                        Zone
                      </span>
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
                      style={{ animationDuration: `${s.duration ?? INTERVAL}ms` }}
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
