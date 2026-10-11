import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const marketPulse = [
  { label: 'Active sellers', value: '438', delta: '+12%' },
  { label: 'Buyers this week', value: '2,104', delta: '+8%' },
  { label: 'Deliveries in motion', value: '76', delta: '+19%' },
  { label: 'Platform volume', value: '₦45.2M', delta: '+21%' }
]

const alerts = [
  { title: 'Tomato demand up 27%', detail: 'North region is trending above forecast for 3 days.', tone: 'amber' },
  { title: 'Two transport routes overloaded', detail: 'Consider redistributing loads near Kafanchan.', tone: 'red' },
  { title: '3 sellers need verification', detail: 'Farm records and identity checks pending approval.', tone: 'green' }
]

const moderationQueue = [
  { type: 'Seller', name: 'Green Valley Farms', status: 'Awaiting verification' },
  { type: 'Transporter', name: 'Musa Logistics', status: 'Route review' },
  { type: 'Product', name: 'Fresh cabbage bundle', status: 'Price flagged' }
]

const transactionRows = [
  { id: 'OFM-2041', buyer: 'Grace K.', seller: 'Adu Farms', amount: '₦78,500', status: 'Settled' },
  { id: 'OFM-2048', buyer: 'Samuel T.', seller: 'Ndoma Produce', amount: '₦31,200', status: 'In transit' },
  { id: 'OFM-2051', buyer: 'Mariam A.', seller: 'Bilkisu Harvest', amount: '₦61,900', status: 'Pending' }
]

export default function AdminDashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('fm_token')
  const user = token ? JSON.parse(localStorage.getItem('fm_user') || '{}') : null
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    if (!user || user.role !== 'admin') {
      navigate('/')
      return
    }
    setLoading(false)
  }, [token, user, navigate])

  const summary = useMemo(() => ({
    pendingApprovals: 18,
    openDisputes: 6,
    completedReturns: 14,
    commissionPool: '₦6.8M'
  }), [])

  if (loading) return <p className="py-8 text-center text-gray-500">Loading OFM control room…</p>

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <header className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 text-white shadow-lg">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-300">OFM Control Room</p>
        <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">Admin Market Pulse</h1>
            <p className="mt-2 max-w-2xl text-slate-200">Watch supply, demand, trust, logistics, and transactions across the live agricultural network.</p>
          </div>
          <button className="rounded-xl bg-indigo-400 px-5 py-3 font-bold text-slate-950 shadow hover:bg-indigo-300">Launch market briefing</button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {marketPulse.map((item) => (
          <div key={item.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>{item.label}</span>
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-700">{item.delta}</span>
            </div>
            <div className="mt-4 text-3xl font-extrabold text-slate-900">{item.value}</div>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-indigo-700">Live network</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">OFM Intelligence</h2>
            </div>
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Healthy</span>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm font-semibold text-slate-600">High-demand products</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>Tomatoes · +27% vs. last week</li>
                <li>Maize · +18% across two regions</li>
                <li>Onions · strong urban demand</li>
              </ul>
            </div>
            <div className="rounded-xl bg-slate-100 p-4">
              <p className="text-sm font-semibold text-slate-600">Risk signals</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                <li>3 delivery routes delayed</li>
                <li>4 inactive sellers flagged</li>
                <li>1 unusual transaction pattern</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-700">Market alerts</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Alert Board</h2>
          </div>
          {alerts.map((alert) => (
            <div key={alert.title} className={`rounded-xl border p-4 ${alert.tone === 'amber' ? 'border-amber-200 bg-amber-50' : alert.tone === 'red' ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
              <div className="font-bold text-slate-900">{alert.title}</div>
              <div className="mt-1 text-sm text-slate-700">{alert.detail}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-700">Verification queue</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Seller & transporter review</h2>
          <div className="mt-5 space-y-3">
            {moderationQueue.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-xl border border-slate-200 p-3">
                <div>
                  <div className="text-sm font-semibold text-slate-800">{item.type}</div>
                  <div className="text-slate-600">{item.name}</div>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{item.status}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-indigo-700">Financial overview</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Platform settlements</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <SummaryTile label="Pending approvals" value={summary.pendingApprovals} />
            <SummaryTile label="Open disputes" value={summary.openDisputes} />
            <SummaryTile label="Completed returns" value={summary.completedReturns} />
            <SummaryTile label="Commission pool" value={summary.commissionPool} />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-indigo-700">Transaction audit</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Recent settlements</h2>
          </div>
          <button className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700">Export CSV</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="px-3 py-3">Order</th>
                <th className="px-3 py-3">Buyer</th>
                <th className="px-3 py-3">Seller</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {transactionRows.map((row) => (
                <tr key={row.id} className="border-b last:border-0">
                  <td className="px-3 py-3 font-mono font-semibold">{row.id}</td>
                  <td className="px-3 py-3">{row.buyer}</td>
                  <td className="px-3 py-3">{row.seller}</td>
                  <td className="px-3 py-3 font-bold text-slate-800">{row.amount}</td>
                  <td className="px-3 py-3"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-800">{row.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

function SummaryTile({ label, value }) {
  return (
    <div className="rounded-xl bg-slate-100 p-4">
      <div className="text-sm text-slate-500">{label}</div>
      <div className="mt-2 text-2xl font-extrabold text-slate-900">{value}</div>
    </div>
  )
}
