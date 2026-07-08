'use client'
import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { servicesApi, techniciansApi, uploadApi } from '@/lib/api'
import BackButton from '@/components/BackButton'

interface Service {
  id: string
  description: string | null
  basePrice: number | null
  images: string[]
  subCategory?: { id: string; name: string; category: { id: string; name: string } }
}

interface SystemCategory {
  id: string
  name: string
  subCategories: { id: string; name: string; categoryId: string }[]
}

const FALLBACK_CATEGORIES: SystemCategory[] = [
  { id: 'f02172f7-38ac-462e-9320-ab9e48745ccb', name: 'ไฟฟ้า', subCategories: [
    { id: 'be87c556-c2b8-474a-9f06-5111b9a29315', name: 'ติดตั้งไฟฟ้า', categoryId: 'f02172f7-38ac-462e-9320-ab9e48745ccb' },
    { id: '89a7d8fc-fd20-4867-8215-e95fb5cdc67f', name: 'ซ่อมไฟฟ้า', categoryId: 'f02172f7-38ac-462e-9320-ab9e48745ccb' },
    { id: '481cf7e7-8d87-4096-920f-b8ffd5fa888a', name: 'เดินสายไฟ', categoryId: 'f02172f7-38ac-462e-9320-ab9e48745ccb' },
    { id: '03cc2398-93fe-4dd5-a541-faf1e54af222', name: 'ติดเบรกเกอร์', categoryId: 'f02172f7-38ac-462e-9320-ab9e48745ccb' },
    { id: '6207fa51-0980-4574-bbab-406513dff96d', name: 'อัปเกรดมิเตอร์', categoryId: 'f02172f7-38ac-462e-9320-ab9e48745ccb' },
  ]},
  { id: 'ab6c6cfe-bc83-409e-8f82-b8b3eb2895a5', name: 'ก่อสร้าง', subCategories: [
    { id: 'f3d20ffe-25c0-4eb5-bc5a-1f077b437f61', name: 'สร้างบ้าน', categoryId: 'ab6c6cfe-bc83-409e-8f82-b8b3eb2895a5' },
    { id: '033a33fd-fb34-4bb8-b15f-04e8dfee53bb', name: 'ต่อเติม', categoryId: 'ab6c6cfe-bc83-409e-8f82-b8b3eb2895a5' },
    { id: 'cf2fe5c7-99b6-4a0a-854b-e3544a6e7e22', name: 'ฉาบปูน', categoryId: 'ab6c6cfe-bc83-409e-8f82-b8b3eb2895a5' },
    { id: 'b86119ee-37fe-4639-9d60-4a0a-854b-e3544a6e7e22', name: 'ทาสี', categoryId: 'ab6c6cfe-bc83-409e-8f82-b8b3eb2895a5' },
    { id: '4b55c641-9374-4fef-91cd-04d10038ac9b', name: 'ปูกระเบื้อง', categoryId: 'ab6c6cfe-bc83-409e-8f82-b8b3eb2895a5' },
    { id: 'efc21e9c-733a-4b74-9906-6bdef4770de8', name: 'ทำฝ้าเพดาน', categoryId: 'ab6c6cfe-bc83-409e-8f82-b8b3eb2895a5' },
  ]},
  { id: '18d668b9-bc30-4651-bf13-c7877c500845', name: 'ยานยนต์', subCategories: [
    { id: '2188dc77-dbd2-479a-9ba8-e0ae150b4bcc', name: 'เปลี่ยนถ่ายน้ำมัน', categoryId: '18d668b9-bc30-4651-bf13-c7877c500845' },
    { id: 'ddfa2198-9e83-4c03-b34e-6dfa9adff65c', name: 'เปลี่ยนยาง', categoryId: '18d668b9-bc30-4651-bf13-c7877c500845' },
    { id: '2f503b55-7ad2-423d-98d8-bbd454569467', name: 'เบรก', categoryId: '18d668b9-bc30-4651-bf13-c7877c500845' },
    { id: '1c00fcd2-2e5e-434d-b47a-5acca384df66', name: 'ไฟ', categoryId: '18d668b9-bc30-4651-bf13-c7877c500845' },
    { id: '4e092cce-5f1e-4f7c-9b1a-371fc330d676', name: 'แอร์รถยนต์', categoryId: '18d668b9-bc30-4651-bf13-c7877c500845' },
  ]},
  { id: '8912298e-3dc0-464b-92d3-3a426c51a67d', name: 'ประปา', subCategories: [
    { id: 'b83c20ee-3fb8-4d9a-b9b7-76b131b977a8', name: 'ซ่อมประปา', categoryId: '8912298e-3dc0-464b-92d3-3a426c51a67d' },
    { id: '884562d0-7d76-4745-b01d-1849bb88e31b', name: 'ติดตั้งสุขภัณฑ์', categoryId: '8912298e-3dc0-464b-92d3-3a426c51a67d' },
    { id: '867dcac1-c724-47d5-a408-6c287f564751', name: 'เปลี่ยนก็อก', categoryId: '8912298e-3dc0-464b-92d3-3a426c51a67d' },
    { id: '62fbe888-f6c4-465a-b881-5f18127ce8c2', name: 'ดักน้ำทิ้ง', categoryId: '8912298e-3dc0-464b-92d3-3a426c51a67d' },
    { id: 'd116a9ab-d1c6-4bdd-a473-464a0a70a8ce', name: 'ติดตั้งปั๊มน้ำ', categoryId: '8912298e-3dc0-464b-92d3-3a426c51a67d' },
  ]},
  { id: 'a52453b1-8f77-49fd-a369-5bfcababccee', name: 'เฟอร์นิเจอร์', subCategories: [
    { id: 'c522869b-a542-47fa-962b-7f56d57211c0', name: 'ประกอบเฟอร์นิเจอร์', categoryId: 'a52453b1-8f77-49fd-a369-5bfcababccee' },
    { id: '8e7c93c7-3fb9-49d0-a8a6-3298f9208472', name: 'ซ่อมตู้', categoryId: 'a52453b1-8f77-49fd-a369-5bfcababccee' },
    { id: '9fcb9d5c-b77f-47db-aebc-6e2982b39266', name: 'เคลือบไม้', categoryId: 'a52453b1-8f77-49fd-a369-5bfcababccee' },
  ]},
  { id: 'cb99b7b8-873c-42f6-9b1e-78f0f094f9b5', name: 'เครื่องใช้ไฟฟ้า', subCategories: [
    { id: '15d04be7-7088-4a0e-af6b-ffca0a1be767', name: 'ซ่อมเครื่องปรับอากาศ', categoryId: 'cb99b7b8-873c-42f6-9b1e-78f0f094f9b5' },
    { id: 'b6587ef7-dbb0-46da-9f14-af787dcab7c6', name: 'ซ่อมตู้เย็น', categoryId: 'cb99b7b8-873c-42f6-9b1e-78f0f094f9b5' },
    { id: '0fb94082-38d0-4e96-a8bf-6464ec783c98', name: 'ซ่อมเครื่องซักผ้า', categoryId: 'cb99b7b8-873c-42f6-9b1e-78f0f094f9b5' },
    { id: '266c0a55-1b43-4b7f-ae8b-77c43772daa0', name: 'ซ่อมทีวี', categoryId: 'cb99b7b8-873c-42f6-9b1e-78f0f094f9b5' },
  ]},
  { id: '377d485c-a3a4-4ef3-af5d-ccf020ae932c', name: 'สวน/ภูมิทัศน์', subCategories: [
    { id: '969623b3-3501-46d9-8608-01287fafcee7', name: 'จัดสวน', categoryId: '377d485c-a3a4-4ef3-af5d-ccf020ae932c' },
    { id: '6ae902ca-de9a-44d7-9f20-beda7c8c6fb3', name: 'ดูแลต้นไม้', categoryId: '377d485c-a3a4-4ef3-af5d-ccf020ae932c' },
    { id: 'c85402c5-333c-47ea-8111-fa48eb23101e', name: 'ตัดหญ้า', categoryId: '377d485c-a3a4-4ef3-af5d-ccf020ae932c' },
    { id: '3f41bb58-f8bb-4fcf-81db-c43855706362', name: 'ทำรั้ว', categoryId: '377d485c-a3a4-4ef3-af5d-ccf020ae932c' },
  ]},
]

export default function MyServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState('')
  const [deleting, setDeleting] = useState<string | null>(null)
  const [viewingImages, setViewingImages] = useState<string[] | null>(null)
  const [systemCategories, setSystemCategories] = useState<SystemCategory[]>(FALLBACK_CATEGORIES)

  const [addForm, setAddForm] = useState({
    systemCatId: '',
    systemSubCategoryId: '',
    description: '',
    basePrice: '',
    images: [] as string[],
  })
  const [uploadingSlots, setUploadingSlots] = useState<boolean[]>([false, false, false, false])
  const imageInputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

  useEffect(() => {
    const token = localStorage.getItem('tech_token')
    if (!token) return

    Promise.all([
      servicesApi.getAll().catch(() => ({ success: false, services: [] })),
      fetch('https://beefix-web.vercel.app/api/public/categories').then(r => r.json()).catch(() => ({ success: false, categories: [] })),
    ]).then(([svcRes, catRes]) => {
      if (svcRes.success) setServices(svcRes.services || [])
      if (catRes.success && catRes.categories?.length > 0) {
        setSystemCategories(catRes.categories)
      }
    }).finally(() => setLoading(false))
  }, [])

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, slotIndex: number) => {
    const file = e.target.files?.[0]
    if (!file) return
    const slots = [...uploadingSlots]; slots[slotIndex] = true; setUploadingSlots(slots)
    try {
      const res = await uploadApi.image(file, 'services')
      if (res.success && res.url) {
        const updated = [...addForm.images]; updated[slotIndex] = res.url; setAddForm(f => ({ ...f, images: updated }))
      }
    } finally {
      const slots = [...uploadingSlots]; slots[slotIndex] = false; setUploadingSlots(slots)
      if (imageInputRefs[slotIndex].current) imageInputRefs[slotIndex].current.value = ''
    }
  }

  const selectedCat = systemCategories.find(c => c.id === addForm.systemCatId)

  const handleAdd = async () => {
    if (!addForm.systemSubCategoryId) {
      setError('กรุณาเลือกหมวดหมู่และบริการ'); return
    }
    setAdding(true); setError('')
    try {
      const payload: any = {
        subCategoryId: addForm.systemSubCategoryId,
        description: addForm.description || undefined,
        basePrice: addForm.basePrice ? parseFloat(addForm.basePrice) : undefined,
        images: addForm.images.filter(Boolean),
      }
      const res = await servicesApi.add(payload)
      if (res.success) {
        setServices(s => [...s, res.service])
        setShowAdd(false)
        setAddForm({ systemCatId: '', systemSubCategoryId: '', description: '', basePrice: '', images: [] })
      } else {
        setError(res.message || 'เพิ่มไม่สำเร็จ')
      }
    } catch (e: any) { setError(e.message) }
    finally { setAdding(false) }
  }

  const handleDelete = async (serviceId: string) => {
    setDeleting(serviceId)
    try {
      const res = await servicesApi.remove(serviceId)
      if (res.success) setServices(s => s.filter(svc => svc.id !== serviceId))
    } finally { setDeleting(null) }
  }

  // Group services by category name
  const grouped = [...new Map(
    services
      .filter(s => s.subCategory?.category?.name)
      .map(s => [s.subCategory!.category!.name, s.subCategory!.category!.name])
  ).keys()].map(catName => ({
    name: catName,
    services: services.filter(s => s.subCategory?.category?.name === catName),
  }))

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 100 }}>
      {/* IMAGE VIEWER */}
      {viewingImages && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 2000, display: 'flex', flexDirection: 'column' }} onClick={() => setViewingImages(null)}>
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
        <div style={{ fontSize: 18, fontWeight: 700, color: '#3D2C00' }}>บริการของฉัน</div>
      </div>

      <div style={{ padding: 16 }}>
        {error && <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>กำลังโหลด...</div>
        ) : services.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🔧</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>ยังไม่มีบริการ</div>
            <div style={{ fontSize: 13, color: 'var(--text-light)' }}>เพิ่มบริการที่คุณให้ได้</div>
          </div>
        ) : (
          grouped.map(group => (
            <div key={group.name} style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-light)', marginBottom: 8, paddingLeft: 4 }}>{group.name}</div>
              {group.services.map(svc => (
                <div key={svc.id} className="card-shadow" style={{ padding: 14, borderRadius: 12, marginBottom: 8 }}>
                  {svc.images?.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, marginBottom: 10, overflowX: 'auto', paddingBottom: 4 }}>
                      {svc.images.map((img, i) => (
                        <div key={i} onClick={() => setViewingImages(svc.images!)} style={{ width: 64, height: 64, borderRadius: 8, overflow: 'hidden', flexShrink: 0, cursor: 'pointer' }}>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                      ))}
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>{svc.subCategory?.name}</div>
                      {svc.description && <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>{svc.description}</div>}
                      {svc.basePrice != null && <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', marginTop: 4 }}>฿{svc.basePrice.toLocaleString()}</div>}
                    </div>
                    <button onClick={() => handleDelete(svc.id)} disabled={deleting === svc.id} style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 12, cursor: 'pointer', padding: '4px 8px' }}>
                      {deleting === svc.id ? '...' : 'ลบ'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}

        <button className="btn-primary" onClick={() => setShowAdd(true)} style={{ width: '100%', marginTop: 8 }}>
          ➕ เพิ่มบริการ
        </button>
      </div>

      {/* BACKDROP */}
      {showAdd && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 999 }}
          onClick={() => { setShowAdd(false); setAddForm({ systemCatId: '', systemSubCategoryId: '', description: '', basePrice: '', images: [] }) }}
        />
      )}

      {/* ADD SERVICE BOTTOM SHEET */}
      {showAdd && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0,
          background: 'white',
          borderRadius: '20px 20px 0 0', padding: 20,
          zIndex: 1000,
          boxShadow: '0 -4px 30px rgba(0,0,0,0.2)',
          maxHeight: '90vh', overflowY: 'auto',
        }}>
          {/* Handle */}
          <div style={{ width: 40, height: 4, background: '#E0D5C0', borderRadius: 2, margin: '0 auto 16px' }} />

          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>เพิ่มบริการ</div>

          {/* IMAGE UPLOADS */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>📷 รูปภาพบริการ (สูงสุด 4 รูป)</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ position: 'relative' }}>
                  {uploadingSlots[i] ? (
                    <div style={{ width: 72, height: 72, borderRadius: 10, background: 'var(--bg)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⏳</div>
                  ) : addForm.images[i] ? (
                    <div style={{ width: 72, height: 72, borderRadius: 10, overflow: 'hidden', position: 'relative', border: '2px solid var(--primary)' }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={addForm.images[i]} alt={`รูปที่ ${i + 1}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <button onClick={() => { const updated = [...addForm.images]; updated[i] = ''; setAddForm(f => ({ ...f, images: updated })) }}
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

          {/* Step 1: Select Category dropdown */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-light)' }}>เลือกหมวดหมู่/อาชีพ</div>
            <select
              value={addForm.systemCatId}
              onChange={e => setAddForm(f => ({ ...f, systemCatId: e.target.value, systemSubCategoryId: '' }))}
              style={{
                width: '100%', padding: '10px 12px',
                border: '1.5px solid var(--border)', borderRadius: 10,
                fontSize: 13, fontFamily: 'Prompt, sans-serif',
                background: 'white', color: 'var(--text)',
                outline: 'none', cursor: 'pointer',
              }}
            >
              <option value="">— เลือกหมวดหมู่ —</option>
              {systemCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Step 2: Select Sub-category dropdown */}
          {selectedCat && (
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text-light)' }}>เลือกบริการ</div>
              <select
                value={addForm.systemSubCategoryId}
                onChange={e => setAddForm(f => ({ ...f, systemSubCategoryId: e.target.value }))}
                style={{
                  width: '100%', padding: '10px 12px',
                  border: '1.5px solid var(--border)', borderRadius: 10,
                  fontSize: 13, fontFamily: 'Prompt, sans-serif',
                  background: 'white', color: 'var(--text)',
                  outline: 'none', cursor: 'pointer',
                }}
              >
                <option value="">— เลือกบริการ —</option>
                {selectedCat.subCategories.map(sub => (
                  <option key={sub.id} value={sub.id}>{sub.name}</option>
                ))}
              </select>
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>รายละเอียดเพิ่มเติม</div>
            <textarea className="form-input" rows={2} placeholder="เช่น เชี่ยวชาญซ่อมแอร์ cassette..."
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
            <button onClick={() => { setShowAdd(false); setAddForm({ systemCatId: '', systemSubCategoryId: '', description: '', basePrice: '', images: [] }) }}
              style={{ flex: 1, padding: '12px', borderRadius: 10, border: '1.5px solid var(--border)', background: 'white', color: 'var(--text)', fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'Prompt, sans-serif' }}>
              ยกเลิก
            </button>
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
