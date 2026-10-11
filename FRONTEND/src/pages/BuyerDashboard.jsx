import React, { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getOrders, getProducts } from '../api'

const watchList = [
  { product: 'Tomatoes', trend: '+27%', detail: 'Demand is rising in 3 nearby markets.' },
  { product: 'Maize', trend: '+18%', detail: 'Strong supply from local farms.' },
  { product: 'Onions', trend: '-6%', detail: 'Good value if you buy in bulk.' }
]

const demandRequests = [
  { title: 'Need 200kg of sweet potatoes', budget: '₦120,000', distance: '18km', deadline: 'Tomorrow' },
  { title: 'Looking for 50 crates of eggs', budget: '₦70,000', distance: '9km', deadline: 'This week' },
  { title: 'Fresh spinach for restaurant order', budget: '₦45,000', distance: '12km', deadline: 'Friday' }
]

const recommendationSeed = [
  { title: 'Fresh red tomatoes', seller: 'Green Valley Farms', price: '₦2,800', unit: 'kg', match: '96%' },
  { title: 'Yellow maize', seller: 'Adu Harvest', price: '₦1,900', unit: 'kg', match: '92%' },
  { title: 'Cabbage bundle', seller: 'FarmLink Co-op', price: '₦3,600', unit: 'crate', match: '89%' }
]

export default function BuyerDashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('fm_token')
  const user = token ? JSON.parse(localStorage.getItem('fm_user') || '{}') : null
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    if (!user || user.role !== 'buyer') {
      navigate('/')
      return
    }

    const loadDashboard = async () => {
      try {
        const [ordersData, productsData] = await Promise.all([
          getOrders('buyer', token),
          getProducts({ limit: 4 })
        ])
        setOrders(ordersData.orders || [])
        setProducts(productsData.products || recommendationSeed)
      } catch (error) {
        setOrders([])
        setProducts(recommendationSeed)
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [navigate, token, user])

  const summary = useMemo(() => ({
    activeOrders: orders.filter((order) => ['pending', 'paid', 'processing', 'ready', 'shipped'].includes(order.status)).length,
    savedSpend: '₦195,000',
    favouriteCategory: 'Vegetables',
    bestValue: 'Tomatoes' 
  }), [orders])

  if (loading) return <p className="py-8 text-center text-gray-500">Loading buyer dashboard…</p>

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <header className="rounded-3xl bg-gradient-to-br from-emerald-800 via-green-700 to-lime-600 p-6 text-white shadow-lg">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-100">OFM Buyer Workspace</p>
        <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">What are you looking for today?</h1>
            <p className="mt-2 max-w-2xl text-emerald-50">Smart recommendations, local demand, and buyer requests tailored to your buying patterns.</p>
          </div>
          <button className="rounded-xl bg-yellow-400 px-5 py-3 font-bold text-green-950 shadow hover:bg-yellow-300">Post a buying request</button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open orders" value={summary.activeOrders} detail="Products currently moving" icon="📦" />
        <StatCard label="Saved spend" value={summary.savedSpend} detail="This month" icon="💰" />
        <StatCard label="Favourite category" value={summary.favouriteCategory} detail="Your regular buys" icon="🌿" />
        <StatCard label="Best value" value={summary.bestValue} detail="Lowest total cost" icon="⭐" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Recommended for you</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Smart match</h2>
            </div>
            <Link to="/market" className="font-semibold text-emerald-700 hover:underline">Browse marketplace →</Link>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {products.map((product) => (
              <div key={product.title} className="rounded-xl border border-emerald-100 bg-emerald-50 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-emerald-800">{product.match || '94%'}</span>
                  <span className="text-xs text-slate-500">{product.unit || 'kg'}</span>
                </div>
                <h3 className="font-bold text-lg text-slate-900">{product.title}</h3>
                <p className="text-sm text-slate-600">{product.seller || 'Local farm seller'}</p>
                <div className="mt-4 flex items-end justify-between">
                  <div>
                    <div className="text-2xl font-extrabold text-emerald-800">{product.price || '₦2,200'}</div>
                    <div className="text-xs text-slate-500">per unit</div>
                  </div>
                  <Link to="/market" className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white">View</Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Market watch</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Price shifts</h2>
          <div className="mt-5 space-y-4">
            {watchList.map((item) => (
              <div key={item.product} className="flex items-start justify-between rounded-xl bg-emerald-50 p-3">
                <div>
                  <div className="font-bold text-slate-900">{item.product}</div>
                  <div className="text-sm text-slate-600">{item.detail}</div>
                </div>
                <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-emerald-800">{item.trend}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Live opportunity board</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">I Need This</h2>
            </div>
            <button className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white">Create request</button>
          </div>
          <div className="space-y-3">
            {demandRequests.map((request) => (
              <div key={request.title} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-bold text-slate-900">{request.title}</div>
                    <div className="mt-1 text-sm text-slate-600">Deadline: {request.deadline}</div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">{request.distance}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-sm text-slate-700">
                  <span>Budget: {request.budget}</span>
                  <button className="rounded-lg border border-emerald-200 px-3 py-1.5 font-semibold text-emerald-800">Bid now</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">Order timeline</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Recent purchases</h2>
          <div className="mt-5 space-y-4">
            {orders.length ? orders.slice(0, 3).map((order) => (
              <div key={order._id} className="rounded-xl bg-slate-50 p-4">
                <div className="flex items-center justify-between">
                  <div className="font-bold text-slate-900">{order.product?.title || 'Farm order'}</div>
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-slate-700">{order.status}</span>
                </div>
                <div className="mt-2 text-sm text-slate-600">Qty: {order.quantity || 1} · Total: ₦{order.totalAmount || order.subtotal || 0}</div>
              </div>
            )) : (
              <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">No recent purchases yet. Start shopping from the marketplace.</div>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

function StatCard({ label, value, detail, icon }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-600">{label}</p>
        <span className="text-xl" aria-hidden="true">{icon}</span>
      </div>
      <div className="mt-4 text-3xl font-extrabold text-slate-900">{value}</div>
      <p className="mt-1 text-xs text-slate-500">{detail}</p>
    </article>
  )
}
