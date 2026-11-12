import type { Metadata } from "next";
import { display } from "@/lib/fonts";
import ContactForm from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact us | HubZone",
  description:
    "Message HubZone on WhatsApp, call us or visit us at Kolenchery, Perumbavoor Road, Arakkapady.",
};

/* -------------------------------------------------------------------------- */
/*  Details – edit here                                                        */
/* -------------------------------------------------------------------------- */

const PHONE_DISPLAY = "+91 87144 10040";
const PHONE_TEL = "tel:+918714410040";
const WHATSAPP = "https://api.whatsapp.com/send?phone=918714410040";
const INSTAGRAM_URL = "https://www.instagram.com/hub_zone_park?dlrf=N3k3bGRvYXp2bGJ0";
const INSTAGRAM_HANDLE = "@hub_zone_park";
const ADDRESS = "Kolenchery, Perumbavoor Road, Jai Bharat College Stop, Arakkapady";
const MAP_QUERY = "Jai Bharat College Stop, Arakkapady, Perumbavoor Road, Kolenchery";
const DIRECTIONS = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`;

/* -------------------------------------------------------------------------- */
/*  Icons                                                                      */
/* -------------------------------------------------------------------------- */

const p = {
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

const Phone = () => (
  <svg {...p}>
    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
  </svg>
);
const Chat = () => (
  <svg {...p}>
    <path d="M21 11.5a8.4 8.4 0 0 1-12.3 7.4L3 20.5l1.7-5.4A8.4 8.4 0 1 1 21 11.5Z" />
  </svg>
);
const Pin = () => (
  <svg {...p}>
    <path d="M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.5" />
  </svg>
);
const Insta = () => (
  <svg {...p}>
    <rect x="3" y="3" width="18" height="18" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
  </svg>
);

const CONTACTS = [
  { label: "Call us", value: PHONE_DISPLAY, href: PHONE_TEL, icon: <Phone />, external: false },
  { label: "WhatsApp", value: PHONE_DISPLAY, href: WHATSAPP, icon: <Chat />, external: true },
  { label: "Visit us", value: ADDRESS, href: DIRECTIONS, icon: <Pin />, external: true },
  { label: "Instagram", value: INSTAGRAM_HANDLE, href: INSTAGRAM_URL, icon: <Insta />, external: true },
];

/* -------------------------------------------------------------------------- */
/*  Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ContactPage() {
  return (
    <main className="bg-white text-neutral-900">
      {/* Hero – dark so the header stays readable */}
      <section className="bg-[#0e1a15] pb-14 pt-[120px] text-white sm:pb-20 sm:pt-[150px]">
        <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
          <h1 className={`${display.className} text-[clamp(2.5rem,7vw,4.5rem)] font-extrabold leading-[1] tracking-tight`}>
            Contact us
          </h1>
          <p className="mt-4 max-w-lg text-base text-white/70 sm:text-lg">
            Questions about an order or a product? Send us a message and we&rsquo;ll reply within a day.
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-[1200px] px-5 py-12 sm:px-8 sm:py-16 lg:py-20">
        <div className="grid gap-12 lg:grid-cols-5 lg:gap-16">
          {/* Form */}
          <div className="lg:col-span-3">
            <h2 className={`${display.className} text-2xl font-extrabold tracking-tight sm:text-3xl`}>Send us a message</h2>
            <p className="mt-2 text-neutral-500">We&rsquo;ll open WhatsApp with your message ready to send.</p>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>

          {/* Details */}
          <aside className="lg:col-span-2">
            <h2 className={`${display.className} text-2xl font-extrabold tracking-tight sm:text-3xl`}>Other ways to reach us</h2>

            <ul className="mt-6 divide-y divide-neutral-200 border-y border-neutral-200">
              {CONTACTS.map((c) => (
                <li key={c.label}>
                  <a
                    href={c.href}
                    {...(c.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="flex items-start gap-4 py-5 transition-colors hover:bg-neutral-50"
                  >
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-neutral-100 text-neutral-800">
                      {c.icon}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm text-neutral-500">{c.label}</span>
                      <span className="block break-words font-medium leading-snug text-neutral-900">{c.value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>

            <div className="mt-8 overflow-hidden rounded-2xl border border-neutral-200">
              <iframe
                title="HubZone location on the map"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="block h-64 w-full border-0"
              />
            </div>
            <p className="mt-4 text-sm text-neutral-500">Since 2018 &nbsp;|&nbsp; LIC NO: KL-02-118168</p>
          </aside>
        </div>
      </section>
    </main>
  );
}
