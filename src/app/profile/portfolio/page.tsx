'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { techniciansApi, portfolioApi, uploadApi } from '@/lib/api'
import BackButton from '@/components/BackButton'

interface PortfolioItem {
  id: string
  images: string[]
  caption: string | null
  createdAt: string
}

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [techId, setTechId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [viewingImages, setViewingImages] = useState<string[] | null>(null)
  const [error, setError] = useState('')

  const [form, setForm] = useState({ caption: '', images: [] as string[] })
  const [uploadingSlots, setUploadingSlots] = useState<boolean[]>([false, false, false, false])
  const imageInputRefs = [
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
    useRef<HTMLInputElement>(null),
  ]

  useEffect(() => {
    techniciansApi.me().then(async res => {
      if (res.success && res.technician) {
        setTechId(res.technician.id)
        // Load portfolio items
        const portfolioRes = await portfolioApi.getByTechnician(res.technician.id)
        if (portfolioRes.success) setItems(portfolioRes.items || [])
      }
    }).finally(() => setLoading(false))
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingSlots(prev => { const n = [...prev]; n[slotIndex] = true; return n })
    try {
      const res = await uploadApi.image(file, 'portfolio')
      if (res.success && res.url) {
        setForm(f => {
          const newImages = [...f.images]
          // Ensure array has enough slots
          while (newImages.length <= slotIndex) newImages.push('')
          newImages[slotIndex] = res.url
          return { ...f, images: newImages }
        })
      }
    } finally {
      setUploadingSlots(prev => { const n = [...prev]; n[slotIndex] = false; return n })
      if (imageInputRefs[slotIndex].current) imageInputRefs[slotIndex].current.value = ''
    }
  }

  const handleSave = async () => {
    const images = form.images.filter(Boolean)
    if (images.length === 0) { setError('กรุณาอัปรูปอย่างน้อย 1 รูป'); return }
    setSaving(true); setError('')
    try {
      const res = await portfolioApi.create({ images, caption: form.caption || undefined })
      if (res.success) {
        setItems(prev => [res.item, ...prev])
        setShowAdd(false)
        setForm({ caption: '', images: [] })
      } else {
        setError(res.message || 'บันทึกไม่สำเร็จ')
      }
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (itemId: string) => {
    setDeleting(itemId)
    try {
      const res = await portfolioApi.delete(itemId)
      if (res.success) setItems(prev => prev.filter(i => i.id !== itemId))
    } finally { setDeleting(null) }
  }

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr)
    return d.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 100 }}>
      {/* IMAGE VIEWER */}
      {viewingImages && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.9)', zIndex: 2000, display: 'flex', flexDirection: 'column' }} onClick={() => setViewingImages(null)}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 16 }}>
            <button onClick={() => setViewingImages(null)} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 20, width: 40, height: 40, borderRadius: '50%', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px 16px', overflow: 'auto' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 600 }}>
              {viewingImages.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt={`รูปที่ ${i + 1}`} style={{ width: '100%', maxWidth: 280, maxHeight: 400, objectFit: 'cover', borderRadius: 12 }} onClick={e => e.stopPropagation()} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ background: 'var(--primary)', padding: '16px 20px', borderRadius: '0 0 24px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackButton href="/profile" />
        <div style={{ fontSize: 18, fontWeight: 700, color: '#3D2C00' }}>ผลงาน / Portfolio</div>
      </div>

      <div style={{ padding: 16 }}>
        {error && <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>กำลังโหลด...</div>
        ) : items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🖼️</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>ยังไม่มีผลงาน</div>
            <div style={{ fontSize: 13, color: 'var(--text-light)' }}>เพิ่มผลงานที่ผ่านมาเพื่อโชว์ลูกค้า</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {items.map(item => (
              <div key={item.id} className="card-shadow" style={{ borderRadius: 12, overflow: 'hidden' }}>
                {/* IMAGES GRID */}
                {item.images.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: item.images.length === 1 ? '1fr' : '1fr 1fr', gap: 2, cursor: 'pointer' }}
                    onClick={() => setViewingImages(item.images)}>
                    {item.images.slice(0, 4).map((url, i) => (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img key={i} src={url} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
                    ))}
                    {item.images.length > 4 && (
                      <div style={{ width: '100%', aspectRatio: '1/1', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, color: '#fff', fontWeight: 700 }}>
                        +{item.images.length - 4}
                      </div>
                    )}
                  </div>
                )}
                {/* CAPTION & META */}
                <div style={{ padding: '12px 14px 8px' }}>
                  {item.caption && (
                    <div style={{ fontSize: 14, lineHeight: 1.5, marginBottom: 6 }}>{item.caption}</div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 12, color: 'var(--text-light)' }}>{formatDate(item.createdAt)}</div>
                    <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id}
                      style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 12, cursor: 'pointer' }}>
                      {deleting === item.id ? 'กำลังลบ...' : 'ลบ'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <button className="btn-primary" onClick={() => setShowAdd(true)} style={{ width: '100%', marginTop: 12 }}>
          ➕ เพิ่มผลงาน
        </button>
      </div>

      {/* ADD BOTTOM SHEET */}
      {showAdd && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--card)',
          borderRadius: '20px 20px 0 0', padding: 20, zIndex: 1000,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto'
        }}>
          <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 16px' }} />
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>เพิ่มผลงาน</div>

          {/* IMAGE SLOTS */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>📷 รูปผลงาน (สูงสุด 4 รูป)</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ position: 'relative' }}>
                  {uploadingSlots[i] ? (
                    <div style={{ width: 72, height: 72, borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⏳</div>
                  ) : form.images[i] ? (
                    <div style={{ width: 72, height: 72, borderRadius: 10, overflow: 'hidden', position: 'relative', border: '2px solid var(--primary)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={form.images[i]} alt={`รูปที่ ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button onClick={() => setForm(f => ({ ...f, images: f.images.map((img, j) => j === i ? '' : img) }))}
                        style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--red)', border: 'none', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
                    </div>
                  ) : (
                    <button onClick={() => imageInputRefs[i].current?.click()}
                      style={{ width: 72, height: 72, borderRadius: 10, background: 'var(--bg)', border: '1px dashed var(--border)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                      <span style={{ fontSize: 20 }}>➕</span>
                      <span style={{ fontSize: 9, color: 'var(--text-light)' }}>รูป {i + 1}</span>
                    </button>
                  )}
                  <input key={`input-${i}`} ref={imageInputRefs[i]} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleImageUpload(e, i)} />
                </div>
              ))}
            </div>
          </div>

          {/* CAPTION */}
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>📝 คำอธิบาย (caption)</div>
            <textarea className="form-input" rows={3} placeholder="เขียนอธิบายผลงานของคุณ..."
              value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))}
              style={{ resize: 'vertical', width: '100%' }} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setShowAdd(false); setForm({ caption: '', images: [] }) }} className="btn-secondary" style={{ flex: 1 }}>ยกเลิก</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ flex: 1 }}>
              {saving ? 'กำลัง...' : 'โพสต์'}
            </button>
          </div>
        </div>
      )}

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
