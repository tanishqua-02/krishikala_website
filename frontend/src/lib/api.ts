// ── Central API client — KrishiSeva v3.0 ──────────────────────────────────────
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("ks_token");
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };
  const res  = await fetch(`${API_BASE}${endpoint}`, { ...options, headers });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  register:      (body: object) => request("/auth/register",       { method: "POST", body: JSON.stringify(body) }),
  login:         (body: object) => request("/auth/login",          { method: "POST", body: JSON.stringify(body) }),
  sendOtp:       (identifier: string, role?: string) => request("/auth/send-otp", { method: "POST", body: JSON.stringify({ identifier, role }) }),
  verifyOtp:     (identifier: string, otp: string) => request("/auth/verify-otp", { method: "POST", body: JSON.stringify({ identifier, otp }) }),
  getMe:         () => request("/auth/me"),
  updateProfile: (body: object) => request("/auth/update-profile", { method: "PUT",  body: JSON.stringify(body) }),
  changePassword:(body: object) => request("/auth/change-password",{ method: "PUT",  body: JSON.stringify(body) }),

  // ── Products ──────────────────────────────────────────────────────────────
  getProducts:   (params?: Record<string, string>) => {
    const q = params ? "?" + new URLSearchParams(params).toString() : "";
    return request(`/products${q}`);
  },
  getProduct:          (id: string) => request(`/products/${id}`),
  getCategories:       ()           => request("/products/categories"),
  getTrending:         ()           => request("/products/trending"),
  getFrequentlyBought: (id: string) => request(`/products/${id}/frequently-bought`),
  // Seller
  getMyProducts:       ()           => request("/products/seller/my-products"),
  createProduct:       (body: object) => request("/products", { method: "POST", body: JSON.stringify(body) }),
  sellerUpdateProduct: (id: string, body: object) => request(`/products/${id}/seller-update`, { method: "PUT", body: JSON.stringify(body) }),
  sellerDeleteProduct: (id: string) => request(`/products/${id}/seller-delete`, { method: "DELETE" }),
  requestReEnable:     (id: string) => request(`/products/${id}/request-reenable`, { method: "PUT" }),

  // ── Notifications ─────────────────────────────────────────────────────────
  getNotifications: () => request("/notifications"),
  markAllRead:      () => request("/notifications/read-all", { method: "PUT" }),
  markRead:         (id: string) => request(`/notifications/${id}/read`, { method: "PUT" }),

  // ── Cart ──────────────────────────────────────────────────────────────────
  getCart:        () => request("/cart"),
  addToCart:      (product_id: string, quantity = 1) => request("/cart/add",  { method: "POST", body: JSON.stringify({ productId: product_id, quantity }) }),
  updateCartItem: (productId: string, quantity: number) => request("/cart/update", { method: "PUT",  body: JSON.stringify({ productId, quantity }) }),
  removeFromCart: (productId: string) => request(`/cart/remove/${productId}`, { method: "DELETE" }),
  clearCart:      () => request("/cart/clear", { method: "DELETE" }),

  // ── Orders ────────────────────────────────────────────────────────────────
  createOrder:              (body: object) => request("/orders",                        { method: "POST", body: JSON.stringify(body) }),
  // Stripe (new)
  createPaymentIntent:      (body: object) => request("/orders/create-payment-intent",  { method: "POST", body: JSON.stringify(body) }),
  confirmStripePayment:     (body: object) => request("/orders/confirm-payment",        { method: "POST", body: JSON.stringify(body) }),
  // Razorpay (legacy)
  createRazorpayOrder:      (body: object) => request("/orders/create-razorpay-order",  { method: "POST", body: JSON.stringify(body) }),
  verifyRazorpayPayment:    (body: object) => request("/orders/verify-razorpay",        { method: "POST", body: JSON.stringify(body) }),
  // Buyer
  getOrders:                ()             => request("/orders/my-orders"),
  getOrder:                 (id: string)   => request(`/orders/${id}`),
  // Seller
  getSellerOrders:          (params?: Record<string, string>) => {
    const q = params ? "?" + new URLSearchParams(params).toString() : "";
    return request(`/orders/seller-orders${q}`);
  },
  updateSellerOrderStatus:  (id: string, body: object) => request(`/orders/${id}/seller-status`, { method: "PUT", body: JSON.stringify(body) }),

  // ── Scholarships ──────────────────────────────────────────────────────────
  getScholarships:   (params?: Record<string, string>) => {
    const q = params ? "?" + new URLSearchParams(params).toString() : "";
    return request(`/scholarships${q}`);
  },
  getScholarship:    (id: string) => request(`/scholarships/${id}`),
  applyScholarship:  (id: string, body?: object) => request(`/scholarships/${id}/apply`, { method: "POST", body: JSON.stringify(body || {}) }),
  getMyApplications: () => request("/scholarships/my-applications"),

  // ── Land Records ──────────────────────────────────────────────────────────
  searchLandRecord:    (body: object) => request("/land-records/search",  { method: "POST", body: JSON.stringify(body) }),
  getLandRecordHistory:()             => request("/land-records/my-records"),

  // ── Dashboard ─────────────────────────────────────────────────────────────
  getDashboard: () => request("/dashboard"),

  // ── Admin ─────────────────────────────────────────────────────────────────
  admin: {
    // Users & Farmers
    getFarmers:   (params?: Record<string, string>) => {
      const q = params ? "?" + new URLSearchParams(params).toString() : "";
      return request(`/auth/farmers${q}`);
    },
    getUsers:     (params?: Record<string, string>) => {
      const q = params ? "?" + new URLSearchParams(params).toString() : "";
      return request(`/auth/users${q}`);
    },
    getUserById:  (id: string) => request(`/auth/users/${id}`),
    deleteUser:   (id: string) => request(`/auth/users/${id}`, { method: "DELETE" }),
    verifyFarmer: (id: string, body: object) => request(`/auth/farmers/${id}/verify`, { method: "PUT", body: JSON.stringify(body) }),

    // Orders
    getAllOrders:       (params?: Record<string, string>) => {
      const q = params ? "?" + new URLSearchParams(params).toString() : "";
      return request(`/orders/admin${q}`);
    },
    updateOrderStatus:  (id: string, body: object) => request(`/orders/${id}/status`, { method: "PUT", body: JSON.stringify(body) }),
    getOrderStats:      () => request("/orders/stats"),

    // Products
    getPendingProducts: () => request("/products/admin/pending"),
    getAllProducts:     (params?: Record<string, string>) => {
      const q = params ? "?" + new URLSearchParams(params).toString() : "";
      return request(`/products/admin/all${q}`);
    },
    approveProduct:     (id: string, body: object) => request(`/products/${id}/approve`, { method: "PUT", body: JSON.stringify(body) }),
    hideProduct:        (id: string, body: object) => request(`/products/${id}/hide`, { method: "PUT", body: JSON.stringify(body) }),
    editProduct:        (id: string, body: object) => request(`/products/${id}/admin-edit`, { method: "PUT", body: JSON.stringify(body) }),
    createProduct:      (body: object) => request("/products", { method: "POST", body: JSON.stringify(body) }),
    deleteProduct:      (id: string) => request(`/products/${id}`, { method: "DELETE" }),

    // Scholarships
    getAllApplications:       (params?: Record<string, string>) => {
      const q = params ? "?" + new URLSearchParams(params).toString() : "";
      return request(`/scholarships/admin/applications${q}`);
    },
    updateApplicationStatus: (id: string, body: object) => request(`/scholarships/admin/applications/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  },

  // ── Chat ──────────────────────────────────────────────────────────────────
  chat: (message: string, language: string, history: { role: string; content: string }[]) =>
    request("/chat", { method: "POST", body: JSON.stringify({ message, language, history }) }),
};
