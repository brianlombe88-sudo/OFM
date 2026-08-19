const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

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

export async function getProducts() {
  const res = await fetch(`${API_URL}/api/products`)
  return res.json();
}

export async function getProduct(id) {
  const res = await fetch(`${API_URL}/api/products/${id}`)
  return res.json();
}

export async function createProduct(product, token) {
  const res = await fetch(`${API_URL}/api/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(product)
  })
  return res.json();
}

export async function createOrder(order, token) {
  const res = await fetch(`${API_URL}/api/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(order)
  })
  return res.json();
}
