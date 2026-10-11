import React, { useState } from 'react'
import { register } from '../api'
import { useNavigate } from 'react-router-dom'

const roleOptions = [
  { value: 'buyer', label: 'Buyer' },
  { value: 'farmer', label: 'Farmer' },
  { value: 'marketeer', label: 'Marketeer' },
  { value: 'transporter', label: 'Transporter' }
]

const dashboardForRole = {
  buyer: '/buyer-dashboard',
  farmer: '/seller-dashboard',
  marketeer: '/seller-dashboard',
  transporter: '/transporter-dashboard'
}

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('buyer')
  const [error, setError] = useState(null)
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    const res = await register({ name, email, phone, password, role })
    if (res.token) {
      localStorage.setItem('fm_token', res.token)
      localStorage.setItem('fm_user', JSON.stringify(res.user))
      nav(dashboardForRole[res.user?.role] || '/')
    } else {
      setError(res.message || 'Registration failed')
    }
  }

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={submit}>
        <div>
          <label>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div>
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div>
          <label>Phone</label>
          <input value={phone} onChange={e => setPhone(e.target.value)} />
        </div>
        <div>
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <div>
          <label>Role</label>
          <select value={role} onChange={e => setRole(e.target.value)}>
            {roleOptions.map(option => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <button type="submit">Register</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  )
}
