import api from "./axios";

// ========================
// CART SERVICE
// ========================
export const cartService = {
  getCart: () => api.get("/cart"),
  addToCart: (data) => api.post("/cart/add", data), // { productId, variantId, quantity }
  updateCartItem: (id, data) => api.put(`/cart/update/${id}`, data), // { quantity }
  removeItem: (id) => api.delete(`/cart/remove/${id}`),
  clearCart: () => api.delete("/cart/clear"),
  getCartCount: () => api.get("/cart/count"),
  validateCart: () => api.post("/cart/validate"),
};

// ========================
// ORDER SERVICE
// ========================
export const orderService = {
  // CUSTOMER
  createOrder: () => api.post("/orders"),
  getOrders: () => api.get("/orders"),
  getOrderById: (id) => api.get(`/orders/${id}`),
  previewOrder: (couponCode) => api.post("/orders/preview", { couponCode }),
  cancelOrder: (id) => api.put(`/orders/${id}/cancel`),

  // CLIENT
  getClientOrders: () => api.get("/orders/client/my-orders"),

  // MANAGER
  getManagerOrders: () => api.get("/orders/manager/my-orders"),

  // STATUS
  updateOrderStatus: (id, data) => api.put(`/orders/${id}/status`, data),
};

// ========================
// PAYMENT SERVICE
// ========================
export const paymentService = {
  createGatewayOrder: (orderId) =>
    api.post("/payments/create-order", {
      orderId,
    }),

  verifyGatewayPayment: (data) => api.post("/payments/verify", data),
};

// ========================
// ADDRESS SERVICE
// ========================
export const addressService = {
  getAddresses: () => api.get("/address"),
  addAddress: (data) => api.post("/address", data),
  updateAddress: (id, data) => api.put(`/customers/address/${id}`, data),
  deleteAddress: (id) => api.delete(`/address/${id}`),
};

// ========================
// PRODUCT SERVICE (public)
// ========================
export const productService = {
  getProducts: (params) => api.get("/products", { params }),
  getProductById: (id) => api.get(`/products/${id}`),
  getVariants: (id) => api.get(`/products/${id}/variants`),
  getRelated: (id) => api.get(`/products/${id}/related`),
  getFilters: () => api.get("/products/filters"),
  searchProducts: (params) => api.get("/products/search", { params }),
  getProductsByCategory: (categoryName) =>
    api.get(`/products/category/${categoryName}`),
  getProductsByType: (type) => api.get(`/products/type/${type}`),
  getProductsByGenderCategory: (gender, category) =>
    api.get(`/products/${gender}/${encodeURIComponent(category)}`),
  getProductsByGenderCategoryType: (gender, category, type) =>
    api.get(
      `/products/${gender}/${encodeURIComponent(category)}/${encodeURIComponent(type)}`,
    ),
};

// ========================
// REVIEW SERVICE
// ========================
export const reviewService = {
  getProductReviews: (productId) => api.get(`/products/${productId}/reviews`),
  createReview: (productId, data) =>
    api.post(`/products/${productId}/reviews`, data),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
};

// ========================
// CUSTOMER SERVICE
// ========================
export const customerService = {
  getProfile: (userId) => api.get(`/customers/profile/${userId}`),
  updateProfile: (userId, data) =>
    api.put(`/customers/profile/${userId}`, data),
  getAddress: (userId) => api.get(`/customers/address/${userId}`),
  getDashboard: (userId) => api.get(`/customers/dashboard/${userId}`),
};
