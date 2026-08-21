import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProduct, addToCart as apiAddToCart, createOrder, getProductReviews } from '../api'

export default function ProductDetails() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [reviews, setReviews] = useState([])
  const [qty, setQty] = useState(1)
  const [loading, setLoading] = useState(true)
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [error, setError] = useState(null)

  const token = localStorage.getItem('fm_token')
  const user = localStorage.getItem('fm_user') ? JSON.parse(localStorage.getItem('fm_user')) : null

  useEffect(() => {
    loadProduct()
    loadReviews()
  }, [id])

  const loadProduct = async () => {
    try {
      const data = await getProduct(id)
      setProduct(data.product)
      setLoading(false)
    } catch (err) {
      setError('Failed to load product')
      setLoading(false)
    }
  }

  const loadReviews = async () => {
    setReviewsLoading(true)
    try {
      const data = await getProductReviews(id)
      setReviews(data.reviews || [])
    } catch (err) {
      console.error('Failed to load reviews:', err)
    }
    setReviewsLoading(false)
  }

  const handleAddToCart = async () => {
    if (!token) {
      navigate('/login')
      return
    }

    try {
      const res = await apiAddToCart(id, qty, token)
      if (res.cart) {
        alert(`Added ${qty} item(s) to cart`)
        setQty(1)
      } else {
        alert(res.message || 'Failed to add to cart')
      }
    } catch (err) {
      alert('Error adding to cart')
    }
  }

  const handleBuyNow = async () => {
    if (!token) {
      navigate('/login')
      return
    }

    try {
      const res = await createOrder(id, qty, 'pickup', null, token)
      if (res.order) {
        alert('Order created successfully!')
        navigate(`/orders`)
      } else {
        alert(res.message || 'Order failed')
      }
    } catch (err) {
      alert('Error creating order')
    }
  }

  if (loading) return <p className="text-center py-8">Loading product...</p>
  if (error) return <p className="text-center text-red-600 py-8">{error}</p>
  if (!product) return <p className="text-center py-8">Product not found</p>

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 'No ratings'

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
        {/* Product Image */}
        <div className="md:col-span-1">
          <div className="bg-gray-200 h-96 rounded-lg flex items-center justify-center sticky top-4">
            <span className="text-8xl">
              {product.category === 'Vegetables' && '🥬'}
              {product.category === 'Fruits' && '🍎'}
              {product.category === 'Grains' && '🌾'}
              {product.category === 'Dairy' && '🥛'}
              {product.category === 'Meat' && '🍖'}
              {product.category === 'Spices' && '🌶️'}
              {!product.category && '📦'}
            </span>
          </div>
        </div>

        {/* Product Info */}
        <div className="md:col-span-2">
          <div className="mb-4">
            <span className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full">
              {product.category}
            </span>
          </div>

          <h1 className="text-4xl font-bold mb-4">{product.title}</h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold text-yellow-500">★</span>
            <span className="text-lg font-semibold">{avgRating}</span>
            <span className="text-gray-600">({reviews.length} reviews)</span>
          </div>

          <p className="text-gray-700 text-lg mb-6">{product.description}</p>

          {/* Seller Info */}
          {product.seller && (
            <div className="bg-gray-50 p-4 rounded-lg mb-6">
              <p className="text-sm text-gray-600">Sold by</p>
              <p className="text-lg font-semibold">{product.seller.name}</p>
              <p className="text-sm text-gray-600">Role: {product.seller.role}</p>
            </div>
          )}

          {/* Price and Purchase */}
          <div className="bg-white border-2 border-gray-200 p-6 rounded-lg">
            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Price per {product.unit || 'unit'}</p>
              <p className="text-4xl font-bold text-green-600">₦{product.price}</p>
            </div>

            <div className="mb-6">
              <p className="text-sm text-gray-600 mb-2">Available Stock</p>
              <p className="text-xl font-semibold">
                {product.quantity} {product.unit || 'units'}
              </p>
              {product.quantity <= 5 && product.quantity > 0 && (
                <p className="text-sm text-orange-600 mt-2">⚠️ Only {product.quantity} left!</p>
              )}
              {product.quantity === 0 && (
                <p className="text-sm text-red-600 mt-2">Out of stock</p>
              )}
            </div>

            {/* Quantity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">Quantity</label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                >
                  −
                </button>
                <input
                  type="number"
                  min="1"
                  max={product.quantity}
                  value={qty}
                  onChange={(e) => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-20 text-center border rounded-lg px-3 py-2"
                />
                <button
                  onClick={() => setQty(Math.min(product.quantity, qty + 1))}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={handleAddToCart}
                disabled={product.quantity === 0}
                className="w-full bg-yellow-500 hover:bg-yellow-600 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition"
              >
                🛒 Add to Cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={product.quantity === 0}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition"
              >
                💳 Buy Now
              </button>
            </div>

            {!token && (
              <p className="text-sm text-blue-600 mt-4 text-center">
                <a href="/login" className="underline">Log in</a> to purchase
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="border-t pt-8">
        <h2 className="text-3xl font-bold mb-6">Customer Reviews</h2>
        
        {reviewsLoading ? (
          <p className="text-gray-500">Loading reviews...</p>
        ) : reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review._id} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold">{review.reviewer?.name || 'Anonymous'}</p>
                    <p className="text-sm text-gray-600">{new Date(review.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} className={i < review.rating ? 'text-yellow-500' : 'text-gray-300'}>
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <p className="text-gray-700">{review.comment}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No reviews yet. Be the first to review!</p>
        )}
      </div>
    </div>
  )
}
