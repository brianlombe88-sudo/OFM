import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getProduct, createOrder } from '../api'

export default function ProductDetails(){
  const { id } = useParams()
  const [product, setProduct] = useState(null)
  const [qty, setQty] = useState(1)
  const nav = useNavigate()

  useEffect(()=>{
    getProduct(id).then(r=> setProduct(r.product)).catch(()=>{})
  },[id])

  function addToCart(){
    const cart = JSON.parse(localStorage.getItem('fm_cart')||'[]')
    const existing = cart.find(i=>i.productId===product._id)
    if(existing){ existing.quantity += Number(qty) }
    else cart.push({ productId: product._id, title: product.title, price: product.price, quantity: Number(qty) })
    localStorage.setItem('fm_cart', JSON.stringify(cart))
    nav('/cart')
  }

  async function buyNow(){
    const token = localStorage.getItem('fm_token')
    if(!token) return nav('/login')
    const res = await createOrder({ productId: product._id, quantity: qty }, token)
    if (res.order) {
      alert('Order created')
      nav('/');
    } else alert(res.message || 'Order failed')
  }

  if(!product) return <p>Loading...</p>
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h2 className="text-2xl font-semibold">{product.title}</h2>
        <p className="text-gray-700 mt-2">{product.description}</p>
      </div>
      <div className="card">
        <p className="text-lg font-medium">K{product.price}</p>
        <p className="text-sm text-gray-600">Available: {product.quantity}</p>
        <div className="mt-3">
          <label className="block text-sm">Qty:</label>
          <input className="mt-1" type="number" min="1" value={qty} onChange={e=>setQty(e.target.value)} />
        </div>
        <div className="mt-4">
          <button onClick={addToCart} className="w-full">Add to cart</button>
          <button onClick={buyNow} className="w-full mt-2 bg-green-700">Buy Now</button>
        </div>
      </div>
    </div>
  )
}
