/**
 * HubZone API client - wraps calls to the Node/Express backend.
 * Uses relative `/api` paths (which Next.js proxies) with fallback to `http://localhost:5000/api`.
 */

export const API_BASE = typeof window !== "undefined"
  ? (process.env.NEXT_PUBLIC_API_URL || "")
  : "http://localhost:5000";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("hubzone_token");
}

export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("hubzone_token", token);
}

export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("hubzone_token");
  localStorage.removeItem("hubzone_user");
}

export function getStoredUser(): any | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("hubzone_user");
  try {
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setStoredUser(user: any) {
  if (typeof window === "undefined") return;
  localStorage.setItem("hubzone_user", JSON.stringify(user));
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Only set Content-Type to JSON if body is not FormData
  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const url = endpoint.startsWith("http")
    ? endpoint
    : `${API_BASE}/api${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const errorMsg = data?.message || data?.error || `HTTP error ${res.status}`;
    if (res.status === 401) {
      clearToken();
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("hubzone_session_expired", { detail: errorMsg }));
      }
    }
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  // Auth
  auth: {
    login: (identifier: string, password: string) =>
      request<{ success: boolean; message: string; user: any; token: string }>("/login", {
        method: "POST",
        body: JSON.stringify({ identifier, password }),
      }),
    register: (payload: { name: string; email: string; password: string; phone: string; address?: string; city?: string; state?: string; pin?: string }) =>
      request<{ success: boolean; message: string; user: any; token: string }>("/register", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    getProfile: () => request<{ success: boolean; user: any }>("/profile"),
    updateProfile: (payload: any) =>
      request<{ success: boolean; message: string; user: any }>("/profile", {
        method: "PUT",
        body: JSON.stringify(payload),
      }),
  },

  // Products
  products: {
    getAll: (params?: { category?: string; sub?: string; search?: string; status?: string }) => {
      const sp = new URLSearchParams();
      if (params?.category) sp.append("category", params.category);
      if (params?.sub) sp.append("sub", params.sub);
      if (params?.search) sp.append("search", params.search);
      if (params?.status) sp.append("status", params.status);
      const q = sp.toString();
      return request<any[]>(`/products${q ? `?${q}` : ""}`);
    },
    getById: (id: string) => request<any>(`/product/${id}`),
    add: (data: FormData | any) => {
      const isFormData = data instanceof FormData;
      return request<{ success: boolean; message: string; product: any }>("/product/add", {
        method: "POST",
        body: isFormData ? data : JSON.stringify(data),
      });
    },
    update: (id: string, data: FormData | any) => {
      const isFormData = data instanceof FormData;
      return request<{ success: boolean; message: string; product: any }>(`/product/${id}`, {
        method: "PUT",
        body: isFormData ? data : JSON.stringify(data),
      });
    },
    delete: (id: string) =>
      request<{ success: boolean; message: string }>(`/product/${id}`, {
        method: "DELETE",
      }),
  },

  // Cart
  cart: {
    get: () => request<{ success: boolean; items: any[]; count: number; subtotal: number }>("/cart"),
    add: (productId: string, quantity = 1) =>
      request<{ success: boolean; message: string }>("/cart/add", {
        method: "POST",
        body: JSON.stringify({ productId, quantity }),
      }),
    updateQty: (productId: string, quantity: number) =>
      request<{ success: boolean; message: string }>("/cart/update", {
        method: "PUT",
        body: JSON.stringify({ productId, quantity }),
      }),
    remove: (productId: string) =>
      request<{ success: boolean; message: string }>(`/cart/remove/${productId}`, {
        method: "DELETE",
      }),
    clear: () =>
      request<{ success: boolean; message: string }>("/cart/clear", {
        method: "DELETE",
      }),
    sync: (lines: { id: string; qty: number }[]) =>
      request<{ success: boolean; message: string }>("/cart/sync", {
        method: "POST",
        body: JSON.stringify({ lines }),
      }),
  },

  // Orders
  orders: {
    create: (orderData: any) =>
      request<{ success: boolean; message: string; order: any }>("/order/add", {
        method: "POST",
        body: JSON.stringify(orderData),
      }),
    getMyOrders: () => request<{ success: boolean; orders: any[] }>("/myOrders"),
    getById: (id: string) => request<{ success: boolean; order: any }>(`/order/${id}`),
    cancel: (id: string) =>
      request<{ success: boolean; message: string }>(`/myOrders/cancel/${id}`, {
        method: "PUT",
      }),
    getAllAdmin: (status?: string) => {
      const q = status && status !== "all" ? `?status=${encodeURIComponent(status)}` : "";
      return request<{ success: boolean; orders: any[] }>(`/admin/orders${q}`);
    },
    updateStatusAdmin: (id: string | number, status: string) =>
      request<{ success: boolean; message: string; order: any }>(`/order/status/${id}`, {
        method: "PUT",
        body: JSON.stringify({ orderStatus: status }),
      }),
  },

  // Reviews
  reviews: {
    getByProduct: (productId: string) =>
      request<{ success: boolean; reviews: any[] }>(`/reviews/${productId}`),
    add: (payload: { productId: string; rating: number; comment: string; username?: string }) =>
      request<{ success: boolean; message: string; review: any }>("/review/add", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    getAllAdmin: () => request<{ success: boolean; reviews: any[] }>("/admin/reviews"),
    delete: (id: number | string) =>
      request<{ success: boolean; message: string }>(`/review/${id}`, {
        method: "DELETE",
      }),
  },

  // Admin User Management
  users: {
    getAllAdmin: () => request<{ success: boolean; users: any[] }>("/admin/users"),
    deleteAdmin: (id: number | string) =>
      request<{ success: boolean; message: string }>(`/admin/users/${id}`, {
        method: "DELETE",
      }),
  },
};

