import type { ReactNode } from "react";
import { sans, serif } from "@/lib/shop-fonts";

export const WRAP = "mx-auto w-full max-w-[1240px] px-4 sm:px-7";

/** Page wrapper: cream background + the two shop fonts (exposed as --font-serif / --font-sans). */
export default function ShopShell({ children }: { children: ReactNode }) {
  return (
    <div
      className={`${serif.variable} ${sans.variable} min-h-screen overflow-x-hidden bg-[#fbf6ea] font-[family-name:var(--font-sans)] text-[#2a231e] antialiased`}
    >
      {children}
    </div>
  );
}

/** Dark section at the top of every shop page. It starts under your fixed header. */
export function ShopTop({ children, bottom = "pb-2" }: { children: ReactNode; bottom?: string }) {
  return (
    <header className="bg-[#2a231e] text-[#f6e9d0] [background-image:radial-gradient(900px_380px_at_85%_0,#6b3a24_0,rgba(107,58,36,.35)_45%,transparent_80%)]">
      <div className={`${WRAP} pt-[116px] sm:pt-[144px] lg:pt-[176px] ${bottom}`}>{children}</div>
    </header>
  );
}
