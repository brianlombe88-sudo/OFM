import React, { useEffect, useState } from 'react'
import { getProducts } from '../api'

export default function Marketplace() {
  const [products, setProducts] = useState([])
  useEffect(() => {
    getProducts().then(r => setProducts(r.products || []))
  }, [])

  return (
    <div>
      <h2 className="text-2xl">Marketplace</h2>
      {products.length === 0 && <p className="text-gray-600">No products yet.</p>}
      <ul className="product-list mt-4">
        {products.map(p => (
          <li key={p._id} className="py-3 border-b flex justify-between items-center">
            <a href={`/product/${p._id}`} className="font-medium text-gray-800">{p.title}</a>
            <div className="text-sm text-gray-600">K{p.price} • {p.quantity} available</div>
          </li>
        ))}
      </ul>
    </div>
  )
}
