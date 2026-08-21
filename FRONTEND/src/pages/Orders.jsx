import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getOrders } from '../api'

export default function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterRole, setFilterRole] = useState('buyer')

  const token = localStorage.getItem('fm_token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
    } else {
      loadOrders()
    }
  }, [token, navigate, filterRole])

  const loadOrders = async () => {
    setLoading(true)
    try {
      const data = await getOrders(filterRole, token)
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Failed to load orders:', error)
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
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusEmoji = (status) => {
    switch (status) {
      case 'pending':
        return '⏳'
      case 'paid':
        return '💳'
      case 'processing':
        return '⚙️'
      case 'ready':
        return '📦'
      case 'shipped':
        return '🚚'
      case 'delivered':
        return '✅'
      case 'cancelled':
        return '❌'
      default:
        return '📋'
    }
  }

  if (!token) return <p className="text-center py-8">Please log in to view orders</p>

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">📋 My Orders</h1>

      {/* Filter Tabs */}
      <div className="flex gap-4 mb-8 border-b">
        <button
          onClick={() => setFilterRole('buyer')}
          className={`px-6 py-3 font-semibold ${
            filterRole === 'buyer'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Purchases
        </button>
        <button
          onClick={() => setFilterRole('seller')}
          className={`px-6 py-3 font-semibold ${
            filterRole === 'seller'
              ? 'border-b-2 border-green-600 text-green-600'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          My Sales
        </button>
      </div>

      {/* Orders List */}
      {loading ? (
        <p className="text-center text-gray-500">Loading orders...</p>
      ) : orders.length === 0 ? (
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-gray-600 mb-4">
            {filterRole === 'buyer' ? 'You haven\'t made any purchases yet.' : 'You haven\'t received any orders yet.'}
          </p>
          <Link
            to="/market"
            className="inline-block text-green-600 font-semibold hover:underline"
          >
            {filterRole === 'buyer' ? 'Start Shopping →' : 'Go to Marketplace →'}
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order._id} className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Order ID</p>
                  <p className="font-mono font-bold">{order._id.slice(-8).toUpperCase()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Date</p>
                  <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                </div>
                <div className={`px-4 py-2 rounded-full font-semibold text-center ${getStatusColor(order.status)}`}>
                  {getStatusEmoji(order.status)} {order.status.toUpperCase()}
                </div>
              </div>

              {/* Product Details */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4 flex gap-4">
                <div className="bg-white w-16 h-16 rounded flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">
                    {order.product?.category === 'Vegetables' && '🥬'}
                    {order.product?.category === 'Fruits' && '🍎'}
                    {order.product?.category === 'Grains' && '🌾'}
                    {order.product?.category === 'Dairy' && '🥛'}
                    {order.product?.category === 'Meat' && '🍖'}
                    {order.product?.category === 'Spices' && '🌶️'}
                    {!order.product?.category && '📦'}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{order.product?.title}</h3>
                  <p className="text-gray-600 text-sm">
                    Quantity: {order.quantity} × ₦{order.productPrice} = ₦{order.quantity * order.productPrice}
                  </p>
                  {filterRole === 'buyer' && order.seller && (
                    <p className="text-gray-600 text-sm mt-1">Seller: {order.seller.name}</p>
                  )}
                  {filterRole === 'seller' && order.buyer && (
                    <p className="text-gray-600 text-sm mt-1">Buyer: {order.buyer.name}</p>
                  )}
                </div>
              </div>

              {/* Pricing Breakdown */}
              <div className="bg-gray-50 p-4 rounded-lg mb-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Subtotal</p>
                  <p className="font-bold">₦{order.subtotal}</p>
                </div>
                <div>
                  <p className="text-gray-600">Platform Fee</p>
                  <p className="font-bold">₦{order.platformFee}</p>
                </div>
                <div>
                  <p className="text-gray-600">Delivery</p>
                  <p className="font-bold">₦{order.deliveryFee || 0}</p>
                </div>
                <div>
                  <p className="text-gray-600">Total</p>
                  <p className="font-bold text-lg text-green-600">₦{order.totalAmount}</p>
                </div>
              </div>

              {/* Delivery Info */}
              {order.deliveryMethod && (
                <div className="mb-4 text-sm">
                  <p className="text-gray-600">
                    Delivery: {order.deliveryMethod === 'pickup' ? '🏪 Pickup at Market' : '🚚 Delivery'}
                  </p>
                  {order.deliveryAddress && (
                    <p className="text-gray-600">Address: {order.deliveryAddress}</p>
                  )}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t">
                <Link
                  to={`/order/${order._id}`}
                  className="flex-1 text-center bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition"
                >
                  View Details
                </Link>
                {filterRole === 'buyer' && order.status === 'delivered' && (
                  <button className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white py-2 rounded-lg font-semibold transition">
                    Leave Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
