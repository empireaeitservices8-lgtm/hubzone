"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import ShopShell, { ShopTop, WRAP } from "@/components/ShopShell";

export default function ProductDetailGuard({
  productId,
  productName,
  children,
}: {
  productId: string;
  productName?: string;
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      toast.error("Please sign in to view product details.");
      router.replace(`/login?redirect=${encodeURIComponent(`/shop/${productId}`)}`);
    }
  }, [user, loading, productId, router]);

  if (loading) {
    return (
      <ShopShell>
        <ShopTop bottom="pb-10 sm:pb-12">
          <div className="mb-[22px] h-5 w-40 animate-pulse rounded bg-[#f6e9d0]/15" />
          <div className="h-14 w-4/5 max-w-[640px] animate-pulse rounded-xl bg-[#f6e9d0]/15 sm:h-20" />
        </ShopTop>
        <main className={`${WRAP} pt-8 sm:pt-12 text-center py-20`}>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2a231e] border-t-transparent mx-auto" />
        </main>
      </ShopShell>
    );
  }

  if (!user) {
    return (
      <ShopShell>
        <ShopTop bottom="pb-10 sm:pb-12">
          <nav className="mb-[22px] flex items-center gap-2.5 text-sm text-[#f6e9d0]/65">
            <Link href="/shop" className="hover:text-[#f6e9d0]">Shop</Link>
            <span>/</span>
            <span>Protected</span>
          </nav>
          <h1 className="font-[family-name:var(--font-serif)] text-[length:clamp(36px,5vw,64px)] font-medium leading-[1.05]">
            Sign in to view details
          </h1>
        </ShopTop>
        <main className={`${WRAP} py-16 text-center`}>
          <div className="rounded-[28px] bg-white p-10 max-w-md mx-auto shadow-sm border border-[#2a231e]/10">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#fbf6ea] text-[#2a231e]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h2 className="font-[family-name:var(--font-serif)] text-2xl font-medium text-[#2a231e]">
              Account Required
            </h2>
            <p className="mt-2 text-sm text-[#6a5c4f]">
              Full specifications, ingredients, reviews, and ordering for {productName ? `"${productName}"` : "this product"} are available exclusively for signed-in members.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href={`/login?redirect=${encodeURIComponent(`/shop/${productId}`)}`}
                className="w-full rounded-full bg-[#2a231e] text-[#f6e9d0] px-6 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-[#b8613a] transition"
              >
                Sign in to view details
              </Link>
              <Link
                href="/shop"
                className="w-full rounded-full border border-[#2a231e]/20 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6a5c4f] hover:bg-neutral-100 transition"
              >
                ← Back to all products
              </Link>
            </div>
          </div>
        </main>
      </ShopShell>
    );
  }

  return <>{children}</>;
}

