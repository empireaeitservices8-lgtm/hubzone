"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import ShopShell, { ShopTop, WRAP } from "@/components/ShopShell";
import { TileArt } from "@/components/ProductCard";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { eff, getCategory, getProduct, hasOffer, inr, tileStyle, type Product } from "@/lib/products";

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a1.5 1.5 0 0 0 1.5 1.4h7a1.5 1.5 0 0 0 1.5-1.4L18 7M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

const BagIcon = () => (
  <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 7h12l-1.2 12.2a1.5 1.5 0 0 1-1.5 1.3H8.7a1.5 1.5 0 0 1-1.5-1.3L6 7Z" />
    <path d="M9 7V6a3 3 0 0 1 6 0v1" />
  </svg>
);

const step = "flex h-[34px] w-[34px] items-center justify-center rounded-full text-[17px] transition-colors hover:bg-[#f0e5d0]";

export default function CartPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { lines, ready, count, setQty, remove, clear } = useCart();

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please sign in to access your cart.");
      router.replace("/login?redirect=/cart");
    }
  }, [user, authLoading, router]);

  if (authLoading) {
    return (
      <ShopShell>
        <ShopTop bottom="pb-10 sm:pb-14">
          <h1 className="mb-2.5 font-[family-name:var(--font-serif)] text-4xl">Your Cart</h1>
        </ShopTop>
        <main className={`${WRAP} py-20 text-center`}>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2a231e] border-t-transparent mx-auto" />
        </main>
      </ShopShell>
    );
  }

  if (!user) {
    return (
      <ShopShell>
        <ShopTop bottom="pb-10 sm:pb-14">
          <h1 className="mb-2.5 font-[family-name:var(--font-serif)] text-[length:clamp(40px,6vw,72px)] font-medium leading-[1.02]">
            Your Cart
          </h1>
          <p className="text-base text-[#f6e9d0]/65">Sign in required</p>
        </ShopTop>
        <main className={`${WRAP} py-16 text-center`}>
          <div className="rounded-[28px] bg-white p-10 max-w-md mx-auto shadow-sm border border-[#2a231e]/10">
            <div className="mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full bg-[#fbf6ea] text-[#2a231e]">
              <BagIcon />
            </div>
            <h2 className="font-[family-name:var(--font-serif)] text-2xl font-medium text-[#2a231e]">
              Sign in to access your cart
            </h2>
            <p className="mt-2 text-sm text-[#6a5c4f]">
              Your cart items and saved products are private to your HubZone member account.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/login?redirect=/cart"
                className="w-full rounded-full bg-[#2a231e] text-[#f6e9d0] px-6 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-[#b8613a] transition"
              >
                Sign In
              </Link>
              <Link
                href="/shop"
                className="w-full rounded-full border border-[#2a231e]/20 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6a5c4f] hover:bg-neutral-100 transition"
              >
                Continue browsing
              </Link>
            </div>
          </div>
        </main>
      </ShopShell>
    );
  }

  const handleRemove = (id: string, name: string) => {
    remove(id);
    toast.info(`Removed "${name}" from cart.`);
  };

  const handleClear = () => {
    clear();
    toast.info("Cart cleared.");
  };

  const items = lines.flatMap((l) => {
    const p = getProduct(l.id);
    return p ? [{ p: p as Product, qty: l.qty }] : [];
  });
  const subtotal = items.reduce((s, it) => s + eff(it.p) * it.qty, 0);
  const savings = items.reduce((s, it) => s + (it.p.price - eff(it.p)) * it.qty, 0);

  return (
    <ShopShell>
      <ShopTop bottom="pb-10 sm:pb-14">
        <h1 className="mb-2.5 font-[family-name:var(--font-serif)] text-[length:clamp(44px,8vw,92px)] font-medium leading-[1.02] tracking-[-0.01em]">
          Your cart
        </h1>
        <p className="text-base text-[#f6e9d0]/65">
          {!ready ? "\u00a0" : count === 0 ? "Nothing here yet" : `${count} ${count === 1 ? "product" : "products"} ready to order`}
        </p>
      </ShopTop>

      <main className={`${WRAP} min-h-[420px] pb-20 pt-7 sm:pb-[110px] sm:pt-12`}>
        {!ready ? null : items.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[radial-gradient(circle_at_50%_35%,#fff,#efe3cb)] shadow-[inset_0_0_0_1px_rgba(42,35,30,0.08)]">
              <BagIcon />
            </div>
            <h2 className="font-[family-name:var(--font-serif)] text-[length:clamp(32px,4vw,46px)] font-medium leading-[1.1]">Your cart is empty</h2>
            <p className="mt-2.5 text-[#6a5c4f]">Add a few products and they&apos;ll wait for you here.</p>
            <Link href="/shop" className="mt-7 inline-flex items-center justify-center rounded-full bg-[#2a231e] px-8 py-4 text-[15px] font-medium text-[#f6e9d0] transition duration-300 hover:-translate-y-0.5 hover:bg-[#b8613a]">
              Browse products
            </Link>
          </div>
        ) : (
          <div className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_390px] lg:items-start lg:gap-14">
            <section aria-label="Items in your cart">
              <ul className="border-t border-[#2a231e]/20">
                {items.map(({ p, qty }) => {
                  const c = getCategory(p.cat);
                  const offer = hasOffer(p);
                  return (
                    <li
                      key={p.id}
                      style={{ ["--tile" as string]: c.tile }}
                      className="grid grid-cols-[88px_minmax(0,1fr)] items-center gap-x-4 gap-y-3.5 border-b border-[#2a231e]/20 py-5 sm:grid-cols-[120px_minmax(0,1fr)_auto] sm:gap-x-[22px] sm:py-6"
                    >
                      <Link
                        href={`/shop/${p.id}`}
                        aria-label={`View ${p.name}`}
                        className={`relative block aspect-square overflow-hidden rounded-[14px] shadow-[inset_0_0_0_1px_rgba(42,35,30,0.06)] sm:rounded-[18px]`}
                        style={tileStyle(c.tile)}
                      >
                        <TileArt src={p.img} name={p.name} pad="8%" />
                      </Link>

                      <div className="flex min-w-0 flex-col items-start gap-1.5">
                        <span className="text-[12.5px] text-[#6a5c4f]">{c.label}</span>
                        <Link href={`/shop/${p.id}`} className="break-words font-[family-name:var(--font-serif)] text-[length:clamp(20px,2vw,26px)] font-medium leading-[1.15] transition-colors hover:text-[#b8613a]">
                          {p.name}
                        </Link>
                        <div className="flex flex-wrap items-baseline gap-x-2.5 text-[15px]">
                          <span className="font-medium">{inr(eff(p))}</span>
                          {offer && <s className="text-[13px] text-[#6a5c4f] decoration-[1.5px]">{inr(p.price)}</s>}
                        </div>
                        <div className="mt-2 inline-flex items-center rounded-full border-[1.5px] border-[#2a231e]/20 p-[3px]" role="group" aria-label={`Quantity of ${p.name}`}>
                          <button type="button" className={step} onClick={() => setQty(p.id, qty - 1)} aria-label="Decrease quantity">−</button>
                          <span className="min-w-7 text-center text-[15px] font-medium">{qty}</span>
                          <button type="button" className={step} onClick={() => setQty(p.id, qty + 1)} aria-label="Increase quantity">+</button>
                        </div>
                      </div>

                      <div className="col-span-full flex items-center justify-between sm:col-span-1 sm:flex-col sm:items-end sm:gap-3.5">
                        <span className="font-[family-name:var(--font-serif)] text-2xl font-medium leading-none sm:text-[28px]">{inr(eff(p) * qty)}</span>
                        <button
                          type="button"
                          onClick={() => handleRemove(p.id, p.name)}
                          aria-label={`Remove ${p.name} from cart`}
                          className="inline-flex items-center gap-1.5 text-[13.5px] text-[#6a5c4f] transition-colors hover:text-[#b8613a]"
                        >
                          <TrashIcon />
                          Remove
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
              <button type="button" onClick={handleClear} className="mt-[22px] text-sm text-[#6a5c4f] underline underline-offset-4 transition-colors hover:text-[#b8613a]">
                Clear cart
              </button>
            </section>

            <aside
              aria-label="Order summary"
              className="relative overflow-hidden rounded-[26px] bg-white px-5 pb-[22px] pt-8 shadow-[0_30px_60px_-34px_rgba(42,35,30,0.4),inset_0_0_0_1px_rgba(42,35,30,0.07)] sm:px-7 sm:pb-7 lg:sticky lg:top-[110px]"
            >
              <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#4caf50_0%,#d4a24c_35%,#f08a24_65%,#2fa8e8_100%)]" />
              <h2 className="mb-[18px] font-[family-name:var(--font-serif)] text-3xl font-medium leading-[1.1]">Order summary</h2>

              <dl className="text-[15px]">
                <div className="flex justify-between gap-4 border-b border-[#2a231e]/10 py-[11px]">
                  <dt className="text-[#6a5c4f]">Subtotal ({count} {count === 1 ? "item" : "items"})</dt>
                  <dd className="text-right font-medium">{inr(subtotal + savings)}</dd>
                </div>
                {savings > 0 && (
                  <div className="flex justify-between gap-4 border-b border-[#2a231e]/10 py-[11px]">
                    <dt className="text-[#6a5c4f]">Offer savings</dt>
                    <dd className="text-right font-medium text-[#2e7d32]">− {inr(savings)}</dd>
                  </div>
                )}
                
                <div className="flex items-baseline justify-between gap-4 pt-[18px]">
                  <dt className="font-medium">Total</dt>
                  <dd className="font-[family-name:var(--font-serif)] text-4xl font-medium leading-none">{inr(subtotal)}</dd>
                </div>
              </dl>

             <Link
  href="/checkout"
  className="mt-6 flex min-h-[54px] w-full items-center justify-between gap-[18px] rounded-full bg-[#2a231e] pl-7 pr-2.5 text-[15px] font-medium text-[#f6e9d0] transition duration-300 hover:-translate-y-0.5 hover:bg-[#b8613a] active:scale-[0.98]"
>
  <span>Proceed to checkout</span>
  <span className="rounded-full bg-[#f6e9d0]/15 px-4 py-[9px]">{inr(subtotal)}</span>
</Link>
              <p className="mt-3.5 text-[13.5px] text-[#6a5c4f]">Choose cash on delivery or pay online at checkout.</p>
              <Link href="/shop" className="mt-5 inline-block text-[15px] font-medium underline underline-offset-4 transition-colors hover:text-[#b8613a]">
                ← Continue shopping
              </Link>
            </aside>
          </div>
        )}
      </main>
    </ShopShell>
  );
}
