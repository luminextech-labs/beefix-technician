'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { servicesApi, techniciansApi, uploadApi } from '@/lib/api'

interface Service {
  id: string
  description: string | null
  basePrice: number | null
  images: string[]
  subCategory: {
    name: string
    category: { name: string }
  }
}

export default function MyServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [viewingImages, setViewingImages] = useState<string[] | null>(null)

  const [addForm, setAddForm] = useState({
    subCategoryId: '',
    description: '',
    basePrice: '',
    images: [] as string[],
  })
  const [uploadingSlots, setUploadingSlots] = useState<boolean[]>([false, false, false, false])
  const imageInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

  useEffect(() => {
    const token = localStorage.getItem('tech_token')
    if (!token) return

    servicesApi.getAll().then(svcRes => {
      if (svcRes.success) setServices(svcRes.services)
    }).finally(() => setLoading(false))
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    const slots = [...uploadingSlots]
    slots[slotIndex] = true
    setUploadingSlots(slots)
    try {
      const res = await uploadApi.image(file, 'services')
      if (res.success && res.url) {
        const updated = [...addForm.images]
        updated[slotIndex] = res.url
        setAddForm(f => ({ ...f, images: updated }))
      }
    } finally {
      const slots = [...uploadingSlots]
      slots[slotIndex] = false
      setUploadingSlots(slots)
      if (imageInputRefs[slotIndex].current) imageInputRefs[slotIndex].current.value = ''
    }
  }

  const handleAdd = async () => {
    if (!addForm.subCategoryId) { setError('กรุณาเลือกบริการ'); return }
    setAdding(true)
    setError('')
    try {
      const res = await servicesApi.add({
        subCategoryId: addForm.subCategoryId,
        description: addForm.description || undefined,
        basePrice: addForm.basePrice ? parseFloat(addForm.basePrice) : undefined,
        images: addForm.images.filter(Boolean),
      })
      if (res.success) {
        setServices(s => [...s, res.service])
        setShowAdd(false)
        setAddForm({ subCategoryId: '', description: '', basePrice: '', images: [] })
      } else {
        setError(res.message || 'เพิ่มไม่สำเร็จ')
      }
    } catch (e: any) {
      setError(e.message)
    } finally {
      setAdding(false)
    }
  }

  const handleDelete = async (serviceId: string) => {
    setDeleting(serviceId)
    try {
      const res = await servicesApi.remove(serviceId)
      if (res.success) setServices(s => s.filter(svc => svc.id !== serviceId))
    } finally {
      setDeleting(null)
    }
  }

  const categories = [...new Map(services.map(s => [s.subCategory.category.name, s.subCategory.category.name])).keys()]

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 100 }}>
      {/* IMAGE VIEWER MODAL */}
      {viewingImages && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', flexDirection: 'column' }}
          onClick={() => setViewingImages(null)}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', padding: 16 }}>
            <button
              onClick={() => setViewingImages(null)}
              style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', fontSize: 20, width: 40, height: 40, borderRadius: '50%', cursor: 'pointer' }}>
              ✕
            </button>
          </div>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 16px 16px', overflow: 'auto' }}>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center', maxWidth: 600 }}>
              {viewingImages.map((url, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img key={i} src={url} alt={`รูปที่ ${i + 1}`}
                  style={{ width: '100%', maxWidth: 280, maxHeight: 400, objectFit: 'cover', borderRadius: 12 }}
                  onClick={e => e.stopPropagation()} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HEADER */}
      <div style={{ background: 'var(--primary)', padding: '16px 20px', borderRadius: '0 0 24px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/profile"><div style={{ fontSize: 20 }}>←</div></Link>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#3D2C00' }}>บริการของฉัน</div>
      </div>

      <div style={{ padding: 16 }}>
        {error && (
          <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>กำลังโหลด...</div>
        ) : services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🔧</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>ยังไม่มีบริการ</div>
            <div style={{ fontSize: 13, color: 'var(--text-light)' }}>เพิ่มบริการที่คุณให้ได้</div>
          </div>
        ) : categories.map(cat => (
          <div key={cat} style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-light)', marginBottom: 8, paddingLeft: 4 }}>{cat}</div>
            {services.filter(s => s.subCategory.category.name === cat).map(svc => (
              <div key={svc.id} className="card-shadow" style={{ padding: 14, borderRadius: 12, marginBottom: 10 }}>
                {/* IMAGES */}
                {svc.images && svc.images.length > 0 && (
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', paddingBottom: 4 }}>
                    {svc.images.map((img, i) => (
                      <div key={i} onClick={() => setViewingImages(svc.images)}
                        style={{ width: 72, height: 72, borderRadius: 8, overflow: 'hidden', flexShrink: 0, cursor: 'pointer', position: 'relative' }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={img} alt={`รูปที่ ${i + 1}`}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    ))}
                    {svc.images.length < 4 && Array.from({ length: 4 - svc.images.length }).map((_, i) => (
                      <div key={`empty-${i}`}
                        style={{ width: 72, height: 72, borderRadius: 8, background: 'var(--bg)', border: '1px dashed var(--border)', flexShrink: 0 }} />
                    ))}
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{svc.subCategory.name}</div>
                    {svc.description && <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>{svc.description}</div>}
                    {svc.basePrice != null && (
                      <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', marginTop: 4 }}>
                        ฿{svc.basePrice.toLocaleString()}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(svc.id)}
                    disabled={deleting === svc.id}
                    style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 12, cursor: 'pointer', padding: '4px 8px' }}>
                    {deleting === svc.id ? '...' : 'ลบ'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}

        <button className="btn-primary" onClick={() => setShowAdd(true)} style={{ width: '100%', marginTop: 8 }}>
          ➕ เพิ่มบริการ
        </button>
      </div>

      {/* ADD SERVICE BOTTOM SHEET */}
      {showAdd && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--card)',
          borderRadius: '20px 20px 0 0', padding: 20, zIndex: 1000,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)', maxHeight: '90vh', overflowY: 'auto'
        }}>
          <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 16px' }} />
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>เพิ่มบริการ</div>

          {/* IMAGE UPLOADS */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>📷 รูปภาพบริการ (สูงสุด 4 รูป)</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ position: 'relative' }}>
                  {uploadingSlots[i] ? (
                    <div style={{ width: 72, height: 72, borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      ⏳
                    </div>
                  ) : addForm.images[i] ? (
                    <div style={{ width: 72, height: 72, borderRadius: 10, overflow: 'hidden', position: 'relative', border: '2px solid var(--primary)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={addForm.images[i]} alt={`รูปที่ ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button
                        onClick={() => {
                          const updated = [...addForm.images]
                          updated[i] = ''
                          setAddForm(f => ({ ...f, images: updated }))
                        }}
                        style={{ position: 'absolute', top: -6, right: -6, width: 20, height: 20, borderRadius: '50%', background: 'var(--red)', border: 'none', color: '#fff', fontSize: 12, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => imageInputRefs[i].current?.click()}
                      style={{ width: 72, height: 72, borderRadius: 10, background: 'var(--bg)', border: '1px dashed var(--border)', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                      <span style={{ fontSize: 20 }}>➕</span>
                      <span style={{ fontSize: 9, color: 'var(--text-light)' }}>รูป {i + 1}</span>
                    </button>
                  )}
                  <input
                    key={`input-${i}`}
                    ref={imageInputRefs[i]}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={e => handleImageUpload(e, i)}
                  />
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>ประเภทบริการ *</div>
            <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 8 }}>ติดต่อ admin เพื่อเพิ่มประเภทบริการใหม่</div>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>รายละเอียดเพิ่มเติม</div>
            <textarea className="form-input" rows={3} placeholder="เชี่ยวชาญซ่อมแอร์ cassette..."
              value={addForm.description}
              onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
              style={{ resize: 'vertical', width: '100%' }} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>ราคาเริ่มต้น (บาท)</div>
            <input className="form-input" type="number" min="0" placeholder="500"
              value={addForm.basePrice}
              onChange={e => setAddForm(f => ({ ...f, basePrice: e.target.value }))}
              style={{ width: '100%' }} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setShowAdd(false); setAddForm({ subCategoryId: '', description: '', basePrice: '', images: [] }) }} className="btn-secondary" style={{ flex: 1 }}>ยกเลิก</button>
            <button onClick={handleAdd} disabled={adding} className="btn-primary" style={{ flex: 1 }}>
              {adding ? 'กำลัง...' : 'เพิ่ม'}
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
