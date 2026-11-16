"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent, type ChangeEvent } from "react";
import ShopShell, { ShopTop, WRAP } from "@/components/ShopShell";
import { useAuth } from "@/lib/auth";
import { api } from "@/lib/api";
import { inr, setLiveProducts, sortProducts } from "@/lib/products";
import { toast } from "sonner";

type TabId = "overview" | "products" | "orders" | "users" | "reviews" | "profile";

type ProductData = {
  id: string;
  name: string;
  cat: string;
  sub?: string;
  price: number;
  offer?: number;
  desc?: string;
  ingredients?: string;
  img: string;
  images?: string[];
  status: "in_stock" | "out_of_stock";
};

type OrderData = {
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
  items: any[];
  itemCount: number;
  createdAt: string;
};

type UserData = {
  id: number;
  username: string;
  email: string;
  phone: string;
  address?: string;
  city?: string;
  state?: string;
  pin?: string;
  role: string;
  created_at: string;
};

type ReviewData = {
  id: number;
  product_id: string;
  product_name?: string;
  product_img?: string;
  product_cat?: string;
  user_email: string;
  username: string;
  rating: number;
  comment: string;
  created_at: string;
};

const CATEGORIES = [
  { id: "care", label: "HubCare (Ayurvedic)" },
  { id: "perfume", label: "HubNoir (Perfumes)" },
  { id: "cook", label: "HubCook (Cookware)" },
  { id: "coffee", label: "HubCof (Coffee)" },
  { id: "wash", label: "HubWash (Cleaning)" },
];

const inputCls =
  "w-full rounded-[14px] bg-[#fbf6ea] px-4 py-3 text-[14.5px] text-[#2a231e] outline-none border-[1.5px] border-[#2a231e]/15 focus:border-[#2a231e] focus:bg-white placeholder:text-[#6a5c4f]/60 transition";

export default function AdminPage() {
  const router = useRouter();
  const { user, isAdmin, loading: authLoading, logout, updateProfile } = useAuth();
  const [tab, setTab] = useState<TabId>("overview");

  // Data
  const [products, setProducts] = useState<ProductData[]>([]);
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [users, setUsers] = useState<UserData[]>([]);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Product modal
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductData | null>(null);
  const [prodForm, setProdForm] = useState({
    id: "",
    name: "",
    cat: "care",
    sub: "",
    price: "",
    offer: "",
    desc: "",
    ingredients: "",
    img: "",
    status: "in_stock" as "in_stock" | "out_of_stock",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [savingProduct, setSavingProduct] = useState(false);

  // Search/Filter
  const [prodSearch, setProdSearch] = useState("");
  const [orderFilter, setOrderFilter] = useState("all");

  // Product Pagination
  const [prodPage, setProdPage] = useState(1);
  const [prodPerPage, setProdPerPage] = useState(8);

  // Admin profile form
  const [adminName, setAdminName] = useState("");
  const [adminPhone, setAdminPhone] = useState("");
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const loadAll = async () => {
    try {
      setLoading(true);
      setError("");
      const [pRes, oRes, uRes, rRes] = await Promise.all([
        api.products.getAll(),
        api.orders.getAllAdmin(),
        api.users.getAllAdmin(),
        api.reviews.getAllAdmin(),
      ]);
      setProducts(pRes || []);
      if (Array.isArray(pRes)) {
        setLiveProducts(pRes as any);
      }
      setOrders(oRes?.orders || []);
      setUsers(uRes?.users || []);
      setReviews(rRes?.reviews || []);
    } catch (err: any) {
      const msg = err.message || "Failed to load admin data.";
      setError(msg);
      if (
        msg.toLowerCase().includes("expired") ||
        msg.toLowerCase().includes("token") ||
        msg.toLowerCase().includes("log in")
      ) {
        toast.error("Your admin session has expired. Please sign in again.");
        logout();
      } else {
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        toast.error("Please sign in as an administrator.");
        router.replace("/login?redirect=/admin");
      } else if (!isAdmin) {
        toast.error("Access denied. Admin privileges required.");
        router.replace("/");
      } else {
        loadAll();
        setAdminName(user.username || "");
        setAdminPhone(user.phone || "");
      }
    }
  }, [isAdmin, authLoading, user, router]);

  const flashMessage = (msg: string) => {
    setMessage(msg);
    toast.success(msg);
    setTimeout(() => setMessage(""), 4500);
  };

  // --- Product actions ---
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdForm({
      id: "",
      name: "",
      cat: "care",
      sub: "",
      price: "",
      offer: "",
      desc: "",
      ingredients: "",
      img: "",
      status: "in_stock",
    });
    setSelectedFile(null);
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (p: ProductData) => {
    setEditingProduct(p);
    setProdForm({
      id: p.id,
      name: p.name,
      cat: p.cat,
      sub: p.sub || "",
      price: String(p.price || ""),
      offer: p.offer !== undefined ? String(p.offer) : "",
      desc: p.desc || "",
      ingredients: p.ingredients || "",
      img: p.img || "",
      status: p.status || "in_stock",
    });
    setSelectedFile(null);
    setShowProductModal(true);
  };

  const handleSaveProduct = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProduct(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("name", prodForm.name);
      formData.append("cat", prodForm.cat);
      formData.append("sub", prodForm.sub);
      formData.append("price", prodForm.price);
      formData.append("offer", prodForm.offer);
      formData.append("desc", prodForm.desc);
      formData.append("ingredients", prodForm.ingredients);
      formData.append("status", prodForm.status);

      if (selectedFile) {
        formData.append("image", selectedFile);
      } else if (prodForm.img) {
        formData.append("imageUrl", prodForm.img);
      }

      if (editingProduct) {
        await api.products.update(editingProduct.id, formData);
        flashMessage(`Product "${prodForm.name}" updated successfully!`);
      } else {
        if (prodForm.id) formData.append("id", prodForm.id);
        await api.products.add(formData);
        flashMessage(`Product "${prodForm.name}" added successfully!`);
      }

      setShowProductModal(false);
      await loadAll();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("hubzone_products_updated"));
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to save product.");
    } finally {
      setSavingProduct(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${name}"?`)) return;
    try {
      await api.products.delete(id);
      flashMessage(`Product "${name}" deleted.`);
      await loadAll();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("hubzone_products_updated"));
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product.");
    }
  };

  const handleToggleStock = async (p: ProductData) => {
    const newStatus = p.status === "in_stock" ? "out_of_stock" : "in_stock";
    try {
      await api.products.update(p.id, { status: newStatus });
      flashMessage(`Stock status updated for ${p.name}`);
      await loadAll();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("hubzone_products_updated"));
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update stock status.");
    }
  };

  // --- Order actions ---
  const handleUpdateOrderStatus = async (orderId: number | string, newStatus: string) => {
    try {
      await api.orders.updateStatusAdmin(orderId, newStatus);
      flashMessage(`Order #${orderId} marked as ${newStatus}!`);
      await loadAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to update order status.");
    }
  };

  // --- User actions ---
  const handleDeleteUser = async (id: number, username: string, email: string) => {
    if (!window.confirm(`Are you sure you want to delete user ${username} (${email})?`)) return;
    try {
      await api.users.deleteAdmin(id);
      flashMessage(`User ${username} deleted.`);
      await loadAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user.");
    }
  };

  // --- Review actions ---
  const handleDeleteReview = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this customer review?")) return;
    try {
      await api.reviews.delete(id);
      flashMessage("Review deleted.");
      await loadAll();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete review.");
    }
  };

  // --- Admin Profile Save ---
  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      await updateProfile({
        username: adminName.trim(),
        phone: adminPhone.trim(),
        ...(newPw ? { currentPassword: currentPw, newPassword: newPw } : {}),
      });
      flashMessage("Admin profile updated successfully!");
      setCurrentPw("");
      setNewPw("");
    } catch (err: any) {
      toast.error(err.message || "Failed to update admin profile.");
    } finally {
      setSavingProfile(false);
    }
  };

  if (authLoading) {
    return (
      <ShopShell>
        <ShopTop bottom="pb-10 sm:pb-14">
          <h1 className="mb-2.5 font-[family-name:var(--font-serif)] text-4xl">Admin Portal</h1>
        </ShopTop>
        <main className={`${WRAP} py-20 text-center text-[#6a5c4f]`}>
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#2a231e] border-t-transparent mx-auto" />
        </main>
      </ShopShell>
    );
  }

  if (!isAdmin) {
    return (
      <ShopShell>
        <ShopTop bottom="pb-10 sm:pb-14">
          <h1 className="mb-2.5 font-[family-name:var(--font-serif)] text-4xl">Access Restricted</h1>
        </ShopTop>
        <main className={`${WRAP} py-16 text-center`}>
          <div className="rounded-[28px] bg-white p-10 max-w-md mx-auto shadow-sm">
            <h2 className="font-[family-name:var(--font-serif)] text-2xl font-medium text-rose-700">
              Admin Privileges Required
            </h2>
            <p className="mt-2 text-sm text-[#6a5c4f]">
              You must be logged in as an administrator to view this portal.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                href="/login?redirect=/admin"
                className="rounded-full bg-[#2a231e] text-[#f6e9d0] px-6 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#b8613a] transition"
              >
                Admin Login
              </Link>
              <Link
                href="/"
                className="rounded-full border border-[#2a231e]/20 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-100 transition"
              >
                Back to Site
              </Link>
            </div>
          </div>
        </main>
      </ShopShell>
    );
  }

  // Filtered lists
  const filteredProducts = sortProducts(
    products.filter(
      (p) =>
        p.name.toLowerCase().includes(prodSearch.toLowerCase()) ||
        p.cat.toLowerCase().includes(prodSearch.toLowerCase()) ||
        p.id.toLowerCase().includes(prodSearch.toLowerCase())
    )
  );

  const totalProdPages = Math.max(1, Math.ceil(filteredProducts.length / prodPerPage));
  const currentProdPage = Math.min(prodPage, totalProdPages);
  const startProdIdx = (currentProdPage - 1) * prodPerPage;
  const paginatedProducts = filteredProducts.slice(startProdIdx, startProdIdx + prodPerPage);

  const filteredOrders = orders.filter(
    (o) => orderFilter === "all" || o.orderStatus === orderFilter
  );

  const totalRevenue = orders
    .filter((o) => o.orderStatus !== "Cancelled")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);

  return (
    <ShopShell>
      <ShopTop bottom="pb-10 sm:pb-14">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-[#f08a24]">
              Management Console
            </span>
            <h1 className="mt-1 font-[family-name:var(--font-serif)] text-[length:clamp(36px,6vw,72px)] font-medium leading-[1.02] tracking-[-0.01em]">
              HubZone Admin
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAll}
              className="rounded-full border border-white/30 px-5 py-2 text-xs font-medium uppercase tracking-wider text-white hover:bg-white/10 transition"
            >
              Refresh Data
            </button>
            <button
              onClick={logout}
              className="rounded-full bg-white text-neutral-900 px-5 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-neutral-200 transition"
            >
              Sign out
            </button>
          </div>
        </div>
      </ShopTop>

      <main className={`${WRAP} py-10 sm:py-14`}>
        {/* Flash Message */}
        {message && (
          <div className="mb-6 rounded-[16px] bg-emerald-50 border border-emerald-300 p-4 text-sm font-medium text-emerald-800 animate-fadeIn">
            ✓ {message}
          </div>
        )}

        {/* Tab Navigation Pill Bar */}
        <div className="mb-8 flex flex-wrap gap-2 rounded-full bg-[#f0e5d0] p-1.5 text-xs font-semibold uppercase tracking-wider">
          {[
            { id: "overview", label: "Overview" },
            { id: "products", label: `Products (${products.length})` },
            { id: "orders", label: `Orders (${orders.length})` },
            { id: "users", label: `Customers (${users.length})` },
            { id: "reviews", label: `Reviews (${reviews.length})` },
            { id: "profile", label: "Admin Profile" },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id as TabId)}
              className={`rounded-full px-5 py-2.5 transition ${
                tab === t.id
                  ? "bg-[#2a231e] text-[#f6e9d0] shadow-sm"
                  : "text-[#6a5c4f] hover:text-[#2a231e]"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* ========================================================= */}
        {/* TAB 1: OVERVIEW                                           */}
        {/* ========================================================= */}
        {tab === "overview" && (
          <div className="space-y-8">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:gap-6">
              <div className="rounded-[22px] bg-white p-6 shadow-sm border border-[#2a231e]/10">
                <span className="text-xs uppercase font-medium text-[#6a5c4f]">Total Revenue</span>
                <p className="mt-2 font-[family-name:var(--font-serif)] text-3xl font-medium text-[#2a231e]">
                  {inr(totalRevenue)}
                </p>
                <span className="text-xs text-emerald-700 mt-1 block font-medium">All active orders</span>
              </div>

              <div className="rounded-[22px] bg-white p-6 shadow-sm border border-[#2a231e]/10">
                <span className="text-xs uppercase font-medium text-[#6a5c4f]">Total Orders</span>
                <p className="mt-2 font-[family-name:var(--font-serif)] text-3xl font-medium text-[#2a231e]">
                  {orders.length}
                </p>
                <span className="text-xs text-[#6a5c4f] mt-1 block">
                  {orders.filter((o) => o.orderStatus === "Placed").length} pending shipments
                </span>
              </div>

              <div className="rounded-[22px] bg-white p-6 shadow-sm border border-[#2a231e]/10">
                <span className="text-xs uppercase font-medium text-[#6a5c4f]">Live Products</span>
                <p className="mt-2 font-[family-name:var(--font-serif)] text-3xl font-medium text-[#2a231e]">
                  {products.length}
                </p>
                <span className="text-xs text-emerald-700 mt-1 block">
                  {products.filter((p) => p.status === "in_stock").length} in stock
                </span>
              </div>

              <div className="rounded-[22px] bg-white p-6 shadow-sm border border-[#2a231e]/10">
                <span className="text-xs uppercase font-medium text-[#6a5c4f]">Registered Users</span>
                <p className="mt-2 font-[family-name:var(--font-serif)] text-3xl font-medium text-[#2a231e]">
                  {users.length}
                </p>
                <span className="text-xs text-[#6a5c4f] mt-1 block">{reviews.length} product reviews</span>
              </div>
            </div>

            {/* Recent Orders Preview */}
            <div className="rounded-[26px] bg-white p-6 sm:p-8 shadow-sm border border-[#2a231e]/10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-[family-name:var(--font-serif)] text-2xl font-medium text-[#2a231e]">
                    Recent Orders
                  </h3>
                  <p className="text-xs text-[#6a5c4f]">Latest purchases waiting for dispatch</p>
                </div>
                <button
                  onClick={() => setTab("orders")}
                  className="text-xs font-semibold uppercase tracking-wider text-[#b8613a] hover:underline"
                >
                  View All Orders →
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="py-8 text-center text-sm text-[#6a5c4f]">
                  No customer orders placed yet. Live customer orders will appear here automatically.
                </div>
              ) : (
                orders.slice(0, 5).map((o) => (
                  <div
                    key={o.id}
                    className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2a231e]/10 py-4 last:border-b-0"
                  >
                    <div>
                      <span className="font-semibold text-sm text-[#2a231e]">{o.orderNumber}</span>
                      <p className="text-xs text-[#6a5c4f]">
                        {o.username} ({o.userEmail}) · {o.itemCount} items
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase ${
                          o.orderStatus === "Placed"
                            ? "bg-amber-100 text-amber-800"
                            : o.orderStatus === "Shipped"
                            ? "bg-blue-100 text-blue-800"
                            : o.orderStatus === "Delivered"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {o.orderStatus}
                      </span>
                      <span className="font-[family-name:var(--font-serif)] text-lg font-medium">
                        {inr(o.totalAmount)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: PRODUCTS MANAGEMENT                                */}
        {/* ========================================================= */}
        {tab === "products" && (
          <div>
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-1 items-center gap-3 max-w-md">
                <input
                  type="text"
                  placeholder="Search products by name or category..."
                  value={prodSearch}
                  onChange={(e) => {
                    setProdSearch(e.target.value);
                    setProdPage(1);
                  }}
                  className={inputCls}
                />
              </div>

              <button
                onClick={handleOpenAddProduct}
                className="rounded-full bg-[#2a231e] px-7 py-3 text-xs font-semibold uppercase tracking-wider text-[#f6e9d0] hover:bg-[#b8613a] transition"
              >
                + Add New Product
              </button>
            </div>

            <div className="overflow-x-auto rounded-[24px] bg-white shadow-sm border border-[#2a231e]/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#fbf6ea] border-b border-[#2a231e]/10 text-xs uppercase tracking-wider text-[#6a5c4f]">
                  <tr>
                    <th className="px-6 py-4">Product</th>
                    <th className="px-4 py-4">Category</th>
                    <th className="px-4 py-4">Price</th>
                    <th className="px-4 py-4">Offer Price</th>
                    <th className="px-4 py-4">Stock Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a231e]/10">
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-[#6a5c4f]">
                        No products found {prodSearch ? `matching "${prodSearch}"` : ""}.
                      </td>
                    </tr>
                  ) : (
                    paginatedProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-neutral-50/70 transition">
                        <td className="px-6 py-4 flex items-center gap-3">
                          <img
                            src={p.img}
                            alt={p.name}
                            className="h-12 w-12 rounded-lg object-contain bg-[#fbf6ea] p-1 border border-[#2a231e]/10"
                          />
                          <div>
                            <Link href={`/shop/${p.id}`} className="font-semibold text-[#2a231e] hover:underline">
                              {p.name}
                            </Link>
                            <span className="block text-xs text-[#6a5c4f]">ID: {p.id}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 uppercase text-xs font-medium text-[#6a5c4f]">
                          {p.cat}
                        </td>
                        <td className="px-4 py-4 font-medium text-[#2a231e]">
                          {inr(p.price)}
                        </td>
                        <td className="px-4 py-4 text-[#2e7d32] font-semibold">
                          {p.offer ? inr(p.offer) : "—"}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => handleToggleStock(p)}
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider transition ${
                              p.status === "in_stock"
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : "bg-rose-100 text-rose-800 hover:bg-rose-200"
                            }`}
                          >
                            {p.status === "in_stock" ? "In Stock" : "Out of Stock"}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button
                            onClick={() => handleOpenEditProduct(p)}
                            className="rounded-full border border-[#2a231e]/20 px-3.5 py-1 text-xs font-medium uppercase text-[#2a231e] hover:bg-[#2a231e] hover:text-white transition"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(p.id, p.name)}
                            className="rounded-full border border-red-200 px-3.5 py-1 text-xs font-medium uppercase text-red-600 hover:bg-red-50 transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination Controls */}
              <div className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 border-t border-[#2a231e]/10 bg-[#fbf6ea]/40 text-xs text-[#6a5c4f]">
                <div className="flex items-center gap-3">
                  <span>
                    {filteredProducts.length === 0
                      ? "Showing 0 products"
                      : `Showing ${startProdIdx + 1}–${Math.min(startProdIdx + prodPerPage, filteredProducts.length)} of ${filteredProducts.length} products`}
                  </span>
                  <div className="flex items-center gap-1.5 ml-2">
                    <span>Per page:</span>
                    <select
                      value={prodPerPage}
                      onChange={(e) => {
                        setProdPerPage(Number(e.target.value));
                        setProdPage(1);
                      }}
                      className="rounded-lg border border-[#2a231e]/20 bg-white px-2 py-1 text-xs text-[#2a231e] outline-none"
                    >
                      <option value={5}>5</option>
                      <option value={8}>8</option>
                      <option value={12}>12</option>
                      <option value={20}>20</option>
                      <option value={50}>50</option>
                    </select>
                  </div>
                </div>

                {totalProdPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setProdPage((p) => Math.max(1, p - 1))}
                      disabled={currentProdPage === 1}
                      className="rounded-lg border border-[#2a231e]/20 bg-white px-3 py-1.5 font-medium text-[#2a231e] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 transition"
                    >
                      Previous
                    </button>

                    {Array.from({ length: totalProdPages }, (_, i) => i + 1).map((pNum) => {
                      if (
                        totalProdPages > 7 &&
                        pNum !== 1 &&
                        pNum !== totalProdPages &&
                        Math.abs(pNum - currentProdPage) > 1
                      ) {
                        if (pNum === 2 || pNum === totalProdPages - 1) {
                          return (
                            <span key={`dots-${pNum}`} className="px-1 text-neutral-400">
                              …
                            </span>
                          );
                        }
                        return null;
                      }
                      return (
                        <button
                          key={pNum}
                          type="button"
                          onClick={() => setProdPage(pNum)}
                          className={`min-w-8 h-8 rounded-lg text-xs font-semibold transition ${
                            pNum === currentProdPage
                              ? "bg-[#2a231e] text-[#f6e9d0]"
                              : "border border-[#2a231e]/20 bg-white text-[#2a231e] hover:bg-neutral-50"
                          }`}
                        >
                          {pNum}
                        </button>
                      );
                    })}

                    <button
                      type="button"
                      onClick={() => setProdPage((p) => Math.min(totalProdPages, p + 1))}
                      disabled={currentProdPage === totalProdPages}
                      className="rounded-lg border border-[#2a231e]/20 bg-white px-3 py-1.5 font-medium text-[#2a231e] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-neutral-50 transition"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 3: ORDERS MANAGEMENT                                  */}
        {/* ========================================================= */}
        {tab === "orders" && (
          <div className="space-y-6">
            {/* Filter buttons */}
            <div className="flex flex-wrap items-center gap-2">
              {["all", "Placed", "Shipped", "Delivered", "Cancelled"].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderFilter(st)}
                  className={`rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                    orderFilter === st
                      ? "bg-[#2a231e] text-[#f6e9d0]"
                      : "bg-white text-[#6a5c4f] border border-[#2a231e]/15 hover:bg-neutral-100"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="rounded-[22px] bg-white p-12 text-center text-[#6a5c4f] border border-[#2a231e]/10">
                No orders found under this filter.
              </div>
            ) : (
              <div className="space-y-6">
                {filteredOrders.map((order) => {
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
                      className="overflow-hidden rounded-[26px] bg-white shadow-sm border border-[#2a231e]/10"
                    >
                      {/* Order Head */}
                      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#fbf6ea] border-b border-[#2a231e]/10 px-6 py-4">
                        <div>
                          <span className="text-xs uppercase text-[#6a5c4f] font-semibold">
                            Order #{order.orderNumber}
                          </span>
                          <p className="font-[family-name:var(--font-serif)] text-lg font-medium text-[#2a231e]">
                            Customer: {order.username} ({order.userEmail})
                          </p>
                          <span className="text-xs text-[#6a5c4f]">Placed on {dateStr}</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`rounded-full px-3.5 py-1 text-xs font-semibold uppercase ${
                              order.orderStatus === "Placed"
                                ? "bg-amber-100 text-amber-800"
                                : order.orderStatus === "Shipped"
                                ? "bg-blue-100 text-blue-800"
                                : order.orderStatus === "Delivered"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-rose-100 text-rose-800"
                            }`}
                          >
                            {order.orderStatus}
                          </span>
                          <span className="font-[family-name:var(--font-serif)] text-2xl font-medium">
                            {inr(order.totalAmount)}
                          </span>
                        </div>
                      </div>

                      {/* Items & Shipping address */}
                      <div className="p-6">
                        <div className="grid gap-6 md:grid-cols-[1.5fr_1fr]">
                          <div>
                            <span className="text-xs uppercase font-semibold text-[#6a5c4f] block mb-3">
                              Items Ordered ({order.itemCount})
                            </span>
                            <ul className="divide-y divide-[#2a231e]/10">
                              {order.items.map((it, idx) => (
                                <li key={idx} className="py-2.5 flex items-center justify-between text-sm">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={it.img || `/products/${it.id}.webp`}
                                      alt={it.name}
                                      className="h-10 w-10 rounded-md object-contain bg-[#fbf6ea]"
                                    />
                                    <div>
                                      <p className="font-medium text-[#2a231e]">{it.name}</p>
                                      <span className="text-xs text-[#6a5c4f]">
                                        Qty: {it.qty} × {inr(it.price)}
                                      </span>
                                    </div>
                                  </div>
                                  <span className="font-semibold text-[#2a231e]">
                                    {inr(it.price * it.qty)}
                                  </span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          <div className="border-t md:border-t-0 md:border-l border-[#2a231e]/10 pt-4 md:pt-0 md:pl-6 text-sm">
                            <span className="text-xs uppercase font-semibold text-[#6a5c4f] block mb-2">
                              Delivery Address & Contact
                            </span>
                            <p className="font-medium text-[#2a231e]">{order.username}</p>
                            <p className="text-[#6a5c4f] text-xs leading-relaxed mt-1">
                              {order.address}, {order.city} {order.pin}
                            </p>
                            <p className="text-xs text-[#6a5c4f] mt-1 font-medium">
                              Phone: <span className="text-[#2a231e]">{order.phone}</span>
                            </p>
                            <p className="text-xs text-[#6a5c4f] mt-1">
                              Payment: <span className="font-medium text-[#2a231e]">{order.paymentMethod}</span>
                            </p>

                            {/* Status Change Controls */}
                            <div className="mt-6 border-t border-[#2a231e]/10 pt-4">
                              <span className="text-xs uppercase font-semibold text-[#6a5c4f] block mb-2">
                                Update Order Status
                              </span>
                              <div className="flex flex-wrap gap-2">
                                {order.orderStatus === "Placed" && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, "Shipped")}
                                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition"
                                  >
                                    Mark as Shipped
                                  </button>
                                )}
                                {order.orderStatus === "Shipped" && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, "Delivered")}
                                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 text-xs font-semibold uppercase tracking-wider transition"
                                  >
                                    Mark as Delivered
                                  </button>
                                )}
                                {order.orderStatus !== "Cancelled" && order.orderStatus !== "Delivered" && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order.id, "Cancelled")}
                                    className="rounded-full border border-red-300 text-red-600 hover:bg-red-50 px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition"
                                  >
                                    Cancel
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 4: USERS MANAGEMENT                                   */}
        {/* ========================================================= */}
        {tab === "users" && (
          <div>
            {users.length === 0 ? (
              <div className="rounded-[22px] bg-white p-12 text-center text-[#6a5c4f] border border-[#2a231e]/10">
                No customer accounts registered yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-[24px] bg-white shadow-sm border border-[#2a231e]/10">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#fbf6ea] border-b border-[#2a231e]/10 text-xs uppercase tracking-wider text-[#6a5c4f]">
                  <tr>
                    <th className="px-6 py-4">Customer Name</th>
                    <th className="px-4 py-4">Email</th>
                    <th className="px-4 py-4">Phone</th>
                    <th className="px-4 py-4">Role</th>
                    <th className="px-4 py-4">City</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2a231e]/10">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-neutral-50/70 transition">
                      <td className="px-6 py-4 font-semibold text-[#2a231e]">
                        {u.username}
                      </td>
                      <td className="px-4 py-4 text-[#6a5c4f]">{u.email}</td>
                      <td className="px-4 py-4 text-[#2a231e]">{u.phone}</td>
                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${
                            u.role === "admin"
                              ? "bg-amber-100 text-amber-900"
                              : "bg-emerald-100 text-emerald-900"
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[#6a5c4f]">{u.city || "—"}</td>
                      <td className="px-6 py-4 text-right">
                        {u.role !== "admin" ? (
                          <button
                            onClick={() => handleDeleteUser(u.id, u.username, u.email)}
                            className="rounded-full border border-red-300 px-3.5 py-1 text-xs font-medium uppercase text-red-600 hover:bg-red-50 transition"
                          >
                            Delete User
                          </button>
                        ) : (
                          <span className="text-xs text-[#6a5c4f]">Admin</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 5: REVIEWS MANAGEMENT                                 */}
        {/* ========================================================= */}
        {tab === "reviews" && (
          <div>
            {reviews.length === 0 ? (
              <div className="rounded-[22px] bg-white p-12 text-center text-[#6a5c4f] border border-[#2a231e]/10">
                No customer reviews submitted yet.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-[24px] bg-white shadow-sm border border-[#2a231e]/10">
                <table className="w-full text-left text-sm">
                  <thead className="bg-[#fbf6ea] border-b border-[#2a231e]/10 text-xs uppercase tracking-wider text-[#6a5c4f]">
                    <tr>
                      <th className="px-6 py-4">Product</th>
                      <th className="px-4 py-4">Customer</th>
                      <th className="px-4 py-4">Rating</th>
                      <th className="px-6 py-4">Comment</th>
                      <th className="px-4 py-4">Date</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2a231e]/10">
                    {reviews.map((rev) => (
                      <tr key={rev.id} className="hover:bg-neutral-50/70 transition">
                        <td className="px-6 py-4 font-medium text-[#2a231e]">
                          <Link href={`/shop/${rev.product_id}`} className="hover:underline">
                            {rev.product_name || rev.product_id}
                          </Link>
                        </td>
                        <td className="px-4 py-4">
                          <span className="font-semibold text-xs text-[#2a231e] block">
                            {rev.username}
                          </span>
                          <span className="text-xs text-[#6a5c4f]">{rev.user_email}</span>
                        </td>
                        <td className="px-4 py-4 text-amber-500 font-semibold whitespace-nowrap">
                          {"★".repeat(rev.rating)}
                        </td>
                        <td className="px-6 py-4 text-xs text-[#6a5c4f] max-w-xs leading-relaxed">
                          {rev.comment}
                        </td>
                        <td className="px-4 py-4 text-xs text-[#6a5c4f] whitespace-nowrap">
                          {new Date(rev.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleDeleteReview(rev.id)}
                            className="rounded-full border border-red-300 px-3.5 py-1 text-xs font-medium uppercase text-red-600 hover:bg-red-50 transition"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 6: ADMIN PROFILE UPDATE                               */}
        {/* ========================================================= */}
        {tab === "profile" && (
          <div className="max-w-xl mx-auto rounded-[26px] bg-white p-8 shadow-sm border border-[#2a231e]/10">
            <h3 className="font-[family-name:var(--font-serif)] text-2xl font-medium text-[#2a231e] mb-2">
              Update Administrator Profile
            </h3>
            <p className="text-xs text-[#6a5c4f] mb-6">
              Update your administrative display name, contact phone, or login password.
            </p>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs uppercase font-semibold text-[#6a5c4f] mb-1">
                  Admin Name
                </label>
                <input
                  type="text"
                  value={adminName}
                  onChange={(e) => setAdminName(e.target.value)}
                  className={inputCls}
                  required
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-[#6a5c4f] mb-1">
                  Admin Email (Account identifier)
                </label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className={`${inputCls} bg-neutral-100 cursor-not-allowed opacity-75`}
                />
              </div>

              <div>
                <label className="block text-xs uppercase font-semibold text-[#6a5c4f] mb-1">
                  Admin Phone
                </label>
                <input
                  type="tel"
                  value={adminPhone}
                  onChange={(e) => setAdminPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  className={inputCls}
                  required
                />
              </div>

              <div className="border-t border-[#2a231e]/10 pt-4">
                <span className="text-xs font-semibold uppercase text-[#6a5c4f] block mb-2">
                  Change Password (optional)
                </span>
                <div className="space-y-3">
                  <input
                    type="password"
                    placeholder="Current Admin Password"
                    value={currentPw}
                    onChange={(e) => setCurrentPw(e.target.value)}
                    className={inputCls}
                  />
                  <input
                    type="password"
                    placeholder="New Admin Password"
                    value={newPw}
                    onChange={(e) => setNewPw(e.target.value)}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="rounded-full bg-[#2a231e] text-[#f6e9d0] px-8 py-3 text-xs font-semibold uppercase tracking-wider hover:bg-[#b8613a] transition disabled:opacity-60"
                >
                  {savingProfile ? "Saving..." : "Save Admin Profile"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ========================================================= */}
        {/* PRODUCT ADD / EDIT MODAL                                  */}
        {/* ========================================================= */}
        {showProductModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm overflow-y-auto">
            <div className="my-8 max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-[28px] bg-white p-6 sm:p-8 shadow-2xl">
              <div className="flex items-center justify-between border-b border-[#2a231e]/10 pb-4 mb-6">
                <h3 className="font-[family-name:var(--font-serif)] text-2xl font-medium text-[#2a231e]">
                  {editingProduct ? "Edit Product Details" : "Add New Product"}
                </h3>
                <button
                  onClick={() => setShowProductModal(false)}
                  className="rounded-full p-2 text-[#6a5c4f] hover:bg-neutral-100 transition"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4">
                {!editingProduct && (
                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#6a5c4f] mb-1">
                      Product ID / Slug (Optional, auto-generated from name if blank)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. coconut_oil_200ml"
                      value={prodForm.id}
                      onChange={(e) => setProdForm({ ...prodForm, id: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs uppercase font-semibold text-[#6a5c4f] mb-1">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Herbal Hair Oil 200 ml"
                    value={prodForm.name}
                    onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                    className={inputCls}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#6a5c4f] mb-1">
                      Category *
                    </label>
                    <select
                      value={prodForm.cat}
                      onChange={(e) => setProdForm({ ...prodForm, cat: e.target.value })}
                      className={inputCls}
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#6a5c4f] mb-1">
                      Stock Status *
                    </label>
                    <select
                      value={prodForm.status}
                      onChange={(e) =>
                        setProdForm({
                          ...prodForm,
                          status: e.target.value as "in_stock" | "out_of_stock",
                        })
                      }
                      className={inputCls}
                    >
                      <option value="in_stock">In Stock</option>
                      <option value="out_of_stock">Out of Stock</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#6a5c4f] mb-1">
                      Original Price (₹) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 550"
                      value={prodForm.price}
                      onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                      className={inputCls}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-[#6a5c4f] mb-1">
                      Offer Price (₹, optional)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="e.g. 499"
                      value={prodForm.offer}
                      onChange={(e) => setProdForm({ ...prodForm, offer: e.target.value })}
                      className={inputCls}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase font-semibold text-[#6a5c4f] mb-1">
                    Upload Product Image (or provide URL below)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e: ChangeEvent<HTMLInputElement>) => {
                      if (e.target.files && e.target.files[0]) {
                        setSelectedFile(e.target.files[0]);
                      }
                    }}
                    className={inputCls}
                  />
                  {!selectedFile && (
                    <input
                      type="text"
                      placeholder="or Image path/URL: /products/hair_oil.jpeg"
                      value={prodForm.img}
                      onChange={(e) => setProdForm({ ...prodForm, img: e.target.value })}
                      className={`${inputCls} mt-2`}
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase font-semibold text-[#6a5c4f] mb-1">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Product details, benefits, and usage instructions..."
                    value={prodForm.desc}
                    onChange={(e) => setProdForm({ ...prodForm, desc: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div>
                  <label className="block text-xs uppercase font-semibold text-[#6a5c4f] mb-1">
                    Ingredients (optional)
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Key natural ingredients, herbal extracts..."
                    value={prodForm.ingredients}
                    onChange={(e) => setProdForm({ ...prodForm, ingredients: e.target.value })}
                    className={inputCls}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-[#2a231e]/10">
                  <button
                    type="button"
                    onClick={() => setShowProductModal(false)}
                    className="rounded-full border border-[#2a231e]/20 px-6 py-2.5 text-xs font-semibold uppercase tracking-wider text-[#6a5c4f] hover:bg-neutral-100 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingProduct}
                    className="rounded-full bg-[#2a231e] text-[#f6e9d0] px-7 py-2.5 text-xs font-semibold uppercase tracking-wider hover:bg-[#b8613a] transition disabled:opacity-60"
                  >
                    {savingProduct ? "Saving..." : editingProduct ? "Save Changes" : "Create Product"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </ShopShell>
  );
}

