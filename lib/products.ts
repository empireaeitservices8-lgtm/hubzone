import type { CSSProperties } from "react";

/** Single source of truth for products. Used by the shop list and the product details page. */

export type CategoryId = "care" | "cook" | "coffee" | "wash";

export const CATEGORIES: { id: CategoryId; label: string; brand: string; tile: string; blurb: string }[] = [
  { id: "care", label: "Ayurvedic care", brand: "HUBCARE", tile: "#d6e5d3", blurb: "Ayurvedic hair & skin care" },
  { id: "cook", label: "Kitchen essentials", brand: "HUBCOOK", tile: "#f3dcc0", blurb: "Healthy, easy cooking" },
  { id: "coffee", label: "Wayanad coffee", brand: "HUBCOF", tile: "#e6d2bc", blurb: "100% pure Wayanad coffee" },
  { id: "wash", label: "Cleaning", brand: "HUBWASH", tile: "#d2e3ea", blurb: "Fresh, clean, every wash" },
];

// [id (= image file name = URL /shop/<id>), name, category, original price, offer price (or undefined), description (optional)]
type Row = [string, string, CategoryId, number, number?, string?];
const RAW: Row[] = [
  ["ayurveda_soap", "Ayurveda Soap 100 gm", "care", 199, 175],
  ["brass_cleaner", "Brass Cleaner", "wash", 130],
  ["car_wash", "Car Wash", "wash", 120],
  ["liquid_detergent", "Detergent Liquid", "wash", 135],
  ["dosa_tawa", "Dosa Tawa", "cook", 1499, 1200],
  ["anti_dandruff", "Evrly Anti-Dandruff Shampoo 100 ml", "care", 235],
  ["fabric_stiff", "Fabric Stiff", "wash", 85],
  ["floor_cleaner", "Floor Cleaner", "wash", 125],
  ["hair_oil", "Hair Oil 100 ml", "care", 550, 499],
  ["hand_wash", "Hand Wash", "wash", 110],
  ["pain_relief", "Joot", "care", 220],
  ["mehandhi", "Mehandhi 100 gm", "care", 339, 310],
  ["neelambari", "Neelambari 100 gm", "care", 355, 325],
  ["pain_oil", "Pain Oil 100 ml", "care", 540, 495],
  ["toilet_cleaner", "Toilet Cleaner", "wash", 120],
  ["fry_pan", "Triply Fry Pan", "cook", 2200, 1999],
  ["bowl", "Uro Bowl", "cook", 799, 700],
  ["Wayanad-Coffee-125", "Wayanad Coffee (125g)", "coffee", 150],
  ["Wayanad-Coffee-250", "Wayanad Coffee (250g)", "coffee", 299],
  ["Wayanad-Coffee-500", "Wayanad Coffee (500g)", "coffee", 599],
];

export type Product = {
  id: string;
  name: string;
  cat: CategoryId;
  price: number;
  offer?: number;
  desc?: string;
  img: string;
};

export const PRODUCTS: Product[] = RAW.map(([id, name, cat, price, offer, desc]) => ({
  id,
  name,
  cat,
  price,
  offer,
  desc,
  img: `/products/${id}.webp`,
}));

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
