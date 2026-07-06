'use client'
import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

function ResetPasswordInner() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  if (!token) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ fontSize: 60, marginBottom: 12 }}>🔑</div>
        <h2 style={{ fontSize: 18, fontWeight: 800, marginBottom: 8, textAlign: 'center' }}>ลิงก์ไม่ถูกต้อง</h2>
        <p style={{ color: 'var(--text-light)', fontSize: 14, textAlign: 'center', marginBottom: 20 }}>
          ลิงก์หมดอายุหรือไม่ถูกต้อง กรุณาขอลิงก์ใหม่
        </p>
        <Link href="/forgot-password">
          <button style={{ padding: '12px 24px', borderRadius: 30, border: '2px solid var(--primary)', background: 'white', color: 'var(--primary)', fontWeight: 700, cursor: 'pointer' }}>
            ขอลิงก์ใหม่
          </button>
        </Link>
      </div>
    )
  }

  const handleSubmit = async () => {
    if (!password) { setError('กรุณาใส่รหัสผ่าน'); return }
    if (password.length < 6) { setError('รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร'); return }
    if (password !== confirm) { setError('รหัสผ่านไม่ตรงกัน'); return }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      })
      const data = await res.json()
      if (data.success) setDone(true)
      else setError(data.message || 'เกิดข้อผิดพลาด')
    } catch { setError('เกิดข้อผิดพลาด กรุณาลองใหม่') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 60, marginBottom: 8 }}>🔑</div>
        <div style={{ fontSize: 20, fontWeight: 800 }}>ตั้งรหัสผ่านใหม่</div>
      </div>

      <div style={{ padding: '32px 24px' }}>
        {done ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <div style={{ fontSize: 80, marginBottom: 16 }}>✅</div>
            <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 8 }}>รีเซ็ตรหัสผ่านสำเร็จ!</h2>
            <p style={{ color: 'var(--text-light)', fontSize: 14, marginBottom: 24 }}>เข้าสู่ระบบด้วยรหัสผ่านใหม่ได้เลย</p>
            <Link href="/login">
              <button style={{ width: '100%', padding: '15px 0', borderRadius: 30, border: 'none', background: 'var(--primary)', color: '#3D2C00', fontSize: 16, fontWeight: 800, cursor: 'pointer', boxShadow: '0 4px 16px rgba(255,184,0,0.3)' }}>
                🔐 เข้าสู่ระบบ
              </button>
            </Link>
          </div>
        ) : (
          <>
            <div style={{ background: 'white', borderRadius: 16, padding: 20, marginBottom: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="รหัสผ่านใหม่" autoFocus
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 15, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', marginBottom: 14 }} />
              <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSubmit()} placeholder="ยืนยันรหัสผ่าน"
                style={{ width: '100%', padding: '12px 14px', borderRadius: 10, border: '1.5px solid var(--border)', fontSize: 15, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' }} />
            </div>
            {error && <div style={{ padding: '10px 14px', background: '#FEE2E2', borderRadius: 10, color: '#DC2626', fontSize: 13, marginBottom: 12, textAlign: 'center' }}>{error}</div>}
            <button onClick={handleSubmit} disabled={loading}
              style={{ width: '100%', padding: '15px 0', borderRadius: 30, border: 'none', background: loading ? '#E5E5E5' : 'var(--primary)', color: loading ? '#999' : '#3D2C00', fontSize: 16, fontWeight: 800, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: 'Prompt, sans-serif', marginBottom: 20 }}>
              {loading ? 'กำลังบันทึก...' : '✅ บันทึกรหัสผ่านใหม่'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>กำลังโหลด...</div>}>
      <ResetPasswordInner />
    </Suspense>
  )
}
