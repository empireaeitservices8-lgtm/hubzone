import type { Metadata } from "next";
import Hero from "@/components/Hero";
import Brands from "@/components/Brands";

export const metadata: Metadata = {
  title: "HubZone | Hybrid Universal Business Zone",
  description: "HubCare, HubCook, HubCof and HubWash: four trusted brands in one zone.",
};

export default function Home() {
  return (
    <main>
      <Hero />
      <Brands />
    </main>
  );
}
