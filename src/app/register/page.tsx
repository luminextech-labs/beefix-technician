'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api'

export default function TechnicianRegisterPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!form.fullName.trim() || !form.email || !form.phone || !form.password) {
      setError('กรุณากรอกข้อมูลให้ครบ')
      return
    }
    if (form.password !== form.confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน')
      return
    }
    if (form.password.length < 6) {
      setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร')
      return
    }

    setLoading(true)
    try {
      // Register as technician via the shared API
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: 'technician',
        }),
      }).then(r => r.json()) as { success: boolean; message?: string; user: any; token: string }
        {
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: 'technician',
        }
      )

      if (res.success) {
        authApi.setToken(res.token)
        // Redirect to onboarding in the main beefix-web app
        window.location.href = 'https://beefix-web.vercel.app/technician/onboarding'
      } else {
        setError(res.message || 'สมัครไม่สำเร็จ ลองใหม่อีกครั้ง')
      }
    } catch (err: any) {
      setError(err.message || 'เกิดข้อผิดพลาด กรุณาลองใหม่')
    } finally {
      setLoading(false)
    }
  }

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }))

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>

      {/* LOGO */}
      <div style={{ textAlign: 'center', paddingTop: 48 }}>
        <div style={{ fontSize: 56, marginBottom: 8 }}>🔧</div>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text)' }}>Beefix Technician</div>
        <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>สมัครบัญชีช่างใหม่</div>
      </div>

      {/* FORM */}
      <div style={{ padding: '28px 24px', flex: 1 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>ชื่อ-นามสกุล</div>
            <input
              type="text"
              className="form-input"
              placeholder="สมชาย ซ่อมดี"
              value={form.fullName}
              onChange={e => set('fullName', e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>อีเมล</div>
            <input
              type="email"
              className="form-input"
              placeholder="tech@example.com"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>เบอร์โทรศัพท์</div>
            <input
              type="tel"
              className="form-input"
              placeholder="081-234-5678"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              required
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>รหัสผ่าน</div>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.password}
              onChange={e => set('password', e.target.value)}
              autoComplete="new-password"
              required
              minLength={6}
            />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>ยืนยันรหัสผ่าน</div>
            <input
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={form.confirmPassword}
              onChange={e => set('confirmPassword', e.target.value)}
              autoComplete="new-password"
              required
            />
          </div>

          {error && (
            <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'กำลังสมัคร...' : '🔧 สมัครเป็นช่าง'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 20, fontSize: 14, color: 'var(--text-light)' }}>
          มีบัญชีอยู่แล้ว?{' '}
          <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>เข้าสู่ระบบ</Link>
        </p>
      </div>
    </div>
  )
}
