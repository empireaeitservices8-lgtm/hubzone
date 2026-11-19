"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { getProduct } from "./products";
import CartToast from "@/components/CartToast";
import { api, getToken } from "./api";
import { useAuth } from "./auth";

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

const LEGACY_KEY = "hubzone-cart";
const MAX = 99;
const Ctx = createContext<CartCtx | null>(null);

export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside <CartProvider>");
  return c;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [lines, setLines] = useState<Line[]>([]);
  const [ready, setReady] = useState(false);
  const [toast, setToast] = useState<{ name: string; n: number } | null>(null);
  const [toastOn, setToastOn] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync with authenticated user and purge old demo cart from localStorage
  useEffect(() => {
    // Purge legacy demo cart from localStorage if present
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem(LEGACY_KEY);
      } catch {}
    }

    if (!user) {
      setLines([]);
      setReady(true);
      return;
    }

    const key = `hubzone_cart_u_${user.id}`;
    let initialLines: Line[] = [];
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw) as Line[];
        initialLines = parsed.filter((l) => l && l.id && l.qty > 0);
      }
    } catch {
      initialLines = [];
    }
    setLines(initialLines);
    setReady(true);

    // Sync live cart from backend
    if (getToken()) {
      api.cart
        .get()
        .then((res) => {
          if (res && res.success && Array.isArray(res.items)) {
            const backendLines: Line[] = res.items
              .map((it: any) => ({
                id: it.productId || it.id,
                qty: it.quantity || it.qty || 1,
              }))
              .filter((l) => l.id && l.qty > 0);
            setLines(backendLines);
            try {
              localStorage.setItem(key, JSON.stringify(backendLines));
            } catch {}
          }
        })
        .catch(() => {});
    }
  }, [user]);

  // save on every change when user is authenticated
  useEffect(() => {
    if (!ready || !user) return;
    const key = `hubzone_cart_u_${user.id}`;
    try {
      localStorage.setItem(key, JSON.stringify(lines));
    } catch {
      /* storage full or blocked: the cart still works for this visit */
    }
  }, [lines, ready, user]);

  const add = useCallback((id: string, qty = 1) => {
    const p = getProduct(id);
    const prodName = p ? p.name : "Product";
    setLines((cur) => {
      const found = cur.find((l) => l.id === id);
      return found
        ? cur.map((l) => (l.id === id ? { ...l, qty: Math.min(MAX, l.qty + qty) } : l))
        : [...cur, { id, qty: Math.min(MAX, qty) }];
    });
    setToast({ name: prodName, n: qty });
    setToastOn(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setToastOn(false), 3200);

    if (getToken()) {
      api.cart.add(id, qty).catch(() => {});
    }
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setLines((cur) => (qty <= 0 ? cur.filter((l) => l.id !== id) : cur.map((l) => (l.id === id ? { ...l, qty: Math.min(MAX, qty) } : l))));
    if (getToken()) {
      if (qty <= 0) {
        api.cart.remove(id).catch(() => {});
      } else {
        api.cart.updateQty(id, qty).catch(() => {});
      }
    }
  }, []);

  const remove = useCallback((id: string) => {
    setLines((cur) => cur.filter((l) => l.id !== id));
    if (getToken()) {
      api.cart.remove(id).catch(() => {});
    }
  }, []);

  const clear = useCallback(() => {
    setLines([]);
    if (user) {
      try {
        localStorage.removeItem(`hubzone_cart_u_${user.id}`);
      } catch {}
    }
    if (getToken()) {
      api.cart.clear().catch(() => {});
    }
  }, [user]);

  const count = useMemo(() => lines.reduce((s, l) => s + l.qty, 0), [lines]);
  const value = useMemo(() => ({ lines, ready, count, add, setQty, remove, clear }), [lines, ready, count, add, setQty, remove, clear]);

  return (
    <Ctx.Provider value={value}>
      {children}
      <CartToast show={toastOn} text={toast ? `${toast.n > 1 ? `${toast.n} × ` : ""}${toast.name} added to cart` : ""} />
    </Ctx.Provider>
  );
}
