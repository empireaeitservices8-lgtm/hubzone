import type { Metadata } from "next";
import AboutClient from "./AboutClient";
import { getBreadcrumbSchema, SITE_NAME, SITE_URL } from "@/lib/seo";

export const metadata: Metadata = {
  title: "About Us | HubZone - Hybrid Universal Business Zone",
  description:
    "Learn about HubZone, our journey, Kerala branch network across Palakkad, Alappuzha, Nilambur, Kannur, Calicut, Thiruvananthapuram, and Thrissur, and our commitment to everyday quality.",
  alternates: {
    canonical: `${SITE_URL}/about`,
  },
  openGraph: {
    title: "About HubZone | Hybrid Universal Business Zone",
    description:
      "Transforming raw materials into high-quality goods across Ayurvedic wellness, fragrances, cookware, pure coffee, and cleaning solutions.",
    url: `${SITE_URL}/about`,
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: "/about.png",
        width: 1200,
        height: 630,
        alt: "About HubZone",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "About HubZone | Hybrid Universal Business Zone",
    description:
      "Transforming raw materials into high-quality goods across Ayurvedic wellness, fragrances, cookware, pure coffee, and cleaning solutions.",
    images: ["/about.png"],
  },
};

export default function AboutPage() {
  const breadcrumbSchema = getBreadcrumbSchema([
    { name: "Home", url: "/" },
    { name: "About Us", url: "/about" },
  ]);

  const aboutSchema = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About HubZone",
    url: `${SITE_URL}/about`,
    description:
      "HUBZONE is a leading manufacturer specializing in ayurvedic care, perfumes, kitchen essentials, Wayanad coffee, and cleaning products.",
    mainEntity: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/logo.png`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }}
      />
      <AboutClient />
    </>
  );
}
