import React, { useState, useEffect } from 'react'
import { createOrder } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Cart(){
  const [cart, setCart] = useState([])
  const nav = useNavigate()

  useEffect(()=>{
    setCart(JSON.parse(localStorage.getItem('fm_cart')||'[]'))
  },[])

  function remove(i){
    const c = [...cart]; c.splice(i,1); setCart(c); localStorage.setItem('fm_cart', JSON.stringify(c))
  }

  async function checkout(){
    const token = localStorage.getItem('fm_token')
    if(!token) return nav('/login')
    for(const item of cart){
      // create an order per item
      await createOrder({ productId: item.productId, quantity: item.quantity }, token)
    }
    localStorage.removeItem('fm_cart')
    alert('Orders created')
    nav('/')
  }

  const total = cart.reduce((s,i)=> s + (i.price * i.quantity), 0)

  return (
    <div>
      <h2 className="text-2xl mb-3">Cart</h2>
      {cart.length===0 && <p className="text-gray-600">Cart is empty.</p>}
      <ul className="space-y-3">
        {cart.map((c,i)=> (
          <li key={c.productId} className="p-3 border rounded flex justify-between items-center">
            <div>
              <div className="font-medium">{c.title}</div>
              <div className="text-sm text-gray-600">K{c.price} x {c.quantity}</div>
            </div>
            <div>
              <button className="bg-red-500" onClick={()=>remove(i)}>Remove</button>
            </div>
          </li>
        ))}
      </ul>
      {cart.length>0 && <div className="mt-4">
        <p className="text-lg"><strong>Total:</strong> K{total}</p>
        <button onClick={checkout} className="mt-2">Checkout</button>
      </div>}
    </div>
  )
}
