import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  createProduct,
  deleteProduct,
  getMyProducts,
  getOrders,
  updateOrderStatus,
  updateProduct
} from '../api'

const CATEGORIES = ['Grains', 'Vegetables', 'Fruits', 'Tubers', 'Livestock', 'Poultry', 'Eggs', 'Dairy', 'Other']
const UNITS = ['kg', 'bag', 'crate', 'piece', 'bunch', 'litre', 'tonne']
const ORDER_STATUSES = ['pending', 'paid', 'processing', 'ready', 'shipped', 'delivered', 'cancelled']
const EMPTY_PRODUCT = {
  title: '', description: '', category: 'Vegetables', price: '', unit: 'kg', quantity: '', minQuantity: 1,
  images: [], location: { province: '', district: '', town: '' }
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('fm_user') || 'null')
  } catch {
    return null
  }
}

function formatMoney(value) {
  return `₦${Number(value || 0).toLocaleString('en-NG', { maximumFractionDigits: 2 })}`
}

async function compressImage(file) {
  if (!file.type.startsWith('image/')) throw new Error('Choose an image file.')
  const imageUrl = await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result)
    reader.onerror = () => reject(new Error('Could not read this image.'))
    reader.readAsDataURL(file)
  })
  const image = await new Promise((resolve, reject) => {
    const element = new Image()
    element.onload = () => resolve(element)
    element.onerror = () => reject(new Error('Could not open this image.'))
    element.src = imageUrl
  })
  const scale = Math.min(1, 1200 / Math.max(image.width, image.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(image.width * scale)
  canvas.height = Math.round(image.height * scale)
  canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height)
  return canvas.toDataURL('image/jpeg', 0.78)
}

export default function SellerDashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('fm_token')
  const user = useMemo(() => getStoredUser(), [])
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [notice, setNotice] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(EMPTY_PRODUCT)
  const [imageBusy, setImageBusy] = useState(false)
  const [query, setQuery] = useState('')

  const loadDashboard = useCallback(async () => {
    setLoading(true)
    setLoadError('')
    try {
      const [productData, orderData] = await Promise.all([getMyProducts(token), getOrders('seller', token)])
      if (productData.message && !Array.isArray(productData.products)) throw new Error(productData.message)
      if (orderData.message && !Array.isArray(orderData.orders)) throw new Error(orderData.message)
      setProducts(productData.products || [])
      setOrders(orderData.orders || [])
    } catch (error) {
      setLoadError(error.message || 'Could not load your seller dashboard.')
    } finally {
      setLoading(false)
    }
  }, [token])

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    if (!user || !['farmer', 'marketeer', 'admin'].includes(user.role)) {
      navigate('/')
      return
    }
    loadDashboard()
  }, [token, user, navigate, loadDashboard])

  const stats = useMemo(() => {
    const delivered = orders.filter(order => order.status === 'delivered')
    return {
      totalOrders: orders.length,
      pendingOrders: orders.filter(order => ['pending', 'paid', 'processing', 'ready'].includes(order.status)).length,
      revenue: delivered.reduce((sum, order) => sum + Number(order.subtotal || 0), 0),
      activeListings: products.filter(product => Number(product.quantity) > 0 && !product.isSoldOut).length
    }
  }, [orders, products])

  const filteredProducts = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return products
    return products.filter(product => `${product.title} ${product.category}`.toLowerCase().includes(search))
  }, [products, query])

  function openNewProduct() {
    setEditingId(null)
    setForm({
      ...EMPTY_PRODUCT,
      location: {
        province: user?.location?.province || '',
        district: user?.location?.district || '',
        town: user?.location?.town || ''
      }
    })
    setNotice('')
  }

  function openEditProduct(product) {
    setEditingId(product._id)
    setForm({ ...EMPTY_PRODUCT, ...product, price: String(product.price ?? ''), quantity: String(product.quantity ?? ''), images: product.images || [], location: { ...EMPTY_PRODUCT.location, ...(product.location || {}) } })
    setNotice('')
  }

  function closeEditor() {
    setEditingId(null)
    setForm(EMPTY_PRODUCT)
  }

  function updateField(event) {
    const { name, value } = event.target
    if (name.startsWith('location.')) {
      const key = name.split('.')[1]
      setForm(current => ({ ...current, location: { ...current.location, [key]: value } }))
    } else {
      setForm(current => ({ ...current, [name]: value }))
    }
  }

  async function selectImage(event) {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    setImageBusy(true)
    setNotice('')
    try {
      const image = await compressImage(file)
      setForm(current => ({ ...current, images: [image] }))
    } catch (error) {
      setNotice(error.message || 'Could not process the selected image.')
    } finally {
      setImageBusy(false)
    }
  }

  async function saveProduct(event) {
    event.preventDefault()
    setSaving(true)
    setNotice('')
    const payload = {
      title: form.title,
      description: form.description,
      category: form.category,
      price: Number(form.price),
      unit: form.unit,
      quantity: Number(form.quantity),
      minQuantity: Number(form.minQuantity) || 1,
      images: form.images || [],
      location: form.location,
      isSoldOut: Number(form.quantity) <= 0
    }
    try {
      const result = editingId
        ? await updateProduct(editingId, payload, token)
        : await createProduct(payload, token)
      if (!result.product) throw new Error(result.message || 'Could not save this product.')
      setNotice(editingId ? 'Product updated.' : 'Product added to your listings.')
      closeEditor()
      await loadDashboard()
    } catch (error) {
      setNotice(error.message || 'Could not save this product.')
    } finally {
      setSaving(false)
    }
  }

  async function removeProduct(product) {
    if (!window.confirm(`Delete “${product.title}”? This cannot be undone.`)) return
    setNotice('')
    try {
      const result = await deleteProduct(product._id, token)
      if (result.message === 'Product deleted') {
        setProducts(current => current.filter(item => item._id !== product._id))
        setNotice('Product deleted.')
      } else {
        setNotice(result.message || 'Could not delete this product.')
      }
    } catch (error) {
      setNotice(error.message || 'Could not delete this product.')
    }
  }

  async function changeOrderStatus(order, status) {
    setNotice('')
    try {
      const result = await updateOrderStatus(order._id, status, token)
      if (!result.order) throw new Error(result.message || 'Could not update order status.')
      setOrders(current => current.map(item => item._id === order._id ? { ...item, status } : item))
      setNotice(`Order ${order._id.slice(-6).toUpperCase()} marked ${status}.`)
    } catch (error) {
      setNotice(error.message || 'Could not update order status.')
    }
  }

  if (!token) return <p className="mx-auto max-w-6xl px-4 py-10 text-center">Please log in to manage your farm.</p>
  if (!user || !['farmer', 'marketeer', 'admin'].includes(user.role)) return null

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6">
      <header className="flex flex-col justify-between gap-5 rounded-3xl bg-gradient-to-br from-green-900 via-green-800 to-emerald-700 p-6 text-white shadow-lg sm:flex-row sm:items-center sm:p-9">
        <div>
          <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-green-200">Our Farm Market · Seller space</p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">Good day, {user.name?.split(' ')[0] || 'farmer'} 👋</h1>
          <p className="mt-2 max-w-xl text-green-100">Keep your harvest, orders, and sales moving from one simple place.</p>
        </div>
        <button type="button" onClick={openNewProduct} className="shrink-0 rounded-xl bg-lime-300 px-5 py-3 font-bold text-green-950 shadow transition hover:bg-lime-200">＋ Add a product</button>
      </header>

      {notice && <div role="status" className="flex items-start justify-between gap-4 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-900"><span>{notice}</span><button type="button" onClick={() => setNotice('')} aria-label="Dismiss message" className="!bg-transparent !p-0 text-green-900">×</button></div>}
      {loadError && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{loadError} <button type="button" onClick={loadDashboard} className="ml-2 !bg-transparent !p-0 font-bold text-red-800 underline">Try again</button></div>}

      <section aria-label="Sales overview" className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Orders received" value={stats.totalOrders} detail={`${stats.pendingOrders} need attention`} icon="📦" />
        <StatCard label="Active listings" value={stats.activeListings} detail={`${products.length} products total`} icon="🌱" />
        <StatCard label="Delivered sales" value={formatMoney(stats.revenue)} detail="Subtotal on delivered orders" icon="💰" />
        <StatCard label="Seller rating" value={Number(user.rating || 0).toFixed(1)} detail="Average buyer rating" icon="⭐" />
      </section>

      {editingId !== null || form !== EMPTY_PRODUCT ? (
        <section id="product-editor" className="rounded-2xl border border-green-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-5 flex items-start justify-between gap-3">
            <div><p className="text-xs font-bold uppercase tracking-widest text-green-700">Product listing</p><h2 className="mt-1 text-2xl font-bold text-gray-900">{editingId ? 'Edit product' : 'Add a farm product'}</h2></div>
            <button type="button" onClick={closeEditor} aria-label="Close product form" className="!bg-gray-100 !text-gray-700">✕</button>
          </div>
          <form onSubmit={saveProduct} className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold text-gray-700 sm:col-span-2">Product name<input name="title" value={form.title} onChange={updateField} required maxLength="100" placeholder="e.g. Fresh tomatoes" className="mt-1" /></label>
            <label className="text-sm font-semibold text-gray-700">Category<select name="category" value={form.category} onChange={updateField} className="mt-1">{CATEGORIES.map(category => <option key={category} value={category}>{category}</option>)}</select></label>
            <label className="text-sm font-semibold text-gray-700">Unit sold by<select name="unit" value={form.unit} onChange={updateField} className="mt-1">{UNITS.map(unit => <option key={unit} value={unit}>{unit}</option>)}</select></label>
            <label className="text-sm font-semibold text-gray-700">Price per {form.unit || 'unit'} (₦)<input name="price" type="number" min="0" step="0.01" value={form.price} onChange={updateField} required className="mt-1" /></label>
            <label className="text-sm font-semibold text-gray-700">Available quantity ({form.unit || 'unit'})<input name="quantity" type="number" min="0" step="0.01" value={form.quantity} onChange={updateField} required className="mt-1" /></label>
            <label className="text-sm font-semibold text-gray-700">Minimum order quantity<input name="minQuantity" type="number" min="1" step="1" value={form.minQuantity} onChange={updateField} className="mt-1" /></label>
            <label className="text-sm font-semibold text-gray-700">Province<input name="location.province" value={form.location?.province || ''} onChange={updateField} className="mt-1" placeholder="Province" /></label>
            <label className="text-sm font-semibold text-gray-700">District<input name="location.district" value={form.location?.district || ''} onChange={updateField} className="mt-1" placeholder="District" /></label>
            <label className="text-sm font-semibold text-gray-700">Town<input name="location.town" value={form.location?.town || ''} onChange={updateField} className="mt-1" placeholder="Town" /></label>
            <label className="text-sm font-semibold text-gray-700 sm:col-span-2">Description<textarea name="description" value={form.description || ''} onChange={updateField} rows="3" maxLength="1500" className="mt-1" placeholder="Tell buyers about freshness, variety, or harvest date" /></label>
            <div className="sm:col-span-2">
              <span className="text-sm font-semibold text-gray-700">Product photo</span>
              <div className="mt-2 flex flex-wrap items-center gap-4 rounded-xl border border-dashed border-gray-300 p-4">
                {form.images?.[0] ? <img src={form.images[0]} alt="Product preview" className="h-24 w-24 rounded-lg object-cover" /> : <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-green-50 text-3xl">🌾</div>}
                <div className="min-w-0 flex-1"><p className="text-sm text-gray-600">Choose a clear photo of your produce. Images are resized before saving.</p><label className="mt-2 inline-flex cursor-pointer rounded-lg border border-green-700 px-3 py-2 text-sm font-bold text-green-800 hover:bg-green-50">{imageBusy ? 'Preparing photo…' : 'Choose image'}<input type="file" accept="image/*" onChange={selectImage} disabled={imageBusy} className="sr-only" /></label>{form.images?.length > 0 && <button type="button" onClick={() => setForm(current => ({ ...current, images: [] }))} className="ml-3 !bg-transparent !p-0 text-sm text-red-700 underline">Remove photo</button>}</div>
              </div>
            </div>
            <div className="flex flex-wrap gap-3 pt-2 sm:col-span-2"><button type="submit" disabled={saving || imageBusy} className="rounded-lg !bg-green-700 px-5 py-3 font-bold text-white disabled:opacity-60">{saving ? 'Saving…' : editingId ? 'Save changes' : 'Publish product'}</button><button type="button" onClick={closeEditor} className="!bg-gray-100 px-5 py-3 font-bold !text-gray-700">Cancel</button></div>
          </form>
        </section>
      ) : null}

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-xs font-bold uppercase tracking-widest text-green-700">Your inventory</p><h2 className="mt-1 text-2xl font-bold text-gray-900">Farm products <span className="text-base font-medium text-gray-500">({products.length})</span></h2></div>
          <div className="flex gap-3"><input aria-label="Search products" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search listings" className="!mt-0 min-w-0 sm:w-56" /><button type="button" onClick={openNewProduct} className="shrink-0 rounded-lg !bg-green-700 px-4 font-bold">＋ Add</button></div>
        </div>
        {loading ? <p className="py-8 text-center text-gray-500">Loading your products…</p> : filteredProducts.length === 0 ? <div className="rounded-xl bg-green-50 px-5 py-10 text-center"><p className="text-lg font-bold text-gray-800">{products.length ? 'No products match your search.' : 'Your market stall is ready.'}</p><p className="mt-1 text-sm text-gray-600">{products.length ? 'Try another name or category.' : 'Add your first product to start receiving orders.'}</p>{!products.length && <button type="button" onClick={openNewProduct} className="mt-4 rounded-lg !bg-green-700 px-4 font-bold">Add your first product</button>}</div> : <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">{filteredProducts.map(product => <article key={product._id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <div className="relative h-40 bg-green-50">{product.images?.[0] ? <img src={product.images[0]} alt={product.title} className="h-full w-full object-cover" /> : <div className="flex h-full items-center justify-center text-5xl">🌿</div>}<span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold ${Number(product.quantity) > 0 ? 'bg-white text-green-800' : 'bg-red-100 text-red-800'}`}>{Number(product.quantity) > 0 ? 'In stock' : 'Sold out'}</span></div>
          <div className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="truncate text-lg font-bold text-gray-900">{product.title}</h3><p className="text-sm text-gray-500">{product.category || 'Other'} · {product.location?.district || product.location?.province || 'Location not set'}</p></div><p className="shrink-0 font-extrabold text-green-800">{formatMoney(product.price)}<span className="text-xs font-medium text-gray-500">/{product.unit || 'unit'}</span></p></div><p className="mt-3 text-sm text-gray-600">Available: <strong>{product.quantity} {product.unit || 'units'}</strong></p><div className="mt-4 flex gap-2 border-t pt-3"><button type="button" onClick={() => openEditProduct(product)} className="flex-1 !bg-green-50 font-bold !text-green-800 hover:!bg-green-100">Edit listing</button><Link to={`/product/${product._id}`} className="rounded px-3 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-100">View</Link><button type="button" onClick={() => removeProduct(product)} className="!bg-transparent !px-2 text-sm font-semibold !text-red-700 hover:!bg-red-50">Delete</button></div></div>
        </article>)}</div>}
      </section>

      <section className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
        <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-widest text-green-700">Keep business moving</p><h2 className="mt-1 text-2xl font-bold text-gray-900">Recent orders</h2></div><Link to="/orders?role=seller" className="font-semibold text-green-800 hover:underline">All sales →</Link></div>
        {loading ? <p className="py-8 text-center text-gray-500">Loading your orders…</p> : orders.length === 0 ? <div className="rounded-xl bg-gray-50 px-5 py-10 text-center"><p className="font-bold text-gray-800">No orders just yet</p><p className="mt-1 text-sm text-gray-600">Orders from buyers will appear here.</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[700px] text-left text-sm"><thead><tr className="border-b text-xs uppercase tracking-wide text-gray-500"><th className="px-3 py-3">Order</th><th className="px-3 py-3">Product</th><th className="px-3 py-3">Buyer</th><th className="px-3 py-3">Sale</th><th className="px-3 py-3">Date</th><th className="px-3 py-3">Status</th></tr></thead><tbody>{orders.slice(0, 8).map(order => <tr key={order._id} className="border-b last:border-0 hover:bg-gray-50"><td className="px-3 py-4 font-mono font-bold">#{order._id.slice(-6).toUpperCase()}</td><td className="px-3 py-4 font-semibold">{order.product?.title || 'Farm product'}<div className="font-normal text-gray-500">{order.quantity} {order.product?.unit || 'units'}</div></td><td className="px-3 py-4">{order.buyer?.name || 'Buyer'}</td><td className="px-3 py-4 font-bold">{formatMoney(order.subtotal || order.totalAmount)}</td><td className="px-3 py-4 text-gray-600">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</td><td className="px-3 py-4"><select aria-label={`Update status for order ${order._id.slice(-6)}`} value={order.status} onChange={event => changeOrderStatus(order, event.target.value)} className="!mt-0 !w-auto min-w-32 rounded-full border-green-200 bg-green-50 py-1 text-xs font-bold capitalize text-green-900">{ORDER_STATUSES.map(status => <option key={status} value={status}>{status}</option>)}</select></td></tr>)}</tbody></table></div>}
      </section>
      <footer className="flex flex-col items-start justify-between gap-3 rounded-2xl bg-amber-50 p-5 text-sm text-amber-950 sm:flex-row sm:items-center"><p><strong>Growing tip:</strong> Clear photos and up-to-date stock help buyers order with confidence.</p><span className="font-semibold">Account: {user.role}</span></footer>
    </div>
  )
}

function StatCard({ label, value, detail, icon }) {
  return <article className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm sm:p-5"><div className="flex items-center justify-between"><p className="text-sm font-semibold text-gray-600">{label}</p><span className="text-xl" aria-hidden="true">{icon}</span></div><p className="mt-3 break-words text-2xl font-extrabold text-gray-900 sm:text-3xl">{value}</p><p className="mt-1 text-xs text-gray-500">{detail}</p></article>
}
