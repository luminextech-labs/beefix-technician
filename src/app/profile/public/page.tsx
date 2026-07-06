'use client'
import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { techniciansApi } from '@/lib/api'

function PublicProfileInner() {
  const searchParams = useSearchParams()
  const techId = searchParams.get('techId')
  const [tech, setTech] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [viewingImages, setViewingImages] = useState<string[] | null>(null)

  useEffect(() => {
    if (!techId) { setError('ไม่พบ ID ช่าง'); setLoading(false); return }
    techniciansApi.getPublicProfile(techId)
      .then(res => {
        if (res.success) setTech(res.technician)
        else setError(res.message || 'ไม่พบโปรไฟล์')
      })
      .catch(() => setError('โหลดโปรไฟล์ไม่ได้'))
      .finally(() => setLoading(false))
  }, [techId])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: 48, marginBottom: 8 }}>👨🔧</div><div>กำลังโหลด...</div></div>
    </div>
  )

  if (error || !tech) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: 48, marginBottom: 8 }}>😕</div><div>{error || 'ไม่พบโปรไฟล์'}</div></div>
    </div>
  )

  const user = tech.user

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 40 }}>

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
                <img key={i} src={url} alt="" style={{ width: '100%', maxWidth: 280, maxHeight: 400, objectFit: 'cover', borderRadius: 12 }} onClick={e => e.stopPropagation()} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ===================== BLOCK 1: PROFILE HEADER ===================== */}
      <div style={{ background: 'var(--primary)', padding: '16px 20px 60px', borderRadius: '0 0 24px 24px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
          <Link href="/profile" style={{ color: '#3D2C00', fontSize: 20 }}>← กลับ</Link>
        </div>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-dark)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36, overflow: 'hidden', border: '3px solid rgba(255,255,255,0.5)' }}>
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user?.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span>{user?.fullName?.charAt(0) || '?'}</span>
          )}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#3D2C00' }}>{user?.fullName}</div>
        {tech.headline && <div style={{ fontSize: 13, color: '#3D2C00', opacity: 0.85, marginTop: 4 }}>{tech.headline}</div>}

        {/* Availability badge */}
        <div style={{ marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6, background: tech.isAvailable ? 'rgba(34,197,94,0.2)' : 'rgba(0,0,0,0.15)', borderRadius: 20, padding: '4px 14px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: tech.isAvailable ? '#22c55e' : '#94a3b8' }} />
          <span style={{ fontSize: 12, color: '#3D2C00', fontWeight: 600 }}>
            {tech.isAvailable ? 'พร้อมรับงาน' : 'ไม่รับงาน'}
          </span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, marginTop: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#3D2C00' }}>⭐ {Number(tech.ratingAvg || 0).toFixed(1)}</div>
            <div style={{ fontSize: 10, color: '#3D2C00', opacity: 0.7 }}>คะแนนเฉลี่ย</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#3D2C00' }}>{tech.ratingCount || 0}</div>
            <div style={{ fontSize: 10, color: '#3D2C00', opacity: 0.7 }}>รีวิว</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#3D2C00' }}>{tech.yearsExperience || 0}</div>
            <div style={{ fontSize: 10, color: '#3D2C00', opacity: 0.7 }}>ปีประสบการณ์</div>
          </div>
        </div>
      </div>

      <div style={{ padding: '0 16px', marginTop: -30 }}>

        {/* ===================== BLOCK 1b: ABOUT ===================== */}
        <div className="card-shadow" style={{ padding: 16, marginBottom: 12, borderRadius: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>👤 เกี่ยวกับช่าง</div>
          <div style={{ fontSize: 13, color: 'var(--text-light)', lineHeight: 1.6 }}>
            {tech.bio || 'ยังไม่มีรายละเอียด'}
          </div>
          {tech.hourlyRate && (
            <div style={{ marginTop: 10, fontSize: 14, fontWeight: 700, color: 'var(--primary)' }}>
              💰 ค่าแรง {tech.hourlyRate} บาท/ชม.
            </div>
          )}
        </div>

        {/* ===================== BLOCK 2: SERVICES ===================== */}
        {tech.services && tech.services.length > 0 && (
          <div className="card-shadow" style={{ padding: 16, marginBottom: 12, borderRadius: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>🔧 บริการ</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {tech.services.map((svc: any) => (
                <div key={svc.id} style={{ background: 'var(--bg)', borderRadius: 10, padding: '10px 12px' }}>
                  {svc.images && svc.images.length > 0 && (
                    <div style={{ display: 'flex', gap: 6, marginBottom: 8, overflowX: 'auto' }}>
                      {svc.images.map((img: string, i: number) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={img} alt="" style={{ width: 60, height: 60, borderRadius: 8, objectFit: 'cover', flexShrink: 0 }} />
                      ))}
                    </div>
                  )}
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{svc.subCategory?.name}</div>
                  {svc.description && <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>{svc.description}</div>}
                  {svc.basePrice != null && (
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--primary)', marginTop: 4 }}>฿{Number(svc.basePrice).toLocaleString()}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== BLOCK 3: PORTFOLIO ===================== */}
        {tech.portfolioItems && tech.portfolioItems.length > 0 && (
          <div className="card-shadow" style={{ padding: 16, marginBottom: 12, borderRadius: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>🖼️ ผลงาน</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {tech.portfolioItems.map((item: any) => (
                <div key={item.id} style={{ borderRadius: 10, overflow: 'hidden', background: 'var(--bg)', border: '1px solid var(--border)' }}>
                  {/* Images */}
                  {item.images && item.images.length > 0 && (
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: item.images.length === 1 ? '1fr' : '1fr 1fr',
                      gap: 2, cursor: 'pointer'
                    }} onClick={() => setViewingImages(item.images)}>
                      {item.images.slice(0, 4).map((img: string, i: number) => (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img key={i} src={img} alt="" style={{ width: '100%', aspectRatio: '1/1', objectFit: 'cover', display: 'block' }} />
                      ))}
                      {item.images.length > 4 && (
                        <div style={{ width: '100%', aspectRatio: '1/1', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, color: '#fff', fontWeight: 700 }}>
                          +{item.images.length - 4}
                        </div>
                      )}
                    </div>
                  )}
                  {/* Caption */}
                  {item.caption && (
                    <div style={{ padding: '10px 12px 4px', fontSize: 13, lineHeight: 1.5 }}>
                      {item.caption}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===================== BLOCK 4: CERTIFICATIONS ===================== */}
        {(tech.certifications?.length > 0 || tech.categories?.length > 0) && (
          <div className="card-shadow" style={{ padding: 16, marginBottom: 12, borderRadius: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 10 }}>🏅 ความสามารถ & ใบรับรอง</div>

            {/* Beefix.app red text */}
            <div style={{ fontSize: 12, color: '#DC2626', fontWeight: 700, marginBottom: 10, textAlign: 'center' }}>
              🛡️ ผ่านการยืนยันจาก Beefix.app
            </div>

            {tech.categories && tech.categories.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
                {tech.categories.map((cat: any) => (
                  <span key={cat.id} style={{ background: 'var(--primary-light)', color: '#8B6914', borderRadius: 20, padding: '4px 12px', fontSize: 12, fontWeight: 600 }}>
                    {cat.category?.name}
                  </span>
                ))}
              </div>
            )}
            {tech.certifications?.map((cert: any, i: number) => (
              <div key={i} style={{ background: 'var(--bg)', borderRadius: 10, padding: '10px 12px', marginBottom: 6 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>🏅 {cert.name}</div>
                {cert.issuer && <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>{cert.issuer}{cert.year ? ` · ปี ${cert.year}` : ''}</div>}
                {cert.fileUrl && (
                  <a href={cert.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600, marginTop: 4, display: 'inline-block' }}>
                    📎 ดูไฟล์แนบ
                  </a>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  )
}

export default function PublicProfilePage() {
  return (
    <Suspense fallback={<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg)' }}><div>กำลังโหลด...</div></div>}>
      <PublicProfileInner />
    </Suspense>
  )
}
