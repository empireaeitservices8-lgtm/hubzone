import Image from "next/image";
import Link from "next/link";
import { display, mono } from "@/lib/fonts";

/* Optional background media – put files in /public and set one of these.
   Leave both empty to use the animated dark background below. */
const BG_VIDEO = ""; // e.g. "/hero.mp4"
const BG_IMAGE = "/hero2.png"; // e.g. "/hero.jpg"

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.5'/%3E%3C/svg%3E\")";

export default function Hero() {
  return (
    <section className="relative isolate flex min-h-[100svh] overflow-hidden bg-[#07090b] text-[#f7f4f0]">
      <style>{`
        @keyframes hz-drift-a { 0%,100% { transform: translate3d(0,0,0) scale(1) } 50% { transform: translate3d(8%,10%,0) scale(1.2) } }
        @keyframes hz-drift-b { 0%,100% { transform: translate3d(0,0,0) scale(1.1) } 50% { transform: translate3d(-10%,-8%,0) scale(0.95) } }
        @media (prefers-reduced-motion: reduce) { .hz-anim { animation: none !important } }
      `}</style>

      {/* ------------------------------ Background ------------------------------ */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        {BG_VIDEO && <video className="absolute inset-0 h-full w-full object-cover" src={BG_VIDEO} autoPlay muted loop playsInline />}
        {BG_IMAGE && <Image src={BG_IMAGE} alt="" fill priority sizes="100vw" className="object-cover" />}

        {/* animated dark scene with the four brand colours (shown when no photo/video is set) */}
        {!BG_VIDEO && !BG_IMAGE && (
          <>
            <div className="hz-anim absolute -left-[10%] top-[5%] h-[60vmax] w-[60vmax] rounded-full bg-[#4caf50]/25 blur-[130px]" style={{ animation: "hz-drift-a 24s ease-in-out infinite" }} />
            <div className="hz-anim absolute -right-[10%] top-[-10%] h-[55vmax] w-[55vmax] rounded-full bg-[#2fa8e8]/25 blur-[130px]" style={{ animation: "hz-drift-b 30s ease-in-out infinite" }} />
            <div className="hz-anim absolute bottom-[-30%] left-[15%] h-[55vmax] w-[55vmax] rounded-full bg-[#f08a24]/20 blur-[130px]" style={{ animation: "hz-drift-b 34s ease-in-out infinite" }} />
            <div className="hz-anim absolute bottom-[-35%] right-[5%] h-[50vmax] w-[50vmax] rounded-full bg-[#d4a24c]/20 blur-[130px]" style={{ animation: "hz-drift-a 38s ease-in-out infinite" }} />
          </>
        )}

        {/* darken for legibility + grain */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/70" />
        <div className="absolute inset-0 opacity-[0.08] mix-blend-overlay" style={{ backgroundImage: GRAIN }} />
      </div>

      {/* -------------------------------- Content -------------------------------- */}
      <div className="mx-auto flex w-full max-w-[1500px] flex-col justify-center px-5 pb-14 pt-32 sm:px-8 sm:pt-40">
        <p className={`${mono.className} text-[clamp(0.95rem,1.5vw,1.3rem)] uppercase`}>Hybrid Universal Business Zone</p>

        <h1 className={`${display.className} mt-5 text-[clamp(3.4rem,13vw,13rem)] font-bold leading-[0.88] tracking-[-0.06em]`}>
          Four Brands.
          <br /> One Zone.
        </h1>

        <p className={`${display.className} mt-8 max-w-3xl text-[clamp(1.1rem,2vw,1.75rem)] font-medium leading-snug tracking-[-0.02em] text-white/90`}>
          Ayurvedic cosmetics, kitchen essentials, coffee beans and cleaning chemicals, all under one roof.
        </p>

        <div className="mt-10 flex flex-wrap items-center gap-3 sm:gap-4">
          <Link
            href="/shop"
            className={`${mono.className} inline-flex items-center gap-5 rounded-full bg-[#f7f4f0] px-7 py-4 text-sm uppercase text-neutral-900 transition-transform hover:scale-[1.03] active:scale-95 sm:px-8 sm:py-5`}
          >
            Shop all brands
            <span className="h-2 w-2 rounded-full bg-current" />
          </Link>
          <Link
            href="/contact"
            className={`${mono.className} inline-flex items-center gap-5 rounded-full bg-neutral-900/90 px-7 py-4 text-sm uppercase text-white ring-1 ring-white/10 transition-transform hover:scale-[1.03] active:scale-95 sm:px-8 sm:py-5`}
          >
            Get in touch
            <span className="h-2 w-2 rounded-full bg-current" />
          </Link>
        </div>
      </div>
    </section>
  );
}
