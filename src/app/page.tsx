'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('tech_token')
    if (token) {
      router.replace('/dashboard')
    } else {
      router.replace('/login')
    }
  }, [router])

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 12 }}>🔧</div>
        <div style={{ fontWeight: 700, color: 'var(--text)' }}>Beefix Technician</div>
        <div style={{ color: 'var(--text-light)', marginTop: 8, fontSize: 14 }}>กำลังโหลด...</div>
      </div>
    </div>
  )
}
