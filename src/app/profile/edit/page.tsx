'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi, techniciansApi, uploadApi } from '@/lib/api'

export default function EditProfilePage() {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingImg, setUploadingImg] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [user, setUser] = useState<any>(null)
  const [tech, setTech] = useState<any>(null)

  const [form, setForm] = useState({
    avatarUrl: '',
    fullName: '',
    phone: '',
    headline: '',
    bio: '',
    yearsExperience: '',
    hourlyRate: '',
    isAvailable: true,
  })

  useEffect(() => {
    const token = localStorage.getItem('tech_token')
    if (!token) { router.replace('/login'); return }

    Promise.all([authApi.me(), techniciansApi.me()])
      .then(([meRes, techRes]) => {
        if (!meRes.success) { router.replace('/login'); return }
        setUser(meRes.user)
        if (techRes.success) setTech(techRes.technician)
        setForm({
          avatarUrl: meRes.user.avatarUrl || '',
          fullName: meRes.user.fullName || '',
          phone: meRes.user.phone || '',
          headline: techRes.technician?.headline || '',
          bio: techRes.technician?.bio || '',
          yearsExperience: techRes.technician?.yearsExperience?.toString() || '',
          hourlyRate: techRes.technician?.hourlyRate?.toString() || '',
          isAvailable: techRes.technician?.isAvailable ?? true,
        })
      })
      .finally(() => setLoading(false))
  }, [router])

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingImg(true)
    setError('')
    try {
      const res = await uploadApi.image(file, 'avatars')
      if (res.success && res.url) {
        setForm(f => ({ ...f, avatarUrl: res.url }))
      } else {
        setError('อัปโหลดรูปไม่สำเร็จ')
      }
    } catch (e: any) {
      setError(e.message || 'เกิดข้อผิดพลาด')
    } finally {
      setUploadingImg(false)
    }
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')
    if (!form.fullName.trim()) { setError('กรุณากรอกชื่อ'); return }
    if (!form.phone.trim()) { setError('กรุณากรอกเบอร์โทร'); return }
    setSaving(true)
    try {
      // Update avatar via profile API
      const profileRes = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatarUrl: form.avatarUrl, fullName: form.fullName, phone: form.phone }),
      }).then(r => r.json())

      if (!profileRes.success) {
        setError(profileRes.message || 'บันทึกไม่สำเร็จ')
        setSaving(false)
        return
      }

      const techRes = await techniciansApi.updateProfile({
        headline: form.headline,
        bio: form.bio,
        yearsExperience: form.yearsExperience ? parseInt(form.yearsExperience) : undefined,
        hourlyRate: form.hourlyRate ? parseFloat(form.hourlyRate) : undefined,
        isAvailable: form.isAvailable,
      })
      if (techRes.success) {
        setSuccess('✅ บันทึกสำเร็จแล้ว!')
        setTimeout(() => setSuccess(''), 3000)
      } else {
        setError(techRes.message || 'บันทึกไม่สำเร็จ')
      }
    } catch (e: any) {
      setError(e.message || 'เกิดข้อผิดพลาด')
    } finally {
      setSaving(false)
    }
  }

  const set = (key: string, val: any) => setForm(f => ({ ...f, [key]: val }))

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: 48, marginBottom: 8 }}>🔧</div><div>กำลังโหลด...</div></div>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 100 }}>
      {/* HEADER */}
      <div style={{ background: 'var(--primary)', padding: '16px 20px', borderRadius: '0 0 24px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/profile"><div style={{ fontSize: 20 }}>←</div></Link>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#3D2C00' }}>แก้ไขโปรไฟล์</div>
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

        {/* AVATAR */}
        <div style={{ textAlign: 'center', marginBottom: 20 }}>
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <div style={{
              width: 100, height: 100, borderRadius: '50%',
              background: 'var(--primary-light)', border: '3px solid var(--primary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 40, overflow: 'hidden', cursor: 'pointer',
            }} onClick={() => !uploadingImg && fileRef.current?.click()}>
              {uploadingImg ? (
                <div style={{ fontSize: 24 }}>⏳</div>
              ) : form.avatarUrl ? (
                <img src={form.avatarUrl} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <span>{form.fullName?.charAt(0) || '?'}</span>
              )}
            </div>
            <div style={{
              position: 'absolute', bottom: 0, right: 0,
              width: 32, height: 32, borderRadius: '50%',
              background: 'var(--primary)', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, border: '2px solid white',
            }}>📷</div>
          </div>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
          <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 8 }}>แตะเปลี่ยนรูปโปรไฟล์</div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>ชื่อ-นามสกุล</div>
          <input className="form-input" value={form.fullName}
            onChange={e => set('fullName', e.target.value)} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>เบอร์โทรศัพท์</div>
          <input className="form-input" type="tel" value={form.phone}
            onChange={e => set('phone', e.target.value)} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>คำอธิบายตัวเอง (Headline)</div>
          <input className="form-input" placeholder="เชี่ยวชาญซ่อมแอร์ 10 ปี" value={form.headline}
            onChange={e => set('headline', e.target.value)} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>รายละเอียด (Bio)</div>
          <textarea className="form-input" rows={4} placeholder="บริการซ่อมแอร์ ติดตั้ง ล้างแอร์..."
            value={form.bio} onChange={e => set('bio', e.target.value)}
            style={{ resize: 'vertical' }} />
        </div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>ประสบการณ์ (ปี)</div>
            <input className="form-input" type="number" min="0" value={form.yearsExperience}
              onChange={e => set('yearsExperience', e.target.value)} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>ค่าแรง/ชม. (บาท)</div>
            <input className="form-input" type="number" min="0" value={form.hourlyRate}
              onChange={e => set('hourlyRate', e.target.value)} />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 16px', background: 'var(--card)', borderRadius: 12, marginBottom: 20 }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>พร้อมรับงาน</div>
            <div style={{ fontSize: 12, color: 'var(--text-light)' }}>เปิดรับงานจากลูกค้า</div>
          </div>
          <button
            onClick={() => set('isAvailable', !form.isAvailable)}
            style={{
              width: 48, height: 28, borderRadius: 14, border: 'none',
              background: form.isAvailable ? 'var(--green)' : 'var(--border)',
              position: 'relative', cursor: 'pointer', transition: 'background 0.2s'
            }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 3,
              left: form.isAvailable ? 23 : 3,
              transition: 'left 0.2s',
            }} />
          </button>
        </div>

        <button className="btn-primary" onClick={handleSave} disabled={saving} style={{ width: '100%' }}>
          {saving ? 'กำลังบันทึก...' : '💾 บันทึก'}
        </button>
      </div>

      <div className="bottom-nav">
        <Link href="/dashboard" className="nav-item"><span className="nav-icon">🏠</span>หน้าแรก</Link>
        <Link href="/orders" className="nav-item"><span className="nav-icon">📋</span>งาน</Link>
        <Link href="/chat" className="nav-item"><span className="nav-icon">💬</span>แชท</Link>
        <Link href="/wallet" className="nav-item"><span className="nav-icon">💳</span>กระเป๋า</Link>
        <Link href="/profile" className="nav-item active"><span className="nav-icon">👤</span>โปรไฟล์</Link>
      </div>
    </div>
  )
}
