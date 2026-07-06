'use client'
import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi, techniciansApi, uploadApi } from '@/lib/api'

type Cert = { name: string; issuer: string; year?: number; fileUrl?: string }

export default function CertificationsPage() {
  const router = useRouter()
  const certFileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')
  const [certifications, setCertifications] = useState<Cert[]>([])
  const [uploadingCertIndex, setUploadingCertIndex] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem('tech_token')
    if (!token) { router.replace('/login'); return }

    Promise.all([authApi.me(), techniciansApi.me()])
      .then(([meRes, techRes]) => {
        if (!meRes.success) { router.replace('/login'); return }
        if (techRes.success) {
          setCertifications(techRes.technician.certifications || [])
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  const handleCertFileChange = async (e: React.ChangeEvent<HTMLInputElement>, certIndex: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingCertIndex(certIndex)
    try {
      const res = await uploadApi.image(file, 'certifications')
      if (res.success && res.url) {
        const updated = [...certifications]
        updated[certIndex] = { ...updated[certIndex], fileUrl: res.url }
        setCertifications(updated)
      } else {
        setError('อัปโหลดไฟล์ไม่สำเร็จ')
      }
    } catch (e: any) {
      setError(e.message || 'เกิดข้อผิดพลาด')
    } finally {
      setUploadingCertIndex(null)
      if (certFileRef.current) certFileRef.current.value = ''
    }
  }

  const updateCert = (index: number, field: keyof Cert, value: any) => {
    const updated = [...certifications]
    updated[index] = { ...updated[index], [field]: value }
    setCertifications(updated)
  }

  const removeCert = (index: number) => {
    setCertifications(prev => prev.filter((_, i) => i !== index))
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const res = await techniciansApi.updateProfile({ certifications })
      if (res.success) {
        setSuccess('✅ บันทึกใบรับรองเรียบร้อยแล้ว!')
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
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: 48, marginBottom: 8 }}>📜</div><div>กำลังโหลด...</div></div>
    </div>
  )

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 100 }}>
      {/* HEADER */}
      <div style={{ background: 'var(--primary)', padding: '16px 20px', borderRadius: '0 0 24px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/profile"><div style={{ fontSize: 20 }}>←</div></Link>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#3D2C00' }}>ใบรับรอง</div>
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

        <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 16 }}>
          📜 เพิ่มใบรับรองหรือประกาศนียบัตรของคุณ — ช่วยสร้างความน่าเชื่อถือให้ลูกค้า
        </div>

        <input
          ref={certFileRef}
          type="file"
          accept="image/*,.pdf"
          style={{ display: 'none' }}
          onChange={e => {
            if (uploadingCertIndex !== null) handleCertFileChange(e, uploadingCertIndex)
          }}
        />

        {certifications.map((cert, i) => (
          <div key={i} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 14, marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>🏅 ใบรับรอง #{i + 1}</div>
              <button
                onClick={() => removeCert(i)}
                style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 16, cursor: 'pointer', padding: '4px 8px' }}
              >✕ ลบ</button>
            </div>

            <div style={{ marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-light)' }}>ชื่อใบรับรอง</div>
              <input
                className="form-input"
                placeholder="เช่น ประกาศนียบัตรช่างยนต์, วุฒิบัตรไฟฟ้า"
                value={cert.name}
                onChange={e => updateCert(i, 'name', e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 2 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-light)' }}>สถาบัน</div>
                <input
                  className="form-input"
                  placeholder="เช่น กรมพัฒนาฝีมือแรงงาน"
                  value={cert.issuer}
                  onChange={e => updateCert(i, 'issuer', e.target.value)}
                />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text-light)' }}>ปี</div>
                <input
                  className="form-input"
                  type="number"
                  placeholder="2568"
                  value={cert.year || ''}
                  onChange={e => updateCert(i, 'year', parseInt(e.target.value) || undefined)}
                />
              </div>
            </div>

            {/* FILE UPLOAD */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={() => { setUploadingCertIndex(i); certFileRef.current?.click() }}
                disabled={uploadingCertIndex === i}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: '1px dashed var(--primary)',
                  background: cert.fileUrl ? 'var(--primary-light)' : 'transparent',
                  color: 'var(--primary)',
                  fontSize: 12,
                  cursor: uploadingCertIndex === i ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}>
                {uploadingCertIndex === i ? '⏳ กำลังอัปโหลด...' :
                  cert.fileUrl ? '📎 อัปโหลดแล้ว — กดเปลี่ยนไฟล์' : '📎 แนบไฟล์ (รูป / PDF)'}
              </button>
              {cert.fileUrl && (
                <a href={cert.fileUrl} target="_blank" rel="noreferrer"
                  style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                  👁 ดูไฟล์
                </a>
              )}
            </div>
          </div>
        ))}

        <button
          onClick={() => setCertifications(prev => [...prev, { name: '', issuer: '', year: undefined, fileUrl: undefined }])}
          style={{ background: 'var(--primary-light)', border: '1px dashed var(--primary)', borderRadius: 10, padding: '10px 14px', fontSize: 13, color: 'var(--primary)', cursor: 'pointer', width: '100%', marginBottom: 20 }}>
          ➕ เพิ่มใบรับรอง
        </button>

        {certifications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-light)', fontSize: 14 }}>
            ยังไม่มีใบรับรอง — กด + เพิ่มใบรับรองแรกของคุณ
          </div>
        )}

        <button
          className="btn-primary"
          onClick={handleSave}
          disabled={saving}
          style={{ width: '100%' }}
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
