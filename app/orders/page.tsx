"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ShopShell, { ShopTop, WRAP } from "@/components/ShopShell";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { inr, tileStyle, getCategory } from "@/lib/products";
import { TileArt } from "@/components/ProductCard";

type OrderItem = {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  qty: number;
  cat?: string;
  img?: string;
};

type Order = {
  id: number;
  orderNumber: string;
  userEmail: string;
  username: string;
  phone: string;
  address: string;
  city?: string;
  state?: string;
  pin?: string;
  paymentMethod: string;
  orderStatus: "Placed" | "Shipped" | "Delivered" | "Cancelled";
  subtotal: number;
  deliveryFee: number;
  totalAmount: number;
  items: OrderItem[];
  itemCount: number;
  createdAt: string;
};

export default function MyOrdersPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await api.orders.getMyOrders();
      if (res.orders) {
        setOrders(res.orders);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      fetchOrders();
    } else if (!authLoading && !user) {
      setLoading(false);
      toast.error("Please sign in to view your orders.");
      router.replace("/login?redirect=/orders");
    }
  }, [user, authLoading, router]);

  const handleCancel = async (id: string | number) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      setCancellingId(String(id));
      await api.orders.cancel(String(id));
      toast.success("Order cancelled successfully.");
      await fetchOrders();
    } catch (err: any) {
      toast.error(err.message || "Failed to cancel order");
    } finally {
      setCancellingId(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Placed":
        return "bg-amber-100 text-amber-800 border-amber-300";
      case "Shipped":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "Delivered":
        return "bg-emerald-100 text-emerald-800 border-emerald-300";
      case "Cancelled":
        return "bg-rose-100 text-rose-800 border-rose-300";
      default:
        return "bg-neutral-100 text-neutral-800 border-neutral-300";
    }
  };

  const getStepActive = (status: string, step: string) => {
    if (status === "Cancelled") return false;
    if (step === "Placed") return true;
    if (step === "Shipped") return status === "Shipped" || status === "Delivered";
    if (step === "Delivered") return status === "Delivered";
    return false;
  };

  return (
    <ShopShell>
      <ShopTop bottom="pb-10 sm:pb-14">
        <h1 className="mb-2.5 font-[family-name:var(--font-serif)] text-[length:clamp(40px,7vw,84px)] font-medium leading-[1.02] tracking-[-0.01em]">
          My Orders & Status
        </h1>
        <p className="text-base text-[#f6e9d0]/65">
          Track the live shipment status of your ordered products
        </p>
      </ShopTop>

      <main className={`${WRAP} py-12 sm:py-16`}>
        {!user && !authLoading ? (
          <div className="rounded-[28px] bg-white p-10 text-center shadow-[0_20px_50px_-30px_rgba(42,35,30,0.15)] max-w-lg mx-auto">
            <h2 className="font-[family-name:var(--font-serif)] text-2xl font-medium">Please sign in</h2>
            <p className="mt-2 text-sm text-[#6a5c4f]">Sign in with your account to track your orders and view order history.</p>
            <Link
              href="/login"
              className="mt-6 inline-flex rounded-full bg-[#2a231e] px-8 py-3.5 text-sm font-medium text-[#f6e9d0] transition hover:bg-[#b8613a]"
            >
              Sign in now
            </Link>
          </div>
        ) : loading ? (
          <div className="flex justify-center py-20 text-[#6a5c4f]">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2a231e] border-t-transparent" />
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-red-50 p-6 text-center text-red-700 max-w-lg mx-auto border border-red-200">
            {error}
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-[28px] bg-white p-12 text-center shadow-[0_20px_50px_-30px_rgba(42,35,30,0.15)] max-w-lg mx-auto">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fbf6ea] text-[#6a5c4f]">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <h2 className="font-[family-name:var(--font-serif)] text-2xl font-medium">No orders yet</h2>
            <p className="mt-2 text-sm text-[#6a5c4f]">You haven&apos;t placed any orders yet. Discover our fresh catalog today!</p>
            <Link
              href="/shop"
              className="mt-6 inline-flex rounded-full bg-[#2a231e] px-8 py-3.5 text-sm font-medium text-[#f6e9d0] transition hover:bg-[#b8613a]"
            >
              Explore Products
            </Link>
          </div>
        ) : (
          <div className="space-y-8">
            {orders.map((order) => {
              const dateStr = new Date(order.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-[26px] bg-white shadow-[0_25px_60px_-35px_rgba(42,35,30,0.15),inset_0_0_0_1px_rgba(42,35,30,0.06)]"
                >
                  {/* Order Header */}
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2a231e]/10 bg-[#fbf6ea] px-6 py-4.5 sm:px-8">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-[#6a5c4f]">Order Number</span>
                      <p className="font-[family-name:var(--font-serif)] text-xl font-medium text-[#2a231e]">
                        {order.orderNumber}
                      </p>
                      <span className="text-xs text-[#6a5c4f]">{dateStr}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-3.5 py-1 text-xs font-semibold uppercase tracking-wider ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                      <span className="font-[family-name:var(--font-serif)] text-xl font-medium text-[#2a231e]">
                        {inr(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Shipment Tracking Stepper */}
                  {order.orderStatus !== "Cancelled" ? (
                    <div className="border-b border-[#2a231e]/10 px-6 py-6 sm:px-8">
                      <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#6a5c4f]">
                        Live Status Timeline
                      </p>
                      <div className="relative flex items-center justify-between max-w-xl mx-auto">
                        {/* Connecting Line */}
                        <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-[#2a231e]/10 -z-0">
                          <div
                            className="h-full bg-emerald-600 transition-all duration-500"
                            style={{
                              width:
                                order.orderStatus === "Placed"
                                  ? "0%"
                                  : order.orderStatus === "Shipped"
                                  ? "50%"
                                  : "100%",
                            }}
                          />
                        </div>

                        {/* Step 1: Placed */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all ${
                              getStepActive(order.orderStatus, "Placed")
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-emerald-100"
                                : "bg-neutral-200 text-neutral-600"
                            }`}
                          >
                            ✓
                          </div>
                          <span className="mt-2 text-xs font-semibold text-[#2a231e]">Placed</span>
                        </div>

                        {/* Step 2: Shipped */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all ${
                              getStepActive(order.orderStatus, "Shipped")
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-emerald-100"
                                : "bg-neutral-200 text-neutral-600"
                            }`}
                          >
                            {order.orderStatus === "Delivered" ? "✓" : "2"}
                          </div>
                          <span className="mt-2 text-xs font-semibold text-[#2a231e]">Shipped</span>
                        </div>

                        {/* Step 3: Delivered */}
                        <div className="relative z-10 flex flex-col items-center">
                          <div
                            className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold transition-all ${
                              getStepActive(order.orderStatus, "Delivered")
                                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-4 ring-emerald-100"
                                : "bg-neutral-200 text-neutral-600"
                            }`}
                          >
                            {order.orderStatus === "Delivered" ? "✓" : "3"}
                          </div>
                          <span className="mt-2 text-xs font-semibold text-[#2a231e]">Delivered</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="border-b border-[#2a231e]/10 bg-rose-50/50 px-6 py-4 sm:px-8 text-sm text-rose-700">
                      This order was cancelled.
                    </div>
                  )}

                  {/* Order Items */}
                  <div className="p-6 sm:p-8">
                    <p className="mb-4 text-xs font-semibold uppercase tracking-wider text-[#6a5c4f]">
                      Items in this shipment ({order.itemCount})
                    </p>
                    <ul className="divide-y divide-[#2a231e]/10">
                      {order.items.map((item, idx) => {
                        const cat = item.cat ? getCategory(item.cat as any) : null;
                        const tileColor = cat?.tile || "#e6d2bc";

                        return (
                          <li key={idx} className="flex items-center gap-4 py-3.5">
                            <div
                              className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl shadow-[inset_0_0_0_1px_rgba(42,35,30,0.06)]"
                              style={tileStyle(tileColor)}
                            >
                              <TileArt src={item.img || `/products/${item.id}.webp`} name={item.name} pad="8%" />
                              <span className="absolute -right-0 -top-0 z-[2] flex h-5 min-w-5 items-center justify-center rounded-bl-lg bg-[#2a231e] px-1 text-[11px] font-medium text-[#f6e9d0]">
                                {item.qty}
                              </span>
                            </div>

                            <div className="min-w-0 flex-1">
                              <Link
                                href={`/shop/${item.id}`}
                                className="font-[family-name:var(--font-serif)] text-[17px] font-medium leading-snug hover:underline text-[#2a231e]"
                              >
                                {item.name}
                              </Link>
                              <p className="text-xs text-[#6a5c4f] mt-0.5">
                                Qty: {item.qty} · Unit Price: {inr(item.price)}
                              </p>
                            </div>

                            <span className="text-[15px] font-medium text-[#2a231e]">
                              {inr(item.price * item.qty)}
                            </span>
                          </li>
                        );
                      })}
                    </ul>

                    {/* Delivery & Action row */}
                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#2a231e]/10 pt-4 text-xs text-[#6a5c4f]">
                      <div>
                        <span className="font-semibold text-[#2a231e]">Shipping to: </span>
                        {order.address}, {order.city} {order.pin} · Phone: {order.phone}
                      </div>

                      <div className="flex items-center gap-2.5">
                        {order.paymentMethod?.includes("Online") && order.orderStatus !== "Cancelled" && (
                          <a
                            href="https://razorpay.me/@hybriduniversalbusinesszone"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 rounded-full bg-[#0c2340] px-4 py-1.5 font-semibold text-white transition hover:bg-[#07172b]"
                          >
                            Pay on Razorpay ↗
                          </a>
                        )}
                        {order.orderStatus === "Placed" && (
                          <button
                            onClick={() => handleCancel(order.id)}
                            disabled={cancellingId === String(order.id)}
                            className="rounded-full border border-red-300 px-4 py-1.5 font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                          >
                            {cancellingId === String(order.id) ? "Cancelling..." : "Cancel Order"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </ShopShell>
  );
}

