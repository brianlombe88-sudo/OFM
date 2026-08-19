import React, { useState } from 'react'
import { register } from '../api'
import { useNavigate } from 'react-router-dom'

export default function Register() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState(null)
  const nav = useNavigate()

  async function submit(e) {
    e.preventDefault()
    const res = await register({ name, email, phone, password })
    if (res.token) {
      localStorage.setItem('fm_token', res.token)
      nav('/')
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
        <button type="submit">Register</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  )
}
