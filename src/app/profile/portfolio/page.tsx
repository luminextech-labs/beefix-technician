'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { techniciansApi, uploadApi } from '@/lib/api'

interface PortfolioItem {
  id: string
  title: string
  description: string | null
  images: string[]
  createdAt: string
}

export default function PortfolioPage() {
  const [items, setItems] = useState<PortfolioItem[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [viewingImages, setViewingImages] = useState<string[] | null>(null)
  const [error, setError] = useState('')

  const [form, setForm] = useState({ title: '', description: '', images: [] as string[] })
  const [uploadingSlots, setUploadingSlots] = useState<boolean[]>([false, false, false, false])
  const imageInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

  useEffect(() => {
    techniciansApi.me().then(res => {
      if (res.success) setItems(res.technician?.portfolioItems || [])
    }).finally(() => setLoading(false))
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    const slots = [...uploadingSlots]; slots[slotIndex] = true; setUploadingSlots(slots)
    try {
      const res = await uploadApi.image(file, 'portfolio')
      if (res.success && res.url) {
        const updated = [...form.images]; updated[slotIndex] = res.url; setForm(f => ({ ...f, images: updated }))
      }
    } finally {
      const slots = [...uploadingSlots]; slots[slotIndex] = false; setUploadingSlots(slots)
      if (imageInputRefs[slotIndex].current) imageInputRefs[slotIndex].current.value = ''
    }
  }

  const handleSave = async () => {
    if (!form.title.trim()) { setError('กรุณากรอกชื่อผลงาน'); return }
    setSaving(true); setError('')
    try {
      const res = await techniciansApi.updateProfile({
        portfolioItems: [...items, {
          id: Date.now().toString(),
          title: form.title,
          description: form.description || null,
          images: form.images.filter(Boolean),
          createdAt: new Date().toISOString(),
        }]
      })
      if (res.success) {
        setItems(res.technician?.portfolioItems || [])
        setShowAdd(false)
        setForm({ title: '', description: '', images: [] })
      } else {
        setError(res.message || 'บันทึกไม่สำเร็จ')
      }
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (itemId: string) => {
    setDeleting(itemId)
    try {
      const res = await techniciansApi.updateProfile({
        portfolioItems: items.filter(i => i.id !== itemId)
      })
      if (res.success) setItems(res.technician?.portfolioItems || [])
    } finally { setDeleting(null) }
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
        <Link href="/profile"><div style={{ fontSize: 20 }}>←</div></Link>
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
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {items.map(item => (
              <div key={item.id} className="card-shadow" style={{ borderRadius: 12, overflow: 'hidden' }}>
                {item.images.length > 0 ? (
                  <div
                    onClick={() => setViewingImages(item.images)}
                    style={{ height: 120, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={item.images[0]} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    {item.images.length > 1 && (
                      <div style={{ position: 'absolute', bottom: 6, right: 6, background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: 10, borderRadius: 6, padding: '2px 6px' }}>
                        +{item.images.length - 1}
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ height: 120, background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32 }}>🖼️</div>
                )}
                <div style={{ padding: '10px 10px 6px' }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{item.title}</div>
                  {item.description && <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 2 }}>{item.description}</div>}
                </div>
                <div style={{ padding: '0 10px 10px', display: 'flex', justifyContent: 'flex-end' }}>
                  <button onClick={() => handleDelete(item.id)} disabled={deleting === item.id}
                    style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 11, cursor: 'pointer' }}>
                    {deleting === item.id ? '...' : 'ลบ'}
                  </button>
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
                      <button onClick={() => { const updated = [...form.images]; updated[i] = ''; setForm(f => ({ ...f, images: updated })) }}
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

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>ชื่อผลงาน *</div>
            <input className="form-input" placeholder="เช่น ติดตั้งแอร์บ้านคุณเบียร์" value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))} style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>รายละเอียด</div>
            <textarea className="form-input" rows={2} placeholder="อธิบายผลงานนี้..."
              value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              style={{ resize: 'vertical', width: '100%' }} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setShowAdd(false); setForm({ title: '', description: '', images: [] }) }} className="btn-secondary" style={{ flex: 1 }}>ยกเลิก</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary" style={{ flex: 1 }}>
              {saving ? 'กำลัง...' : 'บันทึก'}
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
