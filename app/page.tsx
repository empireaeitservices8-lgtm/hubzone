import type { Metadata } from "next";
import Hero from "@/components/Hero";
import Brands from "@/components/Brands";
import Achievements from "@/components/Achievements";
import { DEFAULT_DESCRIPTION, DEFAULT_TITLE, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "HubZone | Hybrid Universal Business Zone - Ayurvedic, Fragrances, Cookware, Coffee & Care",
  description: DEFAULT_DESCRIPTION,
  alternates: {
    canonical: SITE_URL,
  },
  openGraph: {
    type: "website",
    url: SITE_URL,
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    siteName: SITE_NAME,
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 800,
        alt: "HubZone Hybrid Universal Business Zone",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/logo.png"],
  },
};

export default function Home() {
  return (
    <main>
      <Hero />
      <Brands />
      <Achievements />
    </main>
  );
}
