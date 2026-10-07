const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

// Auth
export async function health() {
  const res = await fetch(`${API_URL}/`);
  return res.json();
}

export async function register(user) {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  })
  return res.json();
}

export async function login(creds) {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(creds)
  })
  return res.json();
}

export async function getMe(token) {
  const res = await fetch(`${API_URL}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json();
}

export async function updateProfile(profile, token) {
  const res = await fetch(`${API_URL}/api/auth/profile`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(profile)
  })
  return res.json();
}

// Products
export async function getProducts(filters = {}) {
  const params = new URLSearchParams();
  if (filters.q) params.append('q', filters.q);
  if (filters.category) params.append('category', filters.category);
  if (filters.minPrice) params.append('minPrice', filters.minPrice);
  if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
  if (filters.province) params.append('province', filters.province);
  if (filters.page) params.append('page', filters.page);
  if (filters.limit) params.append('limit', filters.limit);
  
  const res = await fetch(`${API_URL}/api/products?${params}`)
  return res.json();
}

export async function getProduct(id) {
  const res = await fetch(`${API_URL}/api/products/${id}`)
  return res.json();
}

export async function getMyProducts(token) {
  const res = await fetch(`${API_URL}/api/products/mine`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json()
}

export async function createProduct(product, token) {
  const res = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(product)
  })
  return res.json();
}

export async function updateProduct(id, product, token) {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(product)
  })
  return res.json();
}

export async function deleteProduct(id, token) {
  const res = await fetch(`${API_URL}/api/products/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json();
}

// Cart
export async function getCart(token) {
  const res = await fetch(`${API_URL}/api/cart`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json();
}

export async function addToCart(productId, quantity, token) {
  const res = await fetch(`${API_URL}/api/cart/add`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ productId, quantity })
  })
  return res.json();
}

export async function removeFromCart(productId, token) {
  const res = await fetch(`${API_URL}/api/cart/remove`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ productId })
  })
  return res.json();
}

export async function updateCartItem(productId, quantity, token) {
  const res = await fetch(`${API_URL}/api/cart/update`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ productId, quantity })
  })
  return res.json();
}

export async function clearCart(token) {
  const res = await fetch(`${API_URL}/api/cart/clear`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json();
}

// Orders
export async function checkout(items, deliveryMethod, deliveryAddress, token) {
  const res = await fetch(`${API_URL}/api/orders/checkout`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ items, deliveryMethod, deliveryAddress })
  })
  return res.json();
}

export async function createOrder(productId, quantity, deliveryMethod, deliveryAddress, token) {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ productId, quantity, deliveryMethod, deliveryAddress })
  })
  return res.json();
}

export async function getOrders(role, token) {
  const res = await fetch(`${API_URL}/api/orders?role=${role || 'buyer'}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json();
}

export async function getOrder(id, token) {
  const res = await fetch(`${API_URL}/api/orders/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  return res.json();
}

export async function updateOrderStatus(id, status, token) {
  const res = await fetch(`${API_URL}/api/orders/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ status })
  })
  return res.json();
}

export async function confirmPayment(orderId, paymentRef, token) {
  const res = await fetch(`${API_URL}/api/orders/payment/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ orderId, paymentRef })
  })
  return res.json();
}

// Reviews
export async function createReview(orderId, rating, comment, type, token) {
  const res = await fetch(`${API_URL}/api/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ orderId, rating, comment, type })
  })
  return res.json();
}

export async function getProductReviews(productId) {
  const res = await fetch(`${API_URL}/api/review/product/${productId}`)
  return res.json();
}

export async function getUserReviews(userId) {
  const res = await fetch(`${API_URL}/api/review/user/${userId}`)
  return res.json();
}
