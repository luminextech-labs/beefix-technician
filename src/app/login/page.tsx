'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async () => {
    if (!email || !password) { setError('กรุณากรอกข้อมูลให้ครบ'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      }).then(r => r.json())

      if (res.success && res.user?.role === 'technician') {
        authApi.setToken(res.token)
        router.push('/dashboard')
      } else {
        setError(res.message || 'ไม่พบบัญชีช่าง หรือรหัสผ่านไม่ถูกต้อง')
      }
    } catch {
      setError('เข้าสู่ระบบไม่สำเร็จ ลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      {/* LOGO */}
      <div style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 64, marginBottom: 8 }}>🔧</div>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text)' }}>Beefix Technician</div>
        <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>เข้าสู่ระบบเพื่อรับงานซ่อม</div>
      </div>

      {/* FORM */}
      <div style={{ padding: '32px 24px', flex: 1 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>อีเมล</div>
          <input
            type="email"
            className="form-input"
            placeholder="tech@example.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            autoComplete="email"
          />
        </div>
        <div style={{ marginBottom: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>รหัสผ่าน</div>
          <input
            type="password"
            className="form-input"
            placeholder="••••••••"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="current-password"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
        </div>

        {error && (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <button className="btn-primary" onClick={handleLogin} disabled={loading}>
          {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-light)' }}>
          ยังไม่มีบัญชี?{' '}
          <a href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>สมัครสมาชิก</a>
        </p>
        <p style={{ textAlign: 'center', marginTop: 12, fontSize: 13 }}>
          <a href="/forgot-password" style={{ color: 'var(--text-light)', fontWeight: 600 }}>ลืมรหัสผ่าน?</a>
        </p>
      </div>
    </div>
  )
}
