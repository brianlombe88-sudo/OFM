import React from 'react'
import { Link } from 'react-router-dom'

export default function Nav(){
  const logged = !!localStorage.getItem('fm_token')
  return (
    <nav className="flex items-center justify-between">
      <div>
        <Link to="/" className="text-lg font-semibold text-brand">Farm Market</Link>
      </div>
      <div className="space-x-3 text-sm">
        <Link to="/market" className="text-brand">Marketplace</Link>
        <Link to="/cart" className="text-gray-600">Cart</Link>
        {logged ? <Link to="/add-product" className="text-gray-600">Sell</Link> : <Link to="/login" className="text-gray-600">Login</Link>}
      </div>
    </nav>
  )
}
