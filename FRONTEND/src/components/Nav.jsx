import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Nav() {
  const navigate = useNavigate()
  const [showMenu, setShowMenu] = useState(false)
  
  const token = localStorage.getItem('fm_token')
  const user = token ? JSON.parse(localStorage.getItem('fm_user') || '{}') : null

  const handleLogout = () => {
    localStorage.removeItem('fm_token')
    localStorage.removeItem('fm_user')
    setShowMenu(false)
    navigate('/')
  }

  return (
    <nav className="bg-green-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold">
          🌾 OFM
        </Link>

        {/* Main Navigation */}
        <div className="hidden md:flex items-center gap-6 text-sm font-semibold">
          <Link to="/market" className="hover:text-yellow-200 transition">
            Marketplace
          </Link>
          
          {token && (
            <>
              <Link to="/cart" className="hover:text-yellow-200 transition">
                Cart
              </Link>
              <Link to="/orders" className="hover:text-yellow-200 transition">
                Orders
              </Link>
              {user && ['farmer', 'marketeer', 'admin'].includes(user.role) && (
                <Link to="/seller-dashboard" className="hover:text-yellow-200 transition">
                  Dashboard
                </Link>
              )}
            </>
          )}
        </div>

        {/* Auth Buttons / User Menu */}
        <div className="flex items-center gap-3">
          {!token ? (
            <>
              <Link
                to="/login"
                className="px-4 py-2 hover:bg-green-700 rounded-lg transition"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold rounded-lg transition"
              >
                Sign Up
              </Link>
            </>
          ) : (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 px-4 py-2 hover:bg-green-700 rounded-lg transition"
              >
                <span className="text-lg">👤</span>
                <span className="text-sm font-semibold">{user?.name || 'User'}</span>
                <span className="text-xl">{showMenu ? '▲' : '▼'}</span>
              </button>

              {/* Dropdown Menu */}
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white text-gray-900 rounded-lg shadow-lg z-50">
                  <div className="px-4 py-3 border-b">
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-xs text-gray-600">{user?.email}</p>
                    <p className="text-xs text-gray-500 capitalize mt-1">{user?.role}</p>
                  </div>

                  <Link
                    to="/orders"
                    className="block px-4 py-2 hover:bg-gray-100 text-sm"
                    onClick={() => setShowMenu(false)}
                  >
                    My Orders
                  </Link>

                  {['farmer', 'marketeer', 'admin'].includes(user?.role) && (
                    <>
                      <Link
                        to="/seller-dashboard"
                        className="block px-4 py-2 hover:bg-gray-100 text-sm"
                        onClick={() => setShowMenu(false)}
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/add-product"
                        className="block px-4 py-2 hover:bg-gray-100 text-sm"
                        onClick={() => setShowMenu(false)}
                      >
                        Add Product
                      </Link>
                    </>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm border-t text-red-600 font-semibold"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      <div className="md:hidden bg-green-700 px-4 py-2 text-sm space-y-1">
        <Link to="/market" className="block py-2 hover:bg-green-600 px-2 rounded">
          Marketplace
        </Link>
        {token && (
          <>
            <Link to="/cart" className="block py-2 hover:bg-green-600 px-2 rounded">
              Cart
            </Link>
            <Link to="/orders" className="block py-2 hover:bg-green-600 px-2 rounded">
              Orders
            </Link>
            {user && ['farmer', 'marketeer', 'admin'].includes(user.role) && (
              <>
                <Link to="/seller-dashboard" className="block py-2 hover:bg-green-600 px-2 rounded">
                  Dashboard
                </Link>
                <Link to="/add-product" className="block py-2 hover:bg-green-600 px-2 rounded">
                  Sell
                </Link>
              </>
            )}
          </>
        )}
      </div>
    </nav>
  )
}
