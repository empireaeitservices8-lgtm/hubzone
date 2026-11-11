import { Inter_Tight, JetBrains_Mono } from "next/font/google";

/* Tight grotesk for headlines and big type */
export const display = Inter_Tight({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

/* Monospace for nav links, buttons and small labels */
export const mono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});
