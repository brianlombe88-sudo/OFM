import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getProducts } from '../api'

export default function Home() {
  const navigate = useNavigate()
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)

  const categories = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Meat', 'Spices']

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const data = await getProducts({ limit: 12 })
      setProducts(data.products || [])
    } catch (error) {
      console.error('Failed to load products:', error)
    }
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) {
      navigate(`/market?q=${encodeURIComponent(search)}`)
    }
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <div className="hero bg-gradient-to-r from-green-600 to-green-800 text-white py-20 px-8 text-center">
        <h1 className="text-5xl font-bold mb-4">🌾 Welcome to OFM</h1>
        <p className="text-xl mb-8">Our Farm Market - Where farmers meet buyers directly</p>
        
        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex justify-center mb-8">
          <div className="flex w-full max-w-2xl">
            <input 
              type="text"
              placeholder="Search products, farmers, categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-6 py-3 rounded-l-lg text-gray-800"
            />
            <button type="submit" className="bg-yellow-500 hover:bg-yellow-600 px-8 py-3 rounded-r-lg font-semibold">
              Search
            </button>
          </div>
        </form>

        <Link 
          to="/market" 
          className="inline-block bg-yellow-500 hover:bg-yellow-600 px-8 py-3 rounded-lg font-semibold"
        >
          Explore Marketplace
        </Link>
      </div>

      {/* Features Section */}
      <div className="features grid grid-cols-1 md:grid-cols-3 gap-8 py-16 px-8 max-w-6xl mx-auto">
        <div className="feature-card bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
          <div className="text-4xl mb-4">👨‍🌾</div>
          <h3 className="text-2xl font-bold mb-2">Direct from Farmers</h3>
          <p className="text-gray-600">Buy fresh agricultural products directly from farmers and producers</p>
        </div>
        
        <div className="feature-card bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
          <div className="text-4xl mb-4">💰</div>
          <h3 className="text-2xl font-bold mb-2">Fair Prices</h3>
          <p className="text-gray-600">No middlemen - get better prices for buyers and sellers alike</p>
        </div>
        
        <div className="feature-card bg-white p-8 rounded-lg shadow-md hover:shadow-lg transition">
          <div className="text-4xl mb-4">🚚</div>
          <h3 className="text-2xl font-bold mb-2">Fast Delivery</h3>
          <p className="text-gray-600">Pickup or delivery options available for your convenience</p>
        </div>
      </div>

      {/* Categories Section */}
      <div className="categories bg-gray-50 py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center">Popular Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat}
                to={`/market?category=${encodeURIComponent(cat)}`}
                className="category-card bg-white p-6 rounded-lg shadow-md hover:shadow-lg hover:bg-green-50 text-center transition"
              >
                <div className="text-3xl mb-2">
                  {cat === 'Vegetables' && '🥬'}
                  {cat === 'Fruits' && '🍎'}
                  {cat === 'Grains' && '🌾'}
                  {cat === 'Dairy' && '🥛'}
                  {cat === 'Meat' && '🍖'}
                  {cat === 'Spices' && '🌶️'}
                </div>
                <h3 className="font-semibold text-gray-800">{cat}</h3>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Products */}
      <div className="featured py-16 px-8">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-12">Featured Products</h2>
          {loading ? (
            <p className="text-center text-gray-500">Loading products...</p>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <Link
                  key={product._id}
                  to={`/product/${product._id}`}
                  className="product-card bg-white rounded-lg shadow-md hover:shadow-lg overflow-hidden transition"
                >
                  <div className="bg-gray-200 h-48 flex items-center justify-center">
                    <span className="text-4xl">
                      {product.category === 'Vegetables' && '🥬'}
                      {product.category === 'Fruits' && '🍎'}
                      {product.category === 'Grains' && '🌾'}
                      {product.category === 'Dairy' && '🥛'}
                      {product.category === 'Meat' && '🍖'}
                      {product.category === 'Spices' && '🌶️'}
                      {!product.category && '📦'}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-lg truncate">{product.title}</h3>
                    <p className="text-gray-600 text-sm mb-2">{product.category}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-green-600">₦{product.price}</span>
                      <span className="text-sm text-gray-500">{product.quantity} in stock</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500">No products available yet</p>
          )}
        </div>
      </div>

      {/* CTA Section */}
      <div className="cta bg-green-600 text-white py-16 px-8 text-center">
        <h2 className="text-4xl font-bold mb-4">Ready to start selling?</h2>
        <p className="text-xl mb-8">Join thousands of farmers and producers on OFM</p>
        <Link 
          to="/register" 
          className="inline-block bg-yellow-500 hover:bg-yellow-600 px-8 py-3 rounded-lg font-semibold text-gray-900"
        >
          Become a Seller
        </Link>
      </div>
    </div>
  )
}
