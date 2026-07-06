'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi, categoriesApi } from '@/lib/api'

const DEFAULT_TRADES = [
  { name: 'ช่างยนต์', icon: '🚗' },
  { name: 'ช่างไฟฟ้า', icon: '💡' },
  { name: 'ช่างประปา', icon: '🚿' },
  { name: 'ช่างแอร์', icon: '❄️' },
  { name: 'ช่างคอมพิวเตอร์', icon: '💻' },
  { name: 'ช่างก่อสร้าง', icon: '🏗️' },
  { name: 'ช่างเฟอร์นิเจอร์', icon: '🪑' },
  { name: 'ช่างสี', icon: '🎨' },
  { name: 'ช่างกล้อง', icon: '📷' },
  { name: 'ช่างอื่นๆ', icon: '🔧' },
]

export default function TechnicianRegisterPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    tradeTypes: [] as string[],
  })
  const [systemCategories, setSystemCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    categoriesApi.getAll().then(r => {
      if (r.success) setSystemCategories(r.categories || [])
    }).catch(() => {})
  }, [])

  const allTradeOptions = [
    ...DEFAULT_TRADES,
    ...systemCategories.map((c: any) => ({ name: c.name, icon: c.icon || '📂' })),
  ]

  const toggleTrade = (name: string) => {
    setForm(f => ({
      ...f,
      tradeTypes: f.tradeTypes.includes(name)
        ? f.tradeTypes.filter(t => t !== name)
        : [...f.tradeTypes, name],
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (step === 1) {
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
      setStep(2)
      return
    }

    // Step 2 - register
    if (form.tradeTypes.length === 0) {
      setError('กรุณาเลือกอย่างน้อย 1 ประเภท')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: form.fullName,
          email: form.email,
          phone: form.phone,
          password: form.password,
          role: 'technician',
          specializations: form.tradeTypes.join(', '),
        }),
      }).then(r => r.json()) as { success: boolean; message?: string; user: any; token: string }

      if (res.success) {
        authApi.setToken(res.token)
        window.location.href = 'https://beefix-technician-2ill72kk9-luminexlabs-projects.vercel.app/onboarding'
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
      <div style={{ textAlign: 'center', paddingTop: 40 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>🔧</div>
        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text)' }}>Beefix Technician</div>
        <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>
          {step === 1 ? 'สมัครบัญชีช่างใหม่' : 'เลือกประเภทช่าง'}
        </div>
        {/* STEP INDICATOR */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 12 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: step >= 1 ? 'var(--primary)' : 'var(--border)' }} />
          <div style={{ width: 40, height: 4, borderRadius: 2, background: step >= 2 ? 'var(--primary)' : 'var(--border)' }} />
        </div>
      </div>

      {/* FORM */}
      <div style={{ padding: '24px 24px', flex: 1 }}>
        <form onSubmit={handleSubmit}>

          {/* STEP 1: Account Info */}
          {step === 1 && (
            <>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>ชื่อ-นามสกุล</div>
                <input type="text" className="form-input" placeholder="สมชาย ซ่อมดี"
                  value={form.fullName} onChange={e => set('fullName', e.target.value)} required />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>อีเมล</div>
                <input type="email" className="form-input" placeholder="tech@example.com"
                  value={form.email} onChange={e => set('email', e.target.value)} autoComplete="email" required />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>เบอร์โทรศัพท์</div>
                <input type="tel" className="form-input" placeholder="081-234-5678"
                  value={form.phone} onChange={e => set('phone', e.target.value)} required />
              </div>
              <div style={{ marginBottom: 14 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>รหัสผ่าน</div>
                <input type="password" className="form-input" placeholder="••••••••"
                  value={form.password} onChange={e => set('password', e.target.value)}
                  autoComplete="new-password" required minLength={6} />
              </div>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>ยืนยันรหัสผ่าน</div>
                <input type="password" className="form-input" placeholder="••••••••"
                  value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)}
                  autoComplete="new-password" required />
              </div>
            </>
          )}

          {/* STEP 2: Trade Type */}
          {step === 2 && (
            <>
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>คุณเป็นช่างประเภทไหนบ้าง?</div>
                <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4 }}>เลือกได้มากกว่า 1 ประเภท</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
                {allTradeOptions.map(trade => {
                  const selected = form.tradeTypes.includes(trade.name)
                  return (
                    <button type="button" key={trade.name}
                      onClick={() => toggleTrade(trade.name)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 20,
                        border: selected ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                        background: selected ? 'var(--primary-light)' : 'var(--card)',
                        color: selected ? '#8B6914' : 'var(--text)',
                        fontSize: 13,
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                      }}>
                      <span>{trade.icon}</span> {trade.name}
                    </button>
                  )
                })}
              </div>
              {/* Show selected summary */}
              {form.tradeTypes.length > 0 && (
                <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 12 }}>
                  ✓ เลือกแล้ว: {form.tradeTypes.join(', ')}
                </div>
              )}
              <button type="button" onClick={() => setStep(1)}
                style={{ background: 'none', border: 'none', color: 'var(--text-light)', fontSize: 13, cursor: 'pointer', marginBottom: 12 }}>
                ← กลับไปแก้ไขข้อมูล
              </button>
            </>
          )}

          {error && (
            <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'กำลังสมัคร...' : step === 1 ? 'ต่อไป →' : '🔧 สมัครเป็นช่าง'}
          </button>
        </form>
      </div>
    </div>
  )
}
