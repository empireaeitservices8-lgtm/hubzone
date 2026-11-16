import Image from "next/image";
import Link from "next/link";
import { display } from "@/lib/fonts";

const BRANDS = [
  { id: "care", name: "HubCare", color: "#4caf50" },
  { id: "perfume", name: "HubNoir", color: "#955ce0" },
  { id: "cook", name: "HubCook", color: "#f08a24" },
  { id: "coffee", name: "HubCof", color: "#d4a24c" },
  { id: "wash", name: "HubWash", color: "#2fa8e8" },
];

const QUICK_LINKS = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "Brands", href: "/#brands" },
  { label: "Contact", href: "/contact" },
];

const INSTAGRAM_URL = "https://www.instagram.com/hub_zone_park?dlrf=N3k3bGRvYXp2bGJ0"; // TODO: replace with your handle

const Insta = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const Pin = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);

const Phone = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
);

const Arrow = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const HEADING = "mb-4 text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 sm:mb-5";

export default function Footer() {
  return (
    <footer id="contact" className="relative isolate overflow-hidden bg-neutral-950 text-neutral-300">
      {/* four-colour top line */}
      <div aria-hidden="true" className="flex h-[3px] gap-1">
        {BRANDS.map((b) => (
          <span key={b.id} className="h-full flex-1" style={{ background: b.color }} />
        ))}
      </div>

      {/* giant faint wordmark */}
      <span
        aria-hidden="true"
        className={`${display.className} pointer-events-none absolute -bottom-3 left-1/2 -z-10 -translate-x-1/2 select-none whitespace-nowrap text-[clamp(4.5rem,20vw,18rem)] font-extrabold leading-none tracking-[-0.05em] text-white opacity-[0.04] sm:-bottom-6`}
      >
        HubZone
      </span>

      <div className="mx-auto max-w-[1400px] px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-12 sm:px-8 sm:pt-16 lg:pt-20">
        {/* CTA strip */}
        <div className="mb-12 flex flex-col items-start justify-between gap-5 rounded-3xl bg-white/[0.06] p-6 ring-1 ring-white/10 backdrop-blur sm:mb-14 sm:gap-6 sm:rounded-[2rem] sm:p-8 md:flex-row md:items-center lg:p-10">
          <h2 className={`${display.className} max-w-xl text-2xl font-extrabold leading-tight tracking-tight text-white sm:text-3xl lg:text-4xl`}>
            Quality for every corner of your everyday life.
          </h2>
          <Link
            href="/shop"
            className="group inline-flex w-full items-center justify-between gap-3 rounded-full bg-white py-1.5 pl-6 pr-1.5 text-sm font-semibold text-neutral-900 transition-transform hover:scale-[1.03] active:scale-95 sm:w-auto sm:justify-start md:shrink-0"
          >
            Start shopping
            <span className="grid h-9 w-9 place-items-center rounded-full bg-neutral-900 text-white transition-transform duration-300 group-hover:translate-x-0.5">
              <Arrow />
            </span>
          </Link>
        </div>

        {/* Mobile: logo / links+brands side by side / address.  md: 4 cols.  lg: 12 cols. */}
        <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-4 md:gap-x-10 lg:grid-cols-12">
          {/* Logo + blurb + social */}
          <div className="col-span-2 md:col-span-4 lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-white ring-4 ring-white/10 sm:h-14 sm:w-14">
                {/* TODO: point to your HubZone logo */}
                <Image src="/logo.png" alt="HubZone logo" width={112} height={112} className="h-full w-full object-cover" />
              </span>
              <span className={`${display.className} text-2xl font-extrabold tracking-tight text-white`}>HubZone</span>
            </Link>
            <p className="mt-4 max-w-sm leading-relaxed text-neutral-400 sm:mt-5 md:max-w-xl lg:max-w-sm">
              Four everyday brands for care, perfumes, cooking, coffee and cleaning, all backed by the same standard of quality.
            </p>
            <p className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-neutral-400">
  <span>LIC NO: KL-02-118168</span>
  <span aria-hidden="true" className="h-1 w-1 rounded-full bg-neutral-600" />
  <span>Since 2018</span>
</p>
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="HubZone on Instagram"
              className="group mt-5 inline-flex items-center gap-3 rounded-full bg-white/10 py-1.5 pl-1.5 pr-5 text-sm font-semibold text-white ring-1 ring-white/10 transition hover:bg-white/15 sm:mt-6"
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-tr from-[#f9a43a] via-[#e1306c] to-[#833ab4] text-white transition-transform duration-300 group-hover:rotate-[12deg] group-hover:scale-110">
                <Insta />
              </span>
              Follow on Instagram
            </a>
          </div>

          {/* Links */}
          <nav aria-label="Explore" className="lg:col-span-2">
            <h3 className={HEADING}>Explore</h3>
            <ul>
              {QUICK_LINKS.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="inline-block py-1.5 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Our brands" className="lg:col-span-2">
            <h3 className={HEADING}>Our brands</h3>
            <ul>
              {BRANDS.map((b) => (
                <li key={b.id}>
                  <Link href={`/brands/${b.id}`} className="group inline-flex items-center gap-2.5 py-1.5 transition-colors hover:text-white">
                    <span className="h-2 w-2 shrink-0 rounded-full transition-transform duration-300 group-hover:scale-150" style={{ background: b.color }} />
                    {b.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Address + contact */}
          <div className="col-span-2 md:col-span-2 lg:col-span-4">
            <h3 className={HEADING}>Our address</h3>
            <div className="flex gap-3">
              <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-white">
                <Pin />
              </span>
              <address className="min-w-0 not-italic leading-relaxed">
                Kolenchery, Perumbavoor Road,
                <br />
                Jai Bharat College Stop,
                <br />
                Arakkapady
              </address>
            </div>

            <h3 className={`${HEADING} mt-8`}>Get in touch</h3>
            <a href="tel:+918714410040" className="group inline-flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-white transition-colors group-hover:bg-white group-hover:text-neutral-900">
                <Phone />
              </span>
              <span className={`${display.className} whitespace-nowrap text-lg font-bold tracking-tight text-white sm:text-xl`}>+91 87144 10040</span>
            </a>
          </div>
        </div>

        {/* Bottom bar */}
<div className="mt-12 border-t border-white/10 pt-6 text-sm text-neutral-500 sm:mt-14">
  <p>© 2026 Empire AE IT Services. All rights reserved.</p>
</div>
      </div>
    </footer>
  );
}
