import type { CSSProperties } from "react";

/** Single source of truth for products. Used by the shop list and the product details page. */

export type CategoryId = "care" | "perfume" | "cook" | "coffee" | "wash";

export const CATEGORIES: { id: CategoryId; label: string; brand: string; tile: string; blurb: string }[] = [
  { id: "care", label: "HubCare", brand: "HUBCARE", tile: "#d6e5d3", blurb: "Ayurvedic hair & skin care" },
  { id: "perfume", label: "HubNoir", brand: "HUBNOIR", tile: "#c6b1e0", blurb: "Perfumes and Fragrances" },
  { id: "cook", label: "HubCook", brand: "HUBCOOK", tile: "#f3dcc0", blurb: "Healthy, easy cooking" },
  { id: "coffee", label: "HubCof", brand: "HUBCOF", tile: "#e6d2bc", blurb: "100% pure Wayanad coffee" },
  { id: "wash", label: "HubWash", brand: "HUBWASH", tile: "#d2e3ea", blurb: "Fresh, clean, every wash" },
];

// [id (= image file name = URL /shop/<id>), name, category, original price, offer price (or undefined), description (optional)]
type Row = [string, string, CategoryId, number, number?, string?];
const RAW: Row[] = [
  ["hair_oil", "Hair Oil 100 ml", "care", 550, 499],
    ["neelayamari_shampoo", "Neelayamari Shampoo 120 ml", "care", 329, 295],
  ["pain_oil", "Pain Oil 100 ml", "care", 540, 495],
  ["ayurveda_soap", "Ayurveda Soap 100 gm", "care", 199, 175],
  ["neelayamari", "Neelayamari Podi 100 gm", "care", 355, 325],
    ["mehandhi", "Mehandhi 100 gm", "care", 339, 310],
  ["sandal_soap", "Natural Skin Care Soap 75 gm", "care", 110],
    ["turmeric_soap", "Turmeric Soap 75 gm", "care", 99],
  ["mukhakanthi_soap", "Mughakanthi Soap 75 gm", "care", 110],
  ["mukhakanthi_powder", "Mukhakanthi Powder", "care", 320, 290],

  ["perfumes", "Perfumes 50 ml", "perfume", 699, 599],
  ["fragrances", "Fragrances 50 ml", "perfume", 699, 599],

  ["dosa_tawa", "Dosa Tawa", "cook", 1499, 1200],
  ["fry_pan", "Triply Fry Pan", "cook", 2200, 1999],
  ["bowl", "Uro Bowl", "cook", 799, 700],

  ["Wayanad-Coffee-125", "Wayanad Coffee (125g)", "coffee", 150],
  ["Wayanad-Coffee-250", "Wayanad Coffee (250g)", "coffee", 299],
  ["Wayanad-Coffee-500", "Wayanad Coffee (500g)", "coffee", 599],

  ["brass_cleaner", "Brass Cleaner", "wash", 155, 130],
  ["car_wash", "Car Wash", "wash", 145, 120],
  ["liquid_detergent", "Detergent Liquid", "wash", 155, 135],
  ["fabric_stiff", "Fabric Stiff", "wash", 110, 85],
  ["floor_cleaner", "Floor Cleaner", "wash", 145, 125],
  ["hand_wash", "Hand Wash", "wash", 135, 110],
  ["toilet_cleaner", "Toilet Cleaner", "wash", 140, 120],
];

/**
 * Photos per product, keyed by product id. Files live in /public/products/.
 *
 * - List ONLY the products that need something other than the default.
 *   Products not listed here use `/products/<id>.webp` (one image, as before).
 * - When a product is listed, this list REPLACES the default, so the first entry is the main image.
 * - Each path can have any extension (.jpg, .jpeg, .webp, .png), and you can mix them.
 * - Or leave the extension off ("/products/hair_oil_2") and the site tries jpg, jpeg, webp, png in order.
 * - Keep extensions lowercase (.jpg, not .JPG): Vercel and Linux hosts are case-sensitive.
 */
const IMAGES: Record<string, string[]> = {
  // Example: main image is a webp, two extra photos are jpg / jpeg
  // hair_oil: ["/products/hair_oil.webp", "/products/hair_oil_2.jpg", "/products/hair_oil_3.jpeg"],
  hair_oil: ["/products/hair_oil.jpeg", "/products/hair_oil2.jpeg"],
  ayurveda_soap: ["/products/ayurveda_soap.jpeg"],
  mehandhi: ["/products/mehandhi.jpeg"],
  neelayamari: ["/products/neelayamari.jpeg"], pain_oil: ["/products/pain_oil.jpeg"],
  mukhakanthi_powder: ["/products/mukhakanthi_powder.jpeg", "/products/mukhakanthi2.jpeg"],
  mukhakanthi_soap: ["/products/mukhakanthi_soap.jpeg", "/products/mukhakanthi_soap2.jpeg"],
  neelayamari_shampoo: ["/products/neelayamari_shampoo.jpeg", "/products/neelayamari_shampoo2.jpeg"],
  sandal_soap: ["/products/sandal_soap.jpeg", "/products/sandal_soap2.jpeg"],
  turmeric_soap: ["/products/turmeric_soap.jpeg", "/products/turmeric_soap2.jpeg"],
    perfumes: ["/products/perfumes.webp", "/products/perfumes2.jpeg"],

  // Example: main image is a jpg instead of webp (single image)
  // dosa_tawa: ["/products/dosa_tawa.jpg"],

  // Example: no extensions, auto-detected
  // fry_pan: ["/products/fry_pan", "/products/fry_pan_2", "/products/fry_pan_3"],
};

export type Product = {
  id: string;
  name: string;
  cat: CategoryId;
  price: number;
  offer?: number;
  desc?: string;
  sub?: string;
  img: string; // main image (always the first of `images`)
  images?: string[]; // all images, only set when a product has more than the default
};

/** All images of a product, main image first. Always returns at least one. */
export const getImages = (p: Product): string[] =>
  p.images && p.images.length ? p.images : [p.img];

export const SUBCATEGORIES: { id: string; label: string; cat: CategoryId; ids: string[] }[] = [
  { id: "hair-care", label: "Hair care", cat: "care", ids: ["hair_oil", "anti_dandruff", "mehandhi", "neelayamari"] },
  { id: "skin-body", label: "Skin & body", cat: "care", ids: ["ayurveda_soap"] },
  { id: "pain-relief", label: "Pain relief", cat: "care", ids: ["pain_oil", "pain_relief"] },

  { id: "perfumes", label: "Perfumes", cat: "perfume", ids: ["hubnoir"] },

  { id: "cookware", label: "Cookware", cat: "cook", ids: ["dosa_tawa", "fry_pan"] },
  { id: "bowls", label: "Bowls", cat: "cook", ids: ["bowl"] },

  { id: "wayanad-coffee", label: "Wayanad coffee", cat: "coffee", ids: ["Wayanad-Coffee-125", "Wayanad-Coffee-250", "Wayanad-Coffee-500"] },

  { id: "laundry", label: "Laundry", cat: "wash", ids: ["liquid_detergent", "fabric_stiff"] },
  { id: "home-cleaning", label: "Home cleaning", cat: "wash", ids: ["floor_cleaner", "toilet_cleaner", "brass_cleaner"] },
  { id: "car-hand-wash", label: "Car & hand wash", cat: "wash", ids: ["car_wash", "hand_wash"] },
];

export const PRODUCTS: Product[] = RAW.map(([id, name, cat, price, offer, desc]) => {
  const custom = IMAGES[id];
  return {
    id,
    name,
    cat,
    price,
    offer,
    desc,
    sub: SUBCATEGORIES.find((s) => s.ids.includes(id))?.id,
    img: custom?.[0] ?? `/products/${id}.webp`,
    images: custom && custom.length ? custom : undefined,
  };
});

export const WHATSAPP = "https://api.whatsapp.com/send?phone=918714410040";
export const whatsappLink = (message: string) => `${WHATSAPP}&text=${encodeURIComponent(message)}`;

export const inr = (n: number) => `₹${n.toLocaleString("en-IN")}`;
export const eff = (p: Product) => p.offer ?? p.price;
export const hasOffer = (p: Product) => p.offer !== undefined && p.offer < p.price;
export const discountPct = (p: Product) => (hasOffer(p) ? Math.round(((p.price - p.offer!) / p.price) * 100) : 0);

export const getProduct = (id: string) => PRODUCTS.find((p) => p.id === id);
export const getCategory = (id: CategoryId) => CATEGORIES.find((c) => c.id === id)!;

/** Tinted tile background (soft glow in the category colour). Inline style, so it never depends on Tailwind scanning. */
export const tileStyle = (color: string): CSSProperties => ({
  backgroundColor: color,
  backgroundImage: `radial-gradient(circle at 50% 38%, color-mix(in srgb, ${color} 30%, #fff) 0, ${color} 100%)`,
});