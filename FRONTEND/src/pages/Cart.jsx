import React, { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getCart, removeFromCart, updateCartItem, clearCart, checkout as apiCheckout, addToCart } from '../api'

export default function Cart() {
  const navigate = useNavigate()
  const [cart, setCart] = useState([])
  const [loading, setLoading] = useState(true)
  const [checking, setChecking] = useState(false)
  const [deliveryMethod, setDeliveryMethod] = useState('pickup')
  const [deliveryAddress, setDeliveryAddress] = useState('')

  const token = localStorage.getItem('fm_token')

  useEffect(() => {
    if (!token) {
      navigate('/login')
    } else {
      loadCart()
    }
  }, [token, navigate])

  const loadCart = async () => {
    try {
      const data = await getCart(token)
      setCart(data.cart?.items || [])
    } catch (error) {
      console.error('Failed to load cart:', error)
    }
    setLoading(false)
  }

  const handleRemoveFromCart = async (productId) => {
    try {
      const res = await removeFromCart(productId, token)
      if (res.cart) {
        setCart(res.cart.items)
      }
    } catch (error) {
      alert('Failed to remove from cart')
    }
  }

  const handleUpdateQuantity = async (productId, newQty) => {
    if (newQty < 1) return
    try {
      const res = await updateCartItem(productId, newQty, token)
      if (res.cart) {
        setCart(res.cart.items)
      }
    } catch (error) {
      alert('Failed to update quantity')
    }
  }

  const handleCheckout = async () => {
    if (cart.length === 0) {
      alert('Your cart is empty')
      return
    }

    if (deliveryMethod === 'delivery' && !deliveryAddress.trim()) {
      alert('Please enter a delivery address')
      return
    }

    setChecking(true)
    try {
      const items = cart.map(item => ({
        productId: item.product._id,
        quantity: item.quantity
      }))

      const res = await apiCheckout(items, deliveryMethod, deliveryAddress, token)
      if (res.orders) {
        alert('Orders created successfully!')
        await clearCart(token)
        navigate('/orders')
      } else {
        alert(res.message || 'Checkout failed')
      }
    } catch (error) {
      alert('Checkout failed: ' + error.message)
    }
    setChecking(false)
  }

  if (loading) return <p className="text-center py-8">Loading cart...</p>
  if (!token) return <p className="text-center py-8">Please log in to view your cart</p>

  const subtotal = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  const platformFee = Math.round(subtotal * 0.01)
  const deliveryFee = deliveryMethod === 'delivery' ? 50 : 0
  const total = subtotal + platformFee + deliveryFee

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">🛒 Shopping Cart</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2">
          {cart.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow-md text-center">
              <p className="text-gray-600 mb-4">Your cart is empty</p>
              <Link to="/market" className="text-green-600 font-semibold hover:underline">
                Continue Shopping →
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.product._id} className="bg-white p-6 rounded-lg shadow-md">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <div className="bg-gray-200 w-20 h-20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-3xl">
                        {item.product.category === 'Vegetables' && '🥬'}
                        {item.product.category === 'Fruits' && '🍎'}
                        {item.product.category === 'Grains' && '🌾'}
                        {item.product.category === 'Dairy' && '🥛'}
                        {item.product.category === 'Meat' && '🍖'}
                        {item.product.category === 'Spices' && '🌶️'}
                        {!item.product.category && '📦'}
                      </span>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{item.product.title}</h3>
                      <p className="text-gray-600 text-sm mb-2">{item.product.category}</p>
                      <p className="text-gray-600 text-sm">
                        ₦{item.product.price} × {item.quantity} = <span className="font-bold">₦{item.product.price * item.quantity}</span>
                      </p>
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end justify-between">
                      <button
                        onClick={() => handleRemoveFromCart(item.product._id)}
                        className="text-red-600 hover:text-red-800 font-semibold text-sm"
                      >
                        ✕ Remove
                      </button>
                      <div className="flex items-center gap-2 mt-2">
                        <button
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity - 1)}
                          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                        >
                          −
                        </button>
                        <span className="px-3 py-1 bg-gray-100 rounded min-w-10 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => handleUpdateQuantity(item.product._id, item.quantity + 1)}
                          className="px-2 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Checkout Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-lg shadow-md sticky top-4">
            <h3 className="text-2xl font-bold mb-6">Order Summary</h3>

            {/* Delivery Method */}
            <div className="mb-6 pb-6 border-b">
              <label className="block font-semibold mb-3">Delivery Method</label>
              <div className="space-y-3">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="pickup"
                    checked={deliveryMethod === 'pickup'}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>Pickup at Market</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="radio"
                    value="delivery"
                    checked={deliveryMethod === 'delivery'}
                    onChange={(e) => setDeliveryMethod(e.target.value)}
                    className="w-4 h-4"
                  />
                  <span>Delivery to Address</span>
                </label>
              </div>
            </div>

            {/* Delivery Address */}
            {deliveryMethod === 'delivery' && (
              <div className="mb-6 pb-6 border-b">
                <label className="block font-semibold mb-2">Delivery Address</label>
                <textarea
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Enter full delivery address"
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                />
              </div>
            )}

            {/* Pricing */}
            <div className="space-y-2 mb-6 pb-6 border-b text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Subtotal</span>
                <span>₦{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee (1%)</span>
                <span>₦{platformFee.toFixed(2)}</span>
              </div>
              {deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery Fee</span>
                  <span>₦{deliveryFee.toFixed(2)}</span>
                </div>
              )}
            </div>

            {/* Total */}
            <div className="mb-6">
              <div className="flex justify-between mb-6">
                <span className="text-xl font-bold">Total</span>
                <span className="text-2xl font-bold text-green-600">₦{total.toFixed(2)}</span>
              </div>

              <button
                onClick={handleCheckout}
                disabled={cart.length === 0 || checking}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-bold py-3 rounded-lg transition"
              >
                {checking ? 'Processing...' : 'Proceed to Checkout'}
              </button>
            </div>

            <Link
              to="/market"
              className="block text-center text-green-600 hover:text-green-800 font-semibold"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
