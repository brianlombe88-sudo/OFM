import React, { useEffect, useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { getProducts } from '../api'

export default function Marketplace() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)

  // Filter states
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [category, setCategory] = useState(searchParams.get('category') || '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') || '')
  const [province, setProvince] = useState(searchParams.get('province') || '')

  const categories = ['Vegetables', 'Fruits', 'Grains', 'Dairy', 'Meat', 'Spices']

  useEffect(() => {
    loadProducts()
  }, [page, search, category, minPrice, maxPrice, province])

  const loadProducts = async () => {
    setLoading(true)
    try {
      const filters = {}
      if (search) filters.q = search
      if (category) filters.category = category
      if (minPrice) filters.minPrice = minPrice
      if (maxPrice) filters.maxPrice = maxPrice
      if (province) filters.province = province
      filters.page = page
      filters.limit = 20

      const data = await getProducts(filters)
      setProducts(data.products || [])
      setTotal(data.total || 0)
    } catch (error) {
      console.error('Failed to load products:', error)
    }
    setLoading(false)
  }

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1)
    updateSearchParams()
  }

  const updateSearchParams = () => {
    const params = new URLSearchParams()
    if (search) params.set('q', search)
    if (category) params.set('category', category)
    if (minPrice) params.set('minPrice', minPrice)
    if (maxPrice) params.set('maxPrice', maxPrice)
    if (province) params.set('province', province)
    setSearchParams(params)
  }

  const handleFilterChange = () => {
    setPage(1)
    updateSearchParams()
  }

  const pages = Math.ceil(total / 20)

  return (
    <div className="marketplace">
      <div className="max-w-7xl mx-auto py-8 px-4">
        <h1 className="text-4xl font-bold mb-8">🛒 Marketplace</h1>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 mb-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h3 className="text-2xl font-bold mb-6">Filters</h3>

              {/* Category Filter */}
              <div className="mb-6">
                <label className="block font-semibold mb-2">Category</label>
                <select
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value)
                    handleFilterChange()
                  }}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Price Range Filter */}
              <div className="mb-6">
                <label className="block font-semibold mb-2">Price Range</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={minPrice}
                    onChange={(e) => {
                      setMinPrice(e.target.value)
                      handleFilterChange()
                    }}
                    className="w-1/2 border rounded-lg px-3 py-2"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={maxPrice}
                    onChange={(e) => {
                      setMaxPrice(e.target.value)
                      handleFilterChange()
                    }}
                    className="w-1/2 border rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              {/* Clear Filters */}
              <button
                onClick={() => {
                  setSearch('')
                  setCategory('')
                  setMinPrice('')
                  setMaxPrice('')
                  setProvince('')
                  setPage(1)
                  setSearchParams('')
                }}
                className="w-full bg-gray-300 hover:bg-gray-400 px-4 py-2 rounded-lg font-semibold"
              >
                Clear Filters
              </button>
            </div>
          </div>

          {/* Products Section */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="mb-8">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Search products..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 border rounded-lg px-4 py-3"
                />
                <button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-semibold"
                >
                  Search
                </button>
              </div>
            </form>

            {/* Products Grid */}
            {loading ? (
              <p className="text-center text-gray-500">Loading products...</p>
            ) : products.length > 0 ? (
              <>
                <div className="mb-4 text-gray-600">
                  Showing {products.length} of {total} products
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {products.map((product) => (
                    <Link
                      key={product._id}
                      to={`/product/${product._id}`}
                      className="product-card bg-white rounded-lg shadow-md hover:shadow-lg overflow-hidden transition"
                    >
                      <div className="bg-gray-200 h-48 flex items-center justify-center">
                        <span className="text-5xl">
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
                        <h3 className="font-bold text-lg mb-1">{product.title}</h3>
                        <p className="text-gray-600 text-sm mb-2">{product.category}</p>
                        <p className="text-gray-600 text-sm mb-3 truncate">{product.description}</p>
                        <div className="flex justify-between items-end">
                          <div>
                            <p className="text-2xl font-bold text-green-600">₦{product.price}</p>
                            <p className="text-xs text-gray-500">per {product.unit || 'unit'}</p>
                          </div>
                          <p className="text-sm text-yellow-600 font-semibold">{product.quantity} available</p>
                        </div>
                        {product.seller && (
                          <p className="text-xs text-gray-500 mt-2">by {product.seller.name}</p>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pages > 1 && (
                  <div className="flex justify-center gap-2 mt-8">
                    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`px-4 py-2 rounded-lg ${
                          p === page
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <p className="text-center text-gray-500">No products found. Try adjusting your filters.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
