import type { Metadata } from "next";
import Hero from "@/components/Hero";
import Brands from "@/components/Brands";
import Achievements from "@/components/Achievements";

export const metadata: Metadata = {
  title: "HubZone | Hybrid Universal Business Zone",
  description: "HubCare, HubNoir, HubCook, HubCof and HubWash: four trusted brands in one zone.",
};

export default function Home() {
  return (
    <main>
      <Hero />
      <Brands />
      <Achievements/>
    </main>
  );
}
