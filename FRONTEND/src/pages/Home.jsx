import React, { useEffect, useState } from 'react'
import { health } from '../api'

export default function Home() {
  const [status, setStatus] = useState(null)
  useEffect(() => {
    health().then(setStatus).catch(() => setStatus({ message: 'offline' }))
  }, [])

  return (
    <div>
      <h1>Farm Market</h1>
      <p>{status ? status.message : 'Checking API...'}</p>
    </div>
  )
}
