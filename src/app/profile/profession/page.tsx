'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi, techniciansApi } from '@/lib/api'

const PROFESSIONS = [
  { value: 'electrical',   label: '⚡ ไฟฟ้า',      desc: 'ระบบไฟฟ้าภายในบ้าน, เดินสาย, ติดตั้งอุปกรณ์' },
  { value: 'plumbing',     label: '🚿 ประปา',      desc: 'ระบบท่อน้ำ, ซ่อมท่อรั่ว, ติดตั้งสุขภัณฑ์' },
  { value: 'it',           label: '💻 IT',           desc: 'คอมพิวเตอร์, เครือข่าย, ซอฟต์แวร์' },
  { value: 'construction', label: '🏗️ ก่อสร้าง',   desc: 'งานก่อสร้าง, ปรับปรุงบ้าน, ต่อเติม' },
]

export default function ProfessionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [profession, setProfession] = useState('')
  const [tech, setTech] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('tech_token')
    if (!token) { router.replace('/login'); return }

    Promise.all([authApi.me(), techniciansApi.me()])
      .then(([meRes, techRes]) => {
        if (!meRes.success) { router.replace('/login'); return }
        if (techRes.success) {
          setTech(techRes.technician)
          setProfession(techRes.technician.profession || '')
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  const handleSave = async () => {
    if (!profession) { setError('กรุณาเลือกอาชีพ'); return }
    setError('')
    setSaving(true)
    try {
      const res = await techniciansApi.updateProfile({ profession })
      if (res.success) {
        setSuccess('✅ บันทึกอาชีพเรียบร้อยแล้ว!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(res.message || 'บันทึกไม่สำเร็จ')
      }
    } catch (e: any) {
      setError(e.message || 'เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: 48, marginBottom: 8 }}>💼</div><div>กำลังโหลด...</div></div>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 100 }}>
      {/* HEADER */}
      <div style={{ background: 'var(--primary)', padding: '16px 20px', borderRadius: '0 0 24px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/profile"><div style={{ fontSize: 20 }}>←</div></Link>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#3D2C00' }}>อาชีพ</div>
      </div>

      <div style={{ padding: 20 }}>
        {success && (
          <div style={{ background: '#D1FAE5', color: '#065F46', padding: '12px 16px', borderRadius: 10, fontSize: 14, marginBottom: 16 }}>
            {success}
          </div>
        )}
        {error && (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '12px 16px', borderRadius: 10, fontSize: 14, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div style={{ marginBottom: 12 }}>
          <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 6 }}>
            เลือกอาชีพหลักของคุณ — ใช้ในการค้นหาของลูกค้า
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {PROFESSIONS.map(opt => {
            const selected = profession === opt.value
            return (
              <button
                key={opt.value}
                onClick={() => setProfession(opt.value)}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 14,
                  padding: '14px 16px',
                  borderRadius: 14,
                  border: selected ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                  background: selected ? 'var(--primary-light)' : 'var(--card)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  width: '100%',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  border: selected ? '2.5px solid var(--primary)' : '1.5px solid var(--border)',
                  background: selected ? 'var(--primary)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                  transition: 'all 0.15s',
                }}>
                  {selected && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#fff' }} />}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: selected ? '#92400E' : 'var(--text)', marginBottom: 2 }}>
                    {opt.label}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)' }}>
                    {opt.desc}
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ width: '100%', marginTop: 24 }}
        >
          {saving ? 'กำลังบันทึก...' : '💾 บันทึก'}
        </button>
      </div>

      <div className="bottom-nav">
        <Link href="/dashboard" className="nav-item"><span className="nav-icon">🏠</span>หน้าแรก</Link>
        <Link href="/orders" className="nav-item"><span style={{ fontSize: 20 }}>📋</span>งาน</Link>
        <Link href="/chat" className="nav-item"><span className="nav-icon">💬</span>แชท</Link>
        <Link href="/wallet" className="nav-item"><span className="nav-icon">💳</span>กระเป๋า</Link>
        <Link href="/profile" className="nav-item active"><span className="nav-icon">👤</span>โปรไฟล์</Link>
      </div>
    </div>
  )
}
