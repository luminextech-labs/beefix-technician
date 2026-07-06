'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { techniciansApi } from '@/lib/api'
import BackButton from '@/components/BackButton'

// Direct API helpers for custom categories
const customCatApi = {
  list: () => fetch('/api/technicians/me/custom-categories').then(r => r.json()),
  create: (data: { name: string; icon: string }) =>
    fetch('/api/technicians/me/custom-categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: `Bearer ${localStorage.getItem('tech_token')}` },
      body: JSON.stringify(data),
    }).then(r => r.json()),
  remove: (id: string) =>
    fetch(`/api/technicians/me/custom-categories/${id}`, {
      method: 'DELETE',
      headers: { authorization: `Bearer ${localStorage.getItem('tech_token')}` },
    }).then(r => r.json()),
}

interface Category {
  id: string
  name: string
  icon: string
}

const DEFAULT_ICONS = ['🔧', '⚡', '🚗', '🏠', '💻', '🎨', '🔌', '🛠️', '💡', '🚿', '🏗️', '🌿']

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ name: '', icon: '🔧' })

  useEffect(() => {
    customCatApi.list().then(res => {
      if (res.success) setCategories(res.categories || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    if (!form.name.trim()) { setError('กรุณากรอกชื่อหมวดหมู่'); return }
    setSaving(true); setError('')
    try {
      const res = await customCatApi.create({ name: form.name.trim(), icon: form.icon })
      if (res.success) {
        setCategories(prev => [...prev, res.category])
        setShowAdd(false)
        setForm({ name: '', icon: '🔧' })
      } else {
        setError(res.message || 'บันทึกไม่สำเร็จ')
      }
    } catch (e: any) { setError(e.message) }
    finally { setSaving(false) }
  }

  const handleDelete = async (id: string) => {
    setDeleting(id)
    try {
      await customCatApi.remove(id)
      setCategories(prev => prev.filter(c => c.id !== id))
    } finally { setDeleting(null) }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 100 }}>
      {/* HEADER */}
      <div style={{ background: 'var(--primary)', padding: '16px 20px', borderRadius: '0 0 24px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <BackButton href="/profile" />
        <div style={{ fontSize: 18, fontWeight: 700, color: '#3D2C00' }}>หมวดหมู่ของฉัน</div>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 12, lineHeight: 1.5 }}>
          สร้างหมวดหมู่เองเพื่อจัดระเบียบบริการและผลงานที่แสดงในโปรไฟล์สาธารณะ
        </div>

        {error && <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>{error}</div>}

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>กำลังโหลด...</div>
        ) : categories.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>📂</div>
            <div style={{ fontWeight: 600, marginBottom: 4 }}>ยังไม่มีหมวดหมู่</div>
            <div style={{ fontSize: 13, color: 'var(--text-light)' }}>สร้างหมวดหมู่เพื่อจัดระเบียบโปรไฟล์</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {categories.map(cat => (
              <div key={cat.id} className="card-shadow" style={{ padding: '12px 14px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 24 }}>{cat.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{cat.name}</div>
                </div>
                <button onClick={() => handleDelete(cat.id)} disabled={deleting === cat.id}
                  style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 12, cursor: 'pointer', padding: '4px 8px' }}>
                  {deleting === cat.id ? '...' : 'ลบ'}
                </button>
              </div>
            ))}
          </div>
        )}

        <button className="btn-primary" onClick={() => setShowAdd(true)} style={{ width: '100%', marginTop: 12 }}>
          ➕ สร้างหมวดหมู่ใหม่
        </button>
      </div>

      {/* ADD BOTTOM SHEET */}
      {showAdd && (
        <div style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, background: 'var(--card)',
          borderRadius: '20px 20px 0 0', padding: 20, zIndex: 1000,
          boxShadow: '0 -4px 20px rgba(0,0,0,0.15)',
        }}>
          <div style={{ width: 40, height: 4, background: 'var(--border)', borderRadius: 2, margin: '0 auto 16px' }} />
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>สร้างหมวดหมู่ใหม่</div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>ไอคอน</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {DEFAULT_ICONS.map(icon => (
                <button key={icon} onClick={() => setForm(f => ({ ...f, icon }))}
                  style={{
                    width: 44, height: 44, borderRadius: 10,
                    border: form.icon === icon ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                    background: form.icon === icon ? 'var(--primary-light)' : 'var(--bg)',
                    fontSize: 22, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6 }}>ชื่อหมวดหมู่ *</div>
            <input className="form-input" placeholder="เช่น บริการล้างแอร์, ผลงานติดตั้ง"
              value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              style={{ width: '100%' }} />
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={() => { setShowAdd(false); setForm({ name: '', icon: '🔧' }) }} className="btn-secondary" style={{ flex: 1 }}>ยกเลิก</button>
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
