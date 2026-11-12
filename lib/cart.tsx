"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getProduct } from "./products";
import CartToast from "@/components/CartToast";

type Line = { id: string; qty: number };

type CartCtx = {
  lines: Line[];
  /** false until the saved cart has been read from the browser (avoids a flash of "empty cart") */
  ready: boolean;
  /** total number of items (sum of quantities) */
  count: number;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};

const KEY = "hubzone-cart";

/** Preview helper: while true, a visitor who has never used the cart starts with these sample products.
 *  Set SEED_DEMO to false (or empty DEMO_CART) before you go live. */
const SEED_DEMO = true;
const DEMO_CART: Line[] = [
  { id: "hair_oil", qty: 2 },
  { id: "dosa_tawa", qty: 1 },
  { id: "liquid_detergent", qty: 3 },
  { id: "Wayanad-Coffee-250", qty: 1 },
];
const MAX = 99;
const Ctx = createContext<CartCtx | null>(null);

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside <CartProvider>");
  return c;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<{ name: string; n: number } | null>(null);
  const [toastOn, setToastOn] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // load the saved cart, and stay in sync with other tabs
  useEffect(() => {
    const read = () => {
      try {
        const raw = localStorage.getItem(KEY);
        const parsed = raw ? (JSON.parse(raw) as Line[]) : raw === null && SEED_DEMO ? DEMO_CART : [];
        setLines(parsed.filter((l) => l && getProduct(l.id) && l.qty > 0));
      } catch {
        setLines([]);
      }
    };
    read();
    setReady(true);
    const onStorage = (e: StorageEvent) => e.key === KEY && read();
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // save on every change
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(lines));
    } catch {
      /* storage full or blocked: the cart still works for this visit */
    }
  }, [lines, ready]);

  const add = useCallback((id: string, qty = 1) => {
    const p = getProduct(id);
    if (!p) return;
    setLines((cur) => {
      const found = cur.find((l) => l.id === id);
      return found
        ? cur.map((l) => (l.id === id ? { ...l, qty: Math.min(MAX, l.qty + qty) } : l))
        : [...cur, { id, qty: Math.min(MAX, qty) }];
    });
    setToast({ name: p.name, n: qty });
    setToastOn(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastOn(false), 3200);
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((cur) => (qty <= 0 ? cur.filter((l) => l.id !== id) : cur.map((l) => (l.id === id ? { ...l, qty: Math.min(MAX, qty) } : l))));
  }, []);
  const remove = useCallback((id: string) => setLines((cur) => cur.filter((l) => l.id !== id)), []);
  const clear = useCallback(() => setLines([]), []);

  const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);
  const value = useMemo(() => ({ lines, ready, count, add, setQty, remove, clear }), [lines, ready, count, add, setQty, remove, clear]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <CartToast show={toastOn} text={toast ? `${toast.n > 1 ? `${toast.n} × ` : ""}${toast.name} added to cart` : ""} />
    </Ctx.Provider>
  );
}
