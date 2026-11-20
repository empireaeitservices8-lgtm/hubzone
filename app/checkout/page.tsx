"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ChangeEvent, type FormEvent, type ReactNode } from "react";
import ShopShell, { ShopTop, WRAP } from "@/components/ShopShell";
import { TileArt } from "@/components/ProductCard";
import { useCart } from "@/lib/cart";
import { eff, getCategory, getProduct, inr, tileStyle, type Product } from "@/lib/products";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";

/* ---- edit these to match your delivery policy ---- */
const FREE_DELIVERY_ABOVE = 499;
const DELIVERY_FEE = 49;
const COD_FEE = 0;
const RAZORPAY_ME_URL = process.env.NEXT_PUBLIC_RAZORPAY_ME_URL || "https://razorpay.me/@hybriduniversalbusinesszone";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined") return resolve(false);
    if ((window as any).Razorpay) return resolve(true);
    const existing = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

const STATES = [
  "Kerala", "Tamil Nadu", "Karnataka", "Andhra Pradesh", "Telangana", "Maharashtra", "Goa", "Gujarat",
  "Rajasthan", "Delhi", "Uttar Pradesh", "Madhya Pradesh", "West Bengal", "Odisha", "Punjab", "Haryana",
  "Bihar", "Jharkhand", "Chhattisgarh", "Assam", "Uttarakhand", "Himachal Pradesh", "Jammu & Kashmir",
  "Puducherry", "Other",
];

type Form = {
  name: string; phone: string; email: string;
  address: string; landmark: string; city: string; pin: string; state: string;
  note: string; pay: "online" | "cod";
};
type Errors = Partial<Record<keyof Form, string>>;

const EMPTY: Form = {
  name: "", phone: "", email: "", address: "", landmark: "", city: "", pin: "", state: "Kerala", note: "", pay: "online",
};

function validate(f: Form): Errors {
  const e: Errors = {};
  if (f.name.trim().length < 2) e.name = "Enter your full name";
  if (!/^[6-9]\d{9}$/.test(f.phone)) e.phone = "Enter a 10-digit mobile number";
  if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a valid email address";
  if (f.address.trim().length < 4) e.address = "Enter your house number or house name and street";
  if (f.city.trim().length < 2) e.city = "Enter your town or city";
  if (!/^[1-9]\d{5}$/.test(f.pin)) e.pin = "Enter a 6-digit PIN code";
  return e;
}

const inputCls = (bad?: string) =>
  [
    "w-full rounded-[14px] bg-[#fbf6ea] px-4 py-3.5 text-[15px] text-[#2a231e] outline-none transition placeholder:text-[#6a5c4f]/60",
    "border-[1.5px] focus:border-[#2a231e] focus:bg-white",
    bad ? "border-[#b8613a]" : "border-[#2a231e]/15",
  ].join(" ");

function Field({ label, error, children, className = "" }: { label: string; error?: string; children: ReactNode; className?: string }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[13.5px] font-medium">{label}</span>
      {children}
      {error && <span className="text-[13px] text-[#b8613a]" role="alert">{error}</span>}
    </label>
  );
}

function Card({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <section className="rounded-[26px] bg-white px-5 py-7 shadow-[0_30px_60px_-40px_rgba(42,35,30,0.35),inset_0_0_0_1px_rgba(42,35,30,0.07)] sm:px-8 sm:py-8">
      <h2 className="font-[family-name:var(--font-serif)] text-[28px] font-medium leading-[1.1] sm:text-3xl">{title}</h2>
      {hint && <p className="mt-1.5 text-sm text-[#6a5c4f]">{hint}</p>}
      <div className="mt-6 grid gap-x-4 gap-y-5 sm:grid-cols-2">{children}</div>
    </section>
  );
}

function PayOption({ checked, onSelect, title, text, badge }: { checked: boolean; onSelect: () => void; title: string; text: string; badge: string }) {
  return (
    <label
      className={[
        "flex cursor-pointer items-start gap-3.5 rounded-[18px] border-[1.5px] p-4 transition sm:col-span-2",
        checked ? "border-[#2a231e] bg-[#fbf6ea]" : "border-[#2a231e]/15 hover:border-[#2a231e]/40",
      ].join(" ")}
    >
      <input type="radio" name="pay" checked={checked} onChange={onSelect} className="peer sr-only" />
      <span
        aria-hidden="true"
        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-[1.5px] ${checked ? "border-[#2a231e]" : "border-[#2a231e]/40"}`}
      >
        {checked && <span className="h-2.5 w-2.5 rounded-full bg-[#2a231e]" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[15px] font-medium">{title}</span>
        <span className="mt-0.5 block text-[13.5px] text-[#6a5c4f]">{text}</span>
      </span>
      <span className="shrink-0 rounded-full bg-[#2a231e]/[0.07] px-2.5 py-1 text-[11.5px] font-medium">{badge}</span>
    </label>
  );
}

function Summary({ items, subtotal, savings, delivery, total }: {
  items: { p: Product; qty: number }[]; subtotal: number; savings: number; delivery: number; total: number;
}) {
  return (
    <>
      <ul className="divide-y divide-[#2a231e]/10">
        {items.map(({ p, qty }) => {
          const c = getCategory(p.cat);
          return (
            <li key={p.id} className="flex items-center gap-3.5 py-3.5">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl shadow-[inset_0_0_0_1px_rgba(42,35,30,0.06)]" style={tileStyle(c.tile)}>
                <TileArt src={p.img} name={p.name} pad="8%" />
                <span className="absolute -right-0 -top-0 z-[2] flex h-5 min-w-5 items-center justify-center rounded-bl-lg bg-[#2a231e] px-1 text-[11px] font-medium text-[#f6e9d0]">
                  {qty}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="break-words font-[family-name:var(--font-serif)] text-[18px] font-medium leading-[1.15]">{p.name}</p>
                <p className="mt-0.5 text-[13px] text-[#6a5c4f]">{c.label}</p>
              </div>
              <span className="text-[15px] font-medium">{inr(eff(p) * qty)}</span>
            </li>
          );
        })}
      </ul>

      <dl className="mt-2 border-t border-[#2a231e]/10 text-[15px]">
        <div className="flex justify-between gap-4 py-[11px]">
          <dt className="text-[#6a5c4f]">Subtotal</dt>
          <dd className="font-medium">{inr(subtotal + savings)}</dd>
        </div>
        {savings > 0 && (
          <div className="flex justify-between gap-4 py-[11px]">
            <dt className="text-[#6a5c4f]">Offer savings</dt>
            <dd className="font-medium text-[#2e7d32]">− {inr(savings)}</dd>
          </div>
        )}
        <div className="flex justify-between gap-4 py-[11px]">
          <dt className="text-[#6a5c4f]">Delivery</dt>
          <dd className="font-medium">{delivery === 0 ? "Free" : inr(delivery)}</dd>
        </div>
        <div className="flex items-baseline justify-between gap-4 border-t border-[#2a231e]/10 pt-[18px]">
          <dt className="font-medium">Total</dt>
          <dd className="font-[family-name:var(--font-serif)] text-4xl font-medium leading-none">{inr(total)}</dd>
        </div>
      </dl>
    </>
  );
}

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, ready, count, clear } = useCart();
  const { user, loading: authLoading } = useAuth();
  const [f, setF] = useState<Form>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [busy, setBusy] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [placedPayMethod, setPlacedPayMethod] = useState<"online" | "cod">("online");
  const [placedTotal, setPlacedTotal] = useState(0);
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (!authLoading && !user) {
      toast.error("Please sign in to place an order.");
      router.replace("/login?redirect=/checkout");
    }
  }, [user, authLoading, router]);

  // Autofill form if user is logged in
  useEffect(() => {
    if (user) {
      setF((cur) => ({
        ...cur,
        name: cur.name || user.username || "",
        email: cur.email || user.email || "",
        phone: cur.phone || user.phone || "",
        address: cur.address || user.address || "",
        city: cur.city || user.city || "",
        state: cur.state || user.state || "Kerala",
        pin: cur.pin || user.pin || "",
      }));
    }
  }, [user]);

  const items = lines.flatMap((l) => {
    const p = getProduct(l.id);
    return p ? [{ p: p as Product, qty: l.qty }] : [];
  });
  const subtotal = items.reduce((s, it) => s + eff(it.p) * it.qty, 0);
  const savings = items.reduce((s, it) => s + (it.p.price - eff(it.p)) * it.qty, 0);
  const delivery = subtotal >= FREE_DELIVERY_ABOVE ? 0 : DELIVERY_FEE;
  const total = subtotal + delivery + (f.pay === "cod" ? COD_FEE : 0);

  const set =
    (k: keyof Form) =>
    (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      let v = e.target.value;
      if (k === "phone") v = v.replace(/\D/g, "").slice(0, 10);
      if (k === "pin") v = v.replace(/\D/g, "").slice(0, 6);
      setF((cur) => ({ ...cur, [k]: v }));
      if (errors[k]) setErrors((cur) => ({ ...cur, [k]: undefined }));
      setApiError("");
    };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const errs = validate(f);
    setErrors(errs);
    const first = Object.keys(errs)[0];
    if (first) {
      document.getElementById(`f-${first}`)?.focus();
      return;
    }
    setBusy(true);
    setApiError("");

    const orderPayload = {
      name: f.name,
      phone: f.phone,
      email: f.email || (user ? user.email : ""),
      address: `${f.address}${f.landmark ? `, Near ${f.landmark}` : ""}`,
      city: f.city,
      state: f.state,
      pin: f.pin,
      paymentMethod: f.pay === "cod" ? "Cash on Delivery" : "Online Payment (Razorpay)",
      subtotal,
      deliveryFee: delivery,
      totalAmount: total,
      items: items.map((it) => ({
        id: it.p.id,
        name: it.p.name,
        price: eff(it.p),
        originalPrice: it.p.price,
        qty: it.qty,
        cat: it.p.cat,
        img: it.p.img,
      })),
    };

    if (f.pay === "cod") {
      try {
        const res = await api.orders.create(orderPayload);
        const placedNum = res.order?.orderNumber || "HZ" + Date.now().toString().slice(-7);
        setPlacedPayMethod("cod");
        setPlacedTotal(total);
        setOrderId(placedNum);
        toast.success(`Order placed successfully! Order #${placedNum}`);
        clear();
      } catch (err: any) {
        toast.error(err.message || "Failed to place order.");
        setApiError(err.message || "Failed to place order. Please try again.");
      } finally {
        setBusy(false);
      }
      return;
    }

    // Online payment via Razorpay
    try {
      // Check if standard Razorpay API keys are configured in backend
      const configRes = await api.payment.getConfig().catch(() => null);

      if (configRes && configRes.configured && configRes.keyId) {
        const loaded = await loadRazorpayScript();
        if (loaded) {
          const rzpOrder = await api.payment.createRazorpayOrder(total);
          const options = {
            key: rzpOrder.keyId || configRes.keyId,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency || "INR",
            name: "HubZone",
            description: `Order payment for ${items.length} ${items.length === 1 ? "product" : "products"}`,
            image: "/logo.png",
            order_id: rzpOrder.orderId,
            handler: async function (response: any) {
              try {
                setBusy(true);
                const verifyRes = await api.payment.verifyRazorpayPayment({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderPayload,
                });
                const placedNum = verifyRes.order?.orderNumber || "HZ" + Date.now().toString().slice(-7);
                setPlacedPayMethod("online");
                setPlacedTotal(total);
                setOrderId(placedNum);
                toast.success(`Payment verified! Order #${placedNum} placed successfully.`);
                clear();
              } catch (verifyErr: any) {
                toast.error(verifyErr.message || "Payment verification failed.");
                setApiError(verifyErr.message || "Payment verification failed.");
              } finally {
                setBusy(false);
              }
            },
            prefill: {
              name: f.name,
              email: f.email || (user ? user.email : ""),
              contact: f.phone,
            },
            theme: { color: "#2a231e" },
            modal: {
              ondismiss: function () {
                setBusy(false);
              },
            },
          };

          const rzp = new (window as any).Razorpay(options);
          rzp.on("payment.failed", function (response: any) {
            setBusy(false);
            const errMsg = response.error?.description || "Payment failed. Please try again.";
            toast.error(errMsg);
            setApiError(errMsg);
          });
          rzp.open();
          return;
        }
      }

      // If API keys are not configured yet, register order and open your official Razorpay.me instant link!
      const res = await api.orders.create(orderPayload);
      const placedNum = res.order?.orderNumber || "HZ" + Date.now().toString().slice(-7);
      setPlacedPayMethod("online");
      setPlacedTotal(total);
      setOrderId(placedNum);
      toast.success(`Order #${placedNum} reserved! Opening Razorpay to complete payment...`);
      clear();

      if (typeof window !== "undefined") {
        window.open(RAZORPAY_ME_URL, "_blank");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to place order.");
      setApiError(err.message || "Failed to place order. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  if (authLoading) {
    return (
      <ShopShell>
        <ShopTop bottom="pb-10 sm:pb-14">
          <h1 className="mb-2.5 font-[family-name:var(--font-serif)] text-4xl">Checkout</h1>
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
            Checkout
          </h1>
          <p className="text-base text-[#f6e9d0]/65">Sign in required</p>
        </ShopTop>
        <main className={`${WRAP} py-16 text-center`}>
          <div className="rounded-[28px] bg-white p-10 max-w-md mx-auto shadow-sm border border-[#2a231e]/10">
            <h2 className="font-[family-name:var(--font-serif)] text-2xl font-medium text-[#2a231e]">
              Sign in to place your order
            </h2>
            <p className="mt-2 text-sm text-[#6a5c4f]">
              You must be signed in with your HubZone account to complete checkout and receive tracking updates.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <Link
                href="/login?redirect=/checkout"
                className="w-full rounded-full bg-[#2a231e] text-[#f6e9d0] px-6 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-[#b8613a] transition"
              >
                Sign In to Checkout
              </Link>
              <Link
                href="/cart"
                className="w-full rounded-full border border-[#2a231e]/20 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6a5c4f] hover:bg-neutral-100 transition"
              >
                Back to Cart
              </Link>
            </div>
          </div>
        </main>
      </ShopShell>
    );
  }

  /* ---------- order placed ---------- */
  if (orderId) {
    const isOnline = placedPayMethod === "online";

    return (
      <ShopShell>
        <ShopTop bottom="pb-10 sm:pb-14">
          <h1 className="mb-2.5 font-[family-name:var(--font-serif)] text-[length:clamp(44px,8vw,92px)] font-medium leading-[1.02] tracking-[-0.01em]">
            {isOnline ? "Order Reserved" : "Order Placed"}
          </h1>
          <p className="text-base text-[#f6e9d0]/65">Order #{orderId}</p>
        </ShopTop>
        <main className={`${WRAP} flex min-h-[420px] flex-col items-center py-14 text-center sm:py-20`}>
          <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-[#2e7d32]/10 text-[#2e7d32]">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m5 12.5 4.5 4.5L19 7.5" />
            </svg>
          </div>
          <h2 className="font-[family-name:var(--font-serif)] text-[length:clamp(30px,4vw,44px)] font-medium leading-[1.1]">Thank you, {f.name.split(" ")[0]}!</h2>
          <p className="mt-3 max-w-[480px] text-[#6a5c4f]">
            We&apos;ve registered your order <strong>#{orderId}</strong>. We will deliver it to {f.city || "your address"}.
          </p>

          {isOnline && (
            <div className="mt-8 w-full max-w-lg rounded-3xl border border-[#2a231e]/15 bg-white p-6 sm:p-8 shadow-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200 mb-3">
                <span className="h-2 w-2 rounded-full bg-emerald-600 animate-pulse" />
                Razorpay Payment Link Active
              </span>
              <h3 className="font-[family-name:var(--font-serif)] text-2xl font-medium text-[#2a231e]">
                Amount: {inr(placedTotal || total)}
              </h3>
              <p className="mt-2 text-sm text-[#6a5c4f]">
                Complete your payment securely on our official Razorpay portal via <strong>Google Pay, PhonePe, Paytm, UPI, Cards, or Net Banking</strong>:
              </p>
              <div className="mt-6 flex flex-col gap-3">
                <a
                  href={RAZORPAY_ME_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2.5 rounded-full bg-[#0c2340] px-8 py-4 text-[15px] font-semibold text-white shadow-md transition duration-300 hover:bg-[#07172b] active:scale-[0.98]"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z" />
                  </svg>
                  Pay {inr(placedTotal || total)} on Razorpay ↗
                </a>
                <p className="text-xs text-neutral-400">
                  Direct payment portal: {RAZORPAY_ME_URL}
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/orders" className="inline-flex items-center justify-center rounded-full bg-[#b8613a] px-8 py-4 text-[15px] font-medium text-white transition duration-300 hover:bg-[#a04e28]">
              Track Your Order Status
            </Link>
            <Link href="/shop" className="inline-flex items-center justify-center rounded-full bg-[#2a231e] px-8 py-4 text-[15px] font-medium text-[#f6e9d0] transition duration-300 hover:bg-[#3d322b]">
              Continue shopping
            </Link>
          </div>
        </main>
      </ShopShell>
    );
  }

  /* ---------- checkout ---------- */
  return (
    <ShopShell>
      <ShopTop bottom="pb-10 sm:pb-14">
        <h1 className="mb-2.5 font-[family-name:var(--font-serif)] text-[length:clamp(44px,8vw,92px)] font-medium leading-[1.02] tracking-[-0.01em]">
          Checkout
        </h1>
        <p className="text-base text-[#f6e9d0]/65">{!ready ? "\u00a0" : `${count} ${count === 1 ? "product" : "products"} · ${inr(total)}`}</p>
      </ShopTop>

      <main className={`${WRAP} min-h-[420px] pb-20 pt-7 sm:pb-[110px] sm:pt-12`}>
        {!ready ? null : items.length === 0 ? (
          <div className="flex flex-col items-center py-12 text-center">
            <h2 className="font-[family-name:var(--font-serif)] text-[length:clamp(32px,4vw,46px)] font-medium leading-[1.1]">Your cart is empty</h2>
            <p className="mt-2.5 text-[#6a5c4f]">Add a product before you check out.</p>
            <Link href="/shop" className="mt-7 inline-flex items-center justify-center rounded-full bg-[#2a231e] px-8 py-4 text-[15px] font-medium text-[#f6e9d0] transition duration-300 hover:-translate-y-0.5 hover:bg-[#b8613a]">
              Browse products
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="grid gap-9 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start lg:gap-14">
            <div className="flex flex-col gap-6">
              {/* mobile: collapsible summary */}
              <details className="group rounded-[22px] bg-white shadow-[inset_0_0_0_1px_rgba(42,35,30,0.07)] lg:hidden">
                <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-[15px] font-medium [&::-webkit-details-marker]:hidden">
                  <span className="underline underline-offset-4">Show order summary</span>
                  <span className="font-[family-name:var(--font-serif)] text-2xl">{inr(total)}</span>
                </summary>
                <div className="px-5 pb-5">
                  <Summary items={items} subtotal={subtotal} savings={savings} delivery={delivery} total={total} />
                </div>
              </details>

              <Card title="Contact" hint="We'll use this to confirm your order and share delivery updates.">
                <Field label="Full name" error={errors.name} className="sm:col-span-2">
                  <input id="f-name" autoComplete="name" value={f.name} onChange={set("name")} className={inputCls(errors.name)} placeholder="Anjali Menon" />
                </Field>
                <Field label="Mobile number" error={errors.phone}>
                  <div className="flex">
                    <span className="flex items-center rounded-l-[14px] border-[1.5px] border-r-0 border-[#2a231e]/15 bg-[#f0e5d0] px-3.5 text-[15px]">+91</span>
                    <input id="f-phone" inputMode="numeric" autoComplete="tel-national" value={f.phone} onChange={set("phone")} className={`${inputCls(errors.phone)} rounded-l-none`} placeholder="98765 43210" />
                  </div>
                </Field>
                <Field label="Email (optional)" error={errors.email}>
                  <input id="f-email" type="email" autoComplete="email" value={f.email} onChange={set("email")} className={inputCls(errors.email)} placeholder="you@example.com" />
                </Field>
              </Card>

              <Card title="Delivery address">
                <Field label="House number or house name and street" error={errors.address} className="sm:col-span-2">
                  <input id="f-address" autoComplete="address-line1" value={f.address} onChange={set("address")} className={inputCls(errors.address)} placeholder="House number or house name, street" />
                </Field>
                <Field label="Landmark (optional)" className="sm:col-span-2">
                  <input id="f-landmark" autoComplete="address-line2" value={f.landmark} onChange={set("landmark")} className={inputCls()} placeholder="Near the post office" />
                </Field>
                <Field label="Town or city" error={errors.city}>
                  <input id="f-city" autoComplete="address-level2" value={f.city} onChange={set("city")} className={inputCls(errors.city)} placeholder="Kochi" />
                </Field>
                <Field label="PIN code" error={errors.pin}>
                  <input id="f-pin" inputMode="numeric" autoComplete="postal-code" value={f.pin} onChange={set("pin")} className={inputCls(errors.pin)} placeholder="682021" />
                </Field>
                <Field label="State" className="sm:col-span-2">
                  <select id="f-state" autoComplete="address-level1" value={f.state} onChange={set("state")} className={inputCls()}>
                    {STATES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Order note (optional)" className="sm:col-span-2">
                  <textarea id="f-note" rows={2} value={f.note} onChange={set("note")} className={inputCls()} placeholder="Anything we should know about delivery?" />
                </Field>
              </Card>

              <Card title="Payment">
                <PayOption
                  checked={f.pay === "online"}
                  onSelect={() => setF((c) => ({ ...c, pay: "online" }))}
                  title="Pay online (Razorpay)"
                  text="UPI (Google Pay, PhonePe, Paytm), Credit/Debit Cards, Net Banking."
                  badge="Instant & Secure"
                />
                <PayOption
                  checked={f.pay === "cod"}
                  onSelect={() => setF((c) => ({ ...c, pay: "cod" }))}
                  title="Cash on delivery"
                  text="Pay in cash or UPI when the order reaches you."
                  badge={COD_FEE ? `+ ${inr(COD_FEE)}` : "No extra fee"}
                />
              </Card>
            </div>

            {/* desktop: sticky summary */}
            <aside
              aria-label="Order summary"
              className="relative hidden overflow-hidden rounded-[26px] bg-white px-7 pb-7 pt-8 shadow-[0_30px_60px_-34px_rgba(42,35,30,0.4),inset_0_0_0_1px_rgba(42,35,30,0.07)] lg:sticky lg:top-[110px] lg:block"
            >
              <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-[linear-gradient(90deg,#4caf50_0%,#d4a24c_35%,#f08a24_65%,#2fa8e8_100%)]" />
              <h2 className="mb-3 font-[family-name:var(--font-serif)] text-3xl font-medium leading-[1.1]">Order summary</h2>
              <Summary items={items} subtotal={subtotal} savings={savings} delivery={delivery} total={total} />
              {delivery > 0 && (
                <p className="mt-3 text-[13.5px] text-[#6a5c4f]">Add {inr(FREE_DELIVERY_ABOVE - subtotal)} more for free delivery.</p>
              )}
              <PlaceButton busy={busy} label={f.pay === "online" ? "Pay now" : "Place order"} total={total} />
              <Link href="/cart" className="mt-5 inline-block text-[15px] font-medium underline underline-offset-4 transition-colors hover:text-[#b8613a]">
                ← Back to cart
              </Link>
            </aside>

            {/* mobile: button under the form */}
            <div className="lg:hidden">
              {delivery > 0 && <p className="mb-3 text-[13.5px] text-[#6a5c4f]">Add {inr(FREE_DELIVERY_ABOVE - subtotal)} more for free delivery.</p>}
              {apiError && (
                <div className="mb-4 rounded-xl bg-red-50 p-3.5 text-sm text-red-700 border border-red-200">
                  {apiError}
                </div>
              )}
              <PlaceButton busy={busy} label={f.pay === "online" ? "Pay now" : "Place order"} total={total} />
              <Link href="/cart" className="mt-5 inline-block text-[15px] font-medium underline underline-offset-4 transition-colors hover:text-[#b8613a]">
                ← Back to cart
              </Link>
            </div>
          </form>
        )}
      </main>
    </ShopShell>
  );
}

function PlaceButton({ busy, label, total }: { busy: boolean; label: string; total: number }) {
  return (
    <>
      <button
        type="submit"
        disabled={busy}
        className="mt-6 flex min-h-[54px] w-full items-center justify-between gap-[18px] rounded-full bg-[#2a231e] pl-7 pr-2.5 text-[15px] font-medium text-[#f6e9d0] transition duration-300 hover:-translate-y-0.5 hover:bg-[#b8613a] active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
      >
        <span>{busy ? "Placing your order…" : label}</span>
        <span className="rounded-full bg-[#f6e9d0]/15 px-4 py-[9px]">{inr(total)}</span>
      </button>
    </>
  );
}
