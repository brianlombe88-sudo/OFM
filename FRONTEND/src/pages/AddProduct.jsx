import React, { useState } from 'react'
import { createProduct } from '../api'
import { useNavigate } from 'react-router-dom'

export default function AddProduct(){
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [quantity, setQuantity] = useState('')
  const [category, setCategory] = useState('')
  const nav = useNavigate()

  async function submit(e){
    e.preventDefault()
    const token = localStorage.getItem('fm_token')
    if(!token) return nav('/login')
    const res = await createProduct({ title, description, price: Number(price), quantity: Number(quantity), category }, token)
    if(res.product) { nav('/product/'+res.product._id) }
    else alert(res.message || 'Failed')
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl mb-4">Sell a Product</h2>
      <form onSubmit={submit} className="space-y-4">
        <div><label className="block">Title</label><input value={title} onChange={e=>setTitle(e.target.value)} required /></div>
        <div><label className="block">Description</label><textarea value={description} onChange={e=>setDescription(e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-4"><div><label className="block">Price (K)</label><input value={price} onChange={e=>setPrice(e.target.value)} required /></div>
        <div><label className="block">Quantity</label><input value={quantity} onChange={e=>setQuantity(e.target.value)} required /></div></div>
        <div><label className="block">Category</label><input value={category} onChange={e=>setCategory(e.target.value)} /></div>
        <button type="submit">Create</button>
      </form>
    </div>
  )
}
