'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { techniciansApi, categoriesApi, uploadApi } from '@/lib/api'

export default function TechnicianOnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [avatar, setAvatar] = useState('')
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [techProfile, setTechProfile] = useState({
    bio: '',
    headline: '',
    yearsExperience: '',
    hourlyRate: '',
    latitude: '',
    longitude: '',
    serviceRadius: 0,
  })
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [systemCategories, setSystemCategories] = useState<any[]>([])
  const [selectedSubCats, setSelectedSubCats] = useState<Record<string, string[]>>({})

  useEffect(() => {
    // Load system categories
    fetch('https://beefix-web.vercel.app/api/public/categories')
      .then(r => r.json())
      .then(d => { if (d.categories) setSystemCategories(d.categories) })
      .catch(() => {})

    // Load existing tech profile
    techniciansApi.me().then(res => {
      if (res.success) {
        setTechProfile({
          bio: res.technician?.bio || '',
          headline: res.technician?.headline || '',
          yearsExperience: String(res.technician?.yearsExperience || ''),
          hourlyRate: String(res.technician?.hourlyRate || ''),
          latitude: res.technician?.latitude ? String(res.technician.latitude) : '',
          longitude: res.technician?.longitude ? String(res.technician.longitude) : '',
          serviceRadius: res.technician?.serviceRadius || 0,
        })
        setAvatar(res.technician?.user?.avatarUrl || '')
        setSelectedCategories(res.technician?.categories?.map((c: any) => c.categoryId) || [])
      }
    }).catch(() => {})
  }, [])

  const getLocation = () => {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition(
      pos => {
        setTechProfile(f => ({
          ...f,
          latitude: String(pos.coords.latitude),
          longitude: String(pos.coords.longitude),
        }))
      },
      () => {}
    )
  }

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev =>
      prev.includes(catId) ? prev.filter(c => c !== catId) : [...prev, catId]
    )
  }

  const toggleSubCat = (catId: string, subId: string) => {
    setSelectedSubCats(prev => {
      const existing = prev[catId] || []
      const updated = existing.includes(subId)
        ? existing.filter(s => s !== subId)
        : [...existing, subId]
      return { ...prev, [catId]: updated }
    })
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingAvatar(true)
    try {
      const res = await uploadApi.image(file, 'avatars')
      if (res.success) setAvatar(res.url)
    } catch {}
    finally { setUploadingAvatar(false) }
  }

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    try {
      // 1. Update profile
      const profileRes = await techniciansApi.updateProfile({
        bio: techProfile.bio,
        headline: techProfile.headline,
        yearsExperience: parseInt(techProfile.yearsExperience) || 0,
        hourlyRate: parseFloat(techProfile.hourlyRate) || 0,
        latitude: techProfile.latitude || undefined,
        longitude: techProfile.longitude || undefined,
        serviceRadius: techProfile.serviceRadius || 0,
      })

      if (!profileRes.success) {
        setError(profileRes.message || 'บันทึกโปรไฟล์ไม่สำเร็จ')
        setLoading(false)
        return
      }

      // 2. Link categories
      await fetch('https://beefix-web.vercel.app/api/technicians/me/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          authorization: `Bearer ${localStorage.getItem('tech_token')}`,
        },
        body: JSON.stringify({ categoryIds: selectedCategories }),
      })

      // Done! Go to technician dashboard
      router.push('https://beefix-technician-2ill72kk9-luminexlabs-projects.vercel.app')
    } catch (e: any) {
      setError(e.message || 'เกิดข้อผิดพลาด')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', fontFamily: 'Prompt, sans-serif' }}>

      {/* HEADER */}
      <div style={{ background: 'var(--primary)', padding: '16px 20px 50px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#3D2C00', textAlign: 'center' }}>
          🔧 สมัครเป็นช่าง
        </div>
        <div style={{ fontSize: 12, color: '#3D2C00', opacity: 0.7, textAlign: 'center', marginTop: 4 }}>
          {step === 1 ? 'ขั้นที่ 1: ข้อมูลโปรไฟล์' : 'ขั้นที่ 2: เลือกประเภทบริการ'}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 10 }}>
          <div style={{ width: 40, height: 4, borderRadius: 2, background: step >= 1 ? '#3D2C00' : 'rgba(255,255,255,0.5)' }} />
          <div style={{ width: 40, height: 4, borderRadius: 2, background: step >= 2 ? '#3D2C00' : 'rgba(255,255,255,0.5)' }} />
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: -30 }}>

        {/* STEP 1: Profile Info */}
        {step === 1 && (
          <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--text)' }}>📋 ข้อมูลโปรไฟล์</div>

            {/* Avatar */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 16 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'var(--primary-light)', border: '3px solid var(--primary)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', cursor: 'pointer', position: 'relative',
              }} onClick={() => document.getElementById('avatar-upload')?.click()}>
                {uploadingAvatar ? (
                  <span>...</span>
                ) : avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span style={{ fontSize: 32 }}>👤</span>
                )}
              </div>
              <input id="avatar-upload" type="file" accept="image/*" hidden onChange={handleAvatarUpload} />
              <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 6 }}>กดเปลี่ยนรูปโปรไฟล์</div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>คำอธิบายตัวเอง (bio)</div>
              <textarea
                className="form-input"
                rows={3}
                placeholder="ช่างที่มีประสบการณ์..."
                value={techProfile.bio}
                onChange={e => setTechProfile(f => ({ ...f, bio: e.target.value }))}
              />
            </div>

            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>หัวข้อ (headline)</div>
              <input className="form-input" placeholder="เช่น ช่างไฟฟ้ามืออาชีพ..."
                value={techProfile.headline}
                onChange={e => setTechProfile(f => ({ ...f, headline: e.target.value }))} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>ปีประสบการณ์</div>
                <input className="form-input" type="number" placeholder="5"
                  value={techProfile.yearsExperience}
                  onChange={e => setTechProfile(f => ({ ...f, yearsExperience: e.target.value }))} />
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>ค่าแรง/ชม. (บาท)</div>
                <input className="form-input" type="number" placeholder="300"
                  value={techProfile.hourlyRate}
                  onChange={e => setTechProfile(f => ({ ...f, hourlyRate: e.target.value }))} />
              </div>
            </div>

            {/* Location */}
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4, color: 'var(--text)' }}>📍 พิกัดที่ตั้ง</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input className="form-input" placeholder="ละติจูด" style={{ flex: 1 }}
                  value={techProfile.latitude}
                  onChange={e => setTechProfile(f => ({ ...f, latitude: e.target.value }))} />
                <input className="form-input" placeholder="ลองจิจูด" style={{ flex: 1 }}
                  value={techProfile.longitude}
                  onChange={e => setTechProfile(f => ({ ...f, longitude: e.target.value }))} />
                <button onClick={getLocation} style={{
                  background: 'var(--primary)', color: '#3D2C00', border: 'none',
                  borderRadius: 10, padding: '8px 12px', cursor: 'pointer', fontSize: 16,
                }}>📍</button>
              </div>
            </div>

            {/* Service Radius */}
            <div style={{ marginBottom: 4 }}>
              <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: 'var(--text)' }}>🌐 รัศมีรับงาน</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {[{ km: 3, label: '3 กม.' }, { km: 5, label: '5 กม.' }, { km: 10, label: '10 กม.' }, { km: 20, label: '20 กม.' }, { km: 50, label: '50 กม.' }, { km: 0, label: 'ทั่วประเทศ' }].map(opt => (
                  <button
                    key={opt.km}
                    type="button"
                    onClick={() => setTechProfile(f => ({ ...f, serviceRadius: opt.km }))}
                    style={{
                      padding: '5px 12px',
                      borderRadius: 20,
                      border: techProfile.serviceRadius === opt.km ? '2px solid var(--primary)' : '1.5px solid var(--border)',
                      background: techProfile.serviceRadius === opt.km ? 'var(--primary-light)' : 'white',
                      fontSize: 12, fontWeight: 700,
                      color: techProfile.serviceRadius === opt.km ? '#92400E' : 'var(--text)',
                      cursor: 'pointer',
                    }}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <button className="btn-primary" style={{ width: '100%', marginTop: 16 }}
              onClick={() => setStep(2)}>
              ต่อไป →
            </button>
          </div>
        )}

        {/* STEP 2: Categories */}
        {step === 2 && (
          <div style={{ background: 'white', borderRadius: 16, padding: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 6, color: 'var(--text)' }}>🏢 เลือกประเภทบริการ</div>
            <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 14 }}>เลือกหมวดหมู่ที่คุณให้บริการได้</div>

            {systemCategories.map(cat => (
              <div key={cat.id} style={{ marginBottom: 16 }}>
                <div
                  onClick={() => toggleCategory(cat.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    cursor: 'pointer', padding: '8px 10px',
                    borderRadius: 10,
                    background: selectedCategories.includes(cat.id) ? 'var(--primary-light)' : 'var(--bg)',
                    border: selectedCategories.includes(cat.id) ? '2px solid var(--primary)' : '2px solid transparent',
                  }}
                >
                  <span style={{ fontSize: 18 }}>{cat.icon || '📂'}</span>
                  <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text)', flex: 1 }}>{cat.name}</span>
                  <div style={{
                    width: 20, height: 20, borderRadius: '50%',
                    background: selectedCategories.includes(cat.id) ? 'var(--primary)' : 'var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: selectedCategories.includes(cat.id) ? '#3D2C00' : 'white',
                  }}>
                    {selectedCategories.includes(cat.id) ? '✓' : ''}
                  </div>
                </div>

                {/* Subcategories */}
                {selectedCategories.includes(cat.id) && cat.subCategories?.length > 0 && (
                  <div style={{ paddingLeft: 16, marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {cat.subCategories.map((sub: any) => (
                      <button
                        key={sub.id}
                        type="button"
                        onClick={() => toggleSubCat(cat.id, sub.id)}
                        style={{
                          padding: '4px 10px',
                          borderRadius: 16,
                          border: (selectedSubCats[cat.id] || []).includes(sub.id)
                            ? '2px solid var(--primary)'
                            : '1.5px solid var(--border)',
                          background: (selectedSubCats[cat.id] || []).includes(sub.id)
                            ? 'var(--primary-light)'
                            : 'white',
                          fontSize: 11, fontWeight: 600,
                          color: (selectedSubCats[cat.id] || []).includes(sub.id) ? '#92400E' : 'var(--text)',
                          cursor: 'pointer',
                        }}
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {error && (
              <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setStep(1)}
                style={{ flex: 1, padding: 12, borderRadius: 25, border: '1.5px solid var(--border)', background: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer', color: 'var(--text)' }}>
                ← กลับ
              </button>
              <button className="btn-primary" style={{ flex: 2 }}
                disabled={loading} onClick={handleSubmit}>
                {loading ? 'กำลังบันทึก...' : '✅ เริ่มใช้งานช่าง'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
