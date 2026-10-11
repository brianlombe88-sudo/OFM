import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

const loadBoard = [
  { route: 'Kano → Kaduna', cargo: '500kg maize', earnings: '₦82,000', deadline: 'Today', loadFactor: '74%' },
  { route: 'Jos → Abuja', cargo: '300 crates eggs', earnings: '₦56,000', deadline: 'Tomorrow', loadFactor: '61%' },
  { route: 'Ilorin → Lagos', cargo: '20 bags cassava', earnings: '₦68,000', deadline: 'Fri', loadFactor: '68%' }
]

const routeOpportunities = [
  { title: 'Return load westbound', detail: 'Pickup near Ibadan after 3pm, 2 loads available', margin: '+₦24k' },
  { title: 'Pickup consolidation', detail: 'Combine 3 farm deliveries with same route', margin: '+₦18k' },
  { title: 'Route optimization', detail: 'Avoid empty leg by taking a 35km detour', margin: '+₦12k' }
]

const vehicleHealth = [
  { name: 'Vehicle status', value: 'Operational' },
  { name: 'Next service', value: '12 days' },
  { name: 'Fuel efficiency', value: '11.8 km/l' }
]

export default function TransporterDashboard() {
  const navigate = useNavigate()
  const token = localStorage.getItem('fm_token')
  const user = token ? JSON.parse(localStorage.getItem('fm_user') || '{}') : null
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      navigate('/login')
      return
    }
    if (!user || user.role !== 'transporter') {
      navigate('/')
      return
    }
    setLoading(false)
  }, [navigate, token, user])

  const summary = useMemo(() => ({
    activeLoads: 9,
    routeEarnings: '₦481,000',
    completedJobs: 36,
    avgMargin: '28%'
  }), [])

  if (loading) return <p className="py-8 text-center text-gray-500">Loading transport dashboard…</p>

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <header className="rounded-3xl bg-gradient-to-br from-sky-900 via-blue-800 to-cyan-700 p-6 text-white shadow-lg">
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-sky-200">OFM Logistics Command</p>
        <div className="mt-3 flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
          <div>
            <h1 className="text-3xl font-extrabold sm:text-4xl">Load Board</h1>
            <p className="mt-2 max-w-2xl text-sky-100">Find profitable loads, reduce empty trips, and keep every delivery on schedule.</p>
          </div>
          <button className="rounded-xl bg-cyan-300 px-5 py-3 font-bold text-sky-950 shadow hover:bg-cyan-200">Set availability</button>
        </div>
      </header>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Active loads" value={summary.activeLoads} detail="Matching your route" icon="🚚" />
        <StatCard label="Route earnings" value={summary.routeEarnings} detail="This week" icon="💹" />
        <StatCard label="Completed jobs" value={summary.completedJobs} detail="Successful deliveries" icon="✅" />
        <StatCard label="Avg. margin" value={summary.avgMargin} detail="Net route profit" icon="📈" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-sky-700">Live matching</p>
              <h2 className="mt-1 text-2xl font-bold text-slate-900">Available loads</h2>
            </div>
            <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">9 loads</span>
          </div>
          <div className="space-y-4">
            {loadBoard.map((load) => (
              <div key={load.route} className="rounded-xl border border-sky-100 bg-sky-50 p-4">
                <div className="flex flex-col justify-between gap-3 sm:flex-row">
                  <div>
                    <div className="text-xl font-bold text-slate-900">{load.route}</div>
                    <div className="text-sm text-slate-600">{load.cargo}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-sky-800">{load.earnings}</div>
                    <div className="text-xs text-slate-500">Deadline: {load.deadline}</div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="rounded-full bg-white px-2 py-1 text-xs font-bold text-sky-800">Load match {load.loadFactor}</span>
                  <button className="rounded-lg bg-sky-700 px-3 py-2 text-sm font-semibold text-white">Accept load</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-sky-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-sky-700">Route strategy</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Opportunity radar</h2>
          <div className="mt-5 space-y-3">
            {routeOpportunities.map((item) => (
              <div key={item.title} className="rounded-xl border border-slate-200 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-bold text-slate-900">{item.title}</div>
                    <div className="mt-1 text-sm text-slate-600">{item.detail}</div>
                  </div>
                  <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-bold text-emerald-800">{item.margin}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-sky-700">Wallet</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Earnings centre</h2>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <WalletCard title="Pending" value="₦116,000" />
            <WalletCard title="Completed" value="₦432,500" />
            <WalletCard title="Fuel estimate" value="₦58,400" />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs font-bold uppercase tracking-widest text-sky-700">Fleet health</p>
          <h2 className="mt-1 text-2xl font-bold text-slate-900">Vehicle status</h2>
          <div className="mt-5 space-y-3">
            {vehicleHealth.map((item) => (
              <div key={item.name} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                <span className="text-sm text-slate-600">{item.name}</span>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
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

function WalletCard({ title, value }) {
  return (
    <div className="rounded-xl bg-sky-50 p-4">
      <div className="text-sm text-sky-700">{title}</div>
      <div className="mt-3 text-2xl font-extrabold text-slate-900">{value}</div>
    </div>
  )
}
