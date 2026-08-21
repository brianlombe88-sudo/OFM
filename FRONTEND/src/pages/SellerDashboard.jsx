import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getOrders, getProducts } from '../api'

export default function SellerDashboard() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalProducts: 0,
    totalRevenue: 0,
    pendingOrders: 0
  })

  const token = localStorage.getItem('fm_token')
  const user = localStorage.getItem('fm_user') ? JSON.parse(localStorage.getItem('fm_user')) : null

  useEffect(() => {
    if (!token) {
      navigate('/login')
    } else if (!user || !['farmer', 'marketeer', 'admin'].includes(user.role)) {
      navigate('/')
    } else {
      loadDashboard()
    }
  }, [token, user, navigate])

  const loadDashboard = async () => {
    setLoading(true)
    try {
      // Load seller's orders
      const ordersData = await getOrders('seller', token)
      setOrders(ordersData.orders || [])

      // Calculate stats
      const sellerOrders = ordersData.orders || []
      const totalRevenue = sellerOrders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + (o.subtotal || 0), 0)

      const pendingOrders = sellerOrders.filter(o => o.status === 'pending' || o.status === 'paid').length

      setStats({
        totalOrders: sellerOrders.length,
        totalProducts: products.length,
        totalRevenue,
        pendingOrders
      })
    } catch (error) {
      console.error('Failed to load dashboard:', error)
    }
    setLoading(false)
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'paid':
        return 'bg-blue-100 text-blue-800'
      case 'processing':
        return 'bg-purple-100 text-purple-800'
      case 'ready':
        return 'bg-green-100 text-green-800'
      case 'shipped':
        return 'bg-blue-100 text-blue-800'
      case 'delivered':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (!token) return <p className="text-center py-8">Please log in</p>
  if (loading) return <p className="text-center py-8">Loading dashboard...</p>

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">📊 Seller Dashboard</h1>
        <Link
          to="/add-product"
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          + Add Product
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600 mb-2">Total Orders</div>
          <div className="text-3xl font-bold text-green-600">{stats.totalOrders}</div>
          <div className="text-xs text-gray-500 mt-2">{stats.pendingOrders} pending</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600 mb-2">Total Products</div>
          <div className="text-3xl font-bold text-blue-600">{stats.totalProducts}</div>
          <Link to="/add-product" className="text-xs text-blue-600 hover:underline mt-2">
            Manage Products →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600 mb-2">Total Revenue</div>
          <div className="text-3xl font-bold text-yellow-600">₦{stats.totalRevenue.toFixed(0)}</div>
          <div className="text-xs text-gray-500 mt-2">Delivered orders only</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="text-sm text-gray-600 mb-2">Account Status</div>
          <div className="text-2xl font-bold text-green-600">✓ Active</div>
          <div className="text-xs text-gray-500 mt-2">{user?.role}</div>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Recent Orders</h2>
          <Link to="/orders" className="text-green-600 hover:underline font-semibold">
            View All Orders →
          </Link>
        </div>

        {orders.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No orders yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold">Order ID</th>
                  <th className="text-left px-4 py-3 font-semibold">Product</th>
                  <th className="text-left px-4 py-3 font-semibold">Buyer</th>
                  <th className="text-left px-4 py-3 font-semibold">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 10).map((order) => (
                  <tr key={order._id} className="border-t hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{order._id.slice(-6).toUpperCase()}</td>
                    <td className="px-4 py-3">{order.product?.title}</td>
                    <td className="px-4 py-3">{order.buyer?.name}</td>
                    <td className="px-4 py-3 font-semibold">₦{order.totalAmount}</td>
                    <td className="px-4 py-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          to="/add-product"
          className="bg-green-50 border-2 border-green-300 p-6 rounded-lg hover:shadow-md transition text-center"
        >
          <div className="text-4xl mb-2">➕</div>
          <h3 className="font-bold text-lg">Add New Product</h3>
          <p className="text-sm text-gray-600">List items for sale</p>
        </Link>

        <Link
          to="/orders?role=seller"
          className="bg-blue-50 border-2 border-blue-300 p-6 rounded-lg hover:shadow-md transition text-center"
        >
          <div className="text-4xl mb-2">📦</div>
          <h3 className="font-bold text-lg">Manage Orders</h3>
          <p className="text-sm text-gray-600">Update order status</p>
        </Link>

        <div className="bg-yellow-50 border-2 border-yellow-300 p-6 rounded-lg text-center">
          <div className="text-4xl mb-2">⭐</div>
          <h3 className="font-bold text-lg">Your Rating</h3>
          <p className="text-sm text-gray-600">{user?.rating || 'No ratings yet'}</p>
        </div>
      </div>
    </div>
  )
}
