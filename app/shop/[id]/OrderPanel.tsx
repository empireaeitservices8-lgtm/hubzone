"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { inr } from "@/lib/products";

export default function OrderPanel({ id, name, unit, status }: { id: string; name?: string; unit: number; status?: string }) {
  const router = useRouter();
  const { user } = useAuth();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [done, setDone] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isOutOfStock = status === "out_of_stock";

  const addToCart = () => {
    if (!user) {
      toast.error("Please sign in to add items to your cart.");
      router.push(`/login?redirect=${encodeURIComponent(`/shop/${id}`)}`);
      return;
    }
    if (isOutOfStock) {
      toast.warning(`${name || "Product"} is currently out of stock.`);
      return;
    }
    add(id, qty);
    toast.success(`Added ${qty > 1 ? `${qty} items` : `"${name || 'Product'}"`} to your cart!`);
    setDone(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDone(false), 1800);
  };

  const step = "flex h-11 w-11 items-center justify-center rounded-full text-xl transition-colors hover:bg-[#f0e5d0] disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent";

  return (
    <div className="mt-8 flex flex-wrap items-stretch gap-3">
      <div className="inline-flex items-center rounded-full border-[1.5px] border-[#2a231e]/20 p-1" role="group" aria-label="Quantity">
        <button type="button" className={step} onClick={() => setQty((q) => Math.max(1, q - 1))} disabled={qty === 1 || isOutOfStock} aria-label="Decrease quantity">
          −
        </button>
        <span className="min-w-[34px] text-center font-medium" aria-live="polite">{qty}</span>
        <button type="button" className={step} onClick={() => setQty((q) => Math.min(99, q + 1))} disabled={isOutOfStock} aria-label="Increase quantity">
          +
        </button>
      </div>
      <button
        type="button"
        onClick={addToCart}
        disabled={isOutOfStock}
        className={`flex min-h-[54px] min-w-[230px] flex-1 items-center justify-between gap-[18px] rounded-full py-0 pl-7 pr-2.5 text-[15px] font-medium transition duration-300 max-sm:basis-full ${
          isOutOfStock
            ? "bg-neutral-300 text-neutral-600 cursor-not-allowed"
            : "bg-[#2a231e] text-[#f6e9d0] hover:-translate-y-0.5 hover:bg-[#b8613a] active:scale-[0.98]"
        }`}
      >
        <span>{isOutOfStock ? "Out of Stock" : done ? "Added to cart ✓" : "Add to cart"}</span>
        <span className="rounded-full bg-[#f6e9d0]/15 px-4 py-[9px]">{inr(unit * qty)}</span>
      </button>
    </div>
  );
}
