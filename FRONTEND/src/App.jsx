import React from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Home from './pages/Home'
import Marketplace from './pages/Marketplace'
import ProductDetails from './pages/ProductDetails'
import AddProduct from './pages/AddProduct'
import Cart from './pages/Cart'
import Orders from './pages/Orders'
import SellerDashboard from './pages/SellerDashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Nav from './components/Nav'

export default function App() {
  return (
    <div className="app">
      <Nav />
      <main style={{ padding: 12 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/market" element={<Marketplace />} />
          <Route path="/product/:id" element={<ProductDetails/>} />
          <Route path="/add-product" element={<AddProduct/>} />
          <Route path="/cart" element={<Cart/>} />
          <Route path="/orders" element={<Orders/>} />
          <Route path="/seller-dashboard" element={<SellerDashboard/>} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Routes>
      </main>
    </div>
  )
}
