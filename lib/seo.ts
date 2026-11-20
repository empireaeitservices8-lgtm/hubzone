/**
 * Centralized SEO configuration and JSON-LD schema generators for HubZone.
 */

export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://hubzone.in";
export const SITE_NAME = "HubZone";
export const DEFAULT_TITLE = "HubZone | Hybrid Universal Business Zone";
export const DEFAULT_DESCRIPTION =
  "HubZone is your premier destination for everyday quality: HubCare Ayurvedic hair & skin wellness, HubNoir luxury perfumes & fragrances, HubCook premium non-stick & triply cookware, HubCof 100% pure Wayanad coffee, and HubWash effective home cleaning solutions.";

export const DEFAULT_KEYWORDS = [
  "HubZone",
  "HubCare",
  "HubNoir",
  "HubCook",
  "HubCof",
  "HubWash",
  "Ayurvedic hair oil",
  "Neelayamari shampoo",
  "Herbal pain oil",
  "Ayurvedic soap",
  "Wayanad coffee",
  "Pure coffee no chicory",
  "Long lasting perfumes",
  "Non stick dosa tawa",
  "Triply fry pan",
  "Home cleaning liquid",
  "Kerala online shopping",
  "Herbal wellness products",
];

export const COMPANY_CONTACT = {
  phone: "+91 87144 10040",
  phoneRaw: "+918714410040",
  whatsapp: "https://api.whatsapp.com/send?phone=918714410040",
  instagram: "https://www.instagram.com/hub_zone_park",
  address: {
    streetAddress: "Kolenchery, Perumbavoor Road, Jai Bharat College Stop, Arakkapady",
    addressLocality: "Arakkapady, Perumbavoor",
    addressRegion: "Kerala",
    postalCode: "683556",
    addressCountry: "IN",
  },
};

/**
 * Organization Schema for HubZone
 */
export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    legalName: "HubZone Hybrid Universal Business Zone",
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: DEFAULT_DESCRIPTION,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: COMPANY_CONTACT.phoneRaw,
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["en", "ml"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY_CONTACT.address.streetAddress,
      addressLocality: COMPANY_CONTACT.address.addressLocality,
      addressRegion: COMPANY_CONTACT.address.addressRegion,
      postalCode: COMPANY_CONTACT.address.postalCode,
      addressCountry: COMPANY_CONTACT.address.addressCountry,
    },
    sameAs: [COMPANY_CONTACT.instagram],
  };
}

/**
 * WebSite Schema with SearchAction
 */
export function getWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_URL}/shop?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * BreadcrumbList Schema Generator
 */
export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SITE_URL}${item.url.startsWith("/") ? item.url : `/${item.url}`}`,
    })),
  };
}

/**
 * Product Schema Generator
 */
export function getProductSchema(product: {
  id: string;
  name: string;
  desc?: string;
  cat?: string;
  brand?: string;
  price: number;
  offer?: number;
  img?: string;
  images?: string[];
  status?: string;
  ingredients?: string;
}) {
  const currentPrice = product.offer !== undefined && product.offer !== null ? product.offer : product.price;
  const isOutOfStock = product.status === "out_of_stock";
  const imageUrl = product.img
    ? product.img.startsWith("http")
      ? product.img
      : `${SITE_URL}${product.img.startsWith("/") ? product.img : `/${product.img}`}`
    : `${SITE_URL}/logo.png`;

  const allImages = Array.isArray(product.images) && product.images.length > 0
    ? product.images.map((img) => (img.startsWith("http") ? img : `${SITE_URL}${img.startsWith("/") ? img : `/${img}`}`))
    : [imageUrl];

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: allImages,
    description: product.desc || `${product.name} available at ${SITE_NAME}`,
    sku: product.id,
    brand: {
      "@type": "Brand",
      name: product.brand || "HubZone",
    },
    offers: {
      "@type": "Offer",
      url: `${SITE_URL}/shop/${product.id}`,
      priceCurrency: "INR",
      price: currentPrice.toFixed(2),
      priceValidUntil: "2027-12-31",
      itemCondition: "https://schema.org/NewCondition",
      availability: isOutOfStock
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      seller: {
        "@type": "Organization",
        name: SITE_NAME,
      },
    },
    ...(product.ingredients ? { additionalProperty: [{ "@type": "PropertyValue", name: "Ingredients", value: product.ingredients }] } : {}),
  };
}

/**
 * LocalBusiness / Store Schema Generator
 */
export function getLocalBusinessSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: SITE_NAME,
    image: `${SITE_URL}/logo.png`,
    telephone: COMPANY_CONTACT.phoneRaw,
    url: SITE_URL,
    address: {
      "@type": "PostalAddress",
      streetAddress: COMPANY_CONTACT.address.streetAddress,
      addressLocality: COMPANY_CONTACT.address.addressLocality,
      addressRegion: COMPANY_CONTACT.address.addressRegion,
      postalCode: COMPANY_CONTACT.address.postalCode,
      addressCountry: COMPANY_CONTACT.address.addressCountry,
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: 10.0381,
      longitude: 76.4526,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "09:00",
        closes: "19:00",
      },
    ],
    priceRange: "₹₹",
    sameAs: [COMPANY_CONTACT.instagram],
  };
}
