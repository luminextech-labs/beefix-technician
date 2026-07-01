'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { reviewsApi, techniciansApi } from '@/lib/api'

interface Review {
  id: string
  rating: number
  comment: string | null
  tags: string[]
  technicianReply: string | null
  createdAt: string
  customer: { fullName: string; avatarUrl: string | null }
  order: { orderNo: string; title: string; completedAt: string | null }
}

export default function ReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [techId, setTechId] = useState('')

  useEffect(() => {
    const token = localStorage.getItem('tech_token')
    if (!token) return

    Promise.all([techniciansApi.me()])
      .then(([techRes]) => {
        if (techRes.technician) {
          setTechId(techRes.technician.id)
          return reviewsApi.getByTechnician(techRes.technician.id)
        }
        return null
      })
      .then(revRes => {
        if (revRes?.success) setReviews(revRes.reviews)
      })
      .finally(() => setLoading(false))
  }, [])

  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 100 }}>
      {/* HEADER */}
      <div style={{ background: 'var(--primary)', padding: '16px 20px', borderRadius: '0 0 24px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
        <Link href="/profile"><div style={{ fontSize: 20 }}>←</div></Link>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#3D2C00' }}>ดูรีวิว</div>
      </div>

      <div style={{ padding: 16 }}>
        {/* SUMMARY CARD */}
        <div className="card-shadow" style={{ padding: 20, borderRadius: 16, textAlign: 'center', marginBottom: 20 }}>
          <div style={{ fontSize: 48, fontWeight: 800, color: 'var(--primary)' }}>{avgRating}</div>
          <div style={{ fontSize: 20 }}>{'⭐'.repeat(Math.round(parseFloat(avgRating)))}</div>
          <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>จากรีวิวทั้งหมด {reviews.length} รายการ</div>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40 }}>กำลังโหลด...</div>
        ) : reviews.length === 0 ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>⭐</div>
            <div style={{ fontWeight: 600 }}>ยังไม่มีรีวิว</div>
            <div style={{ fontSize: 13, color: 'var(--text-light)', marginTop: 4 }}>รีวิวจะแสดงที่นี่หลังลูกค้ารีวิวงานของคุณ</div>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="card-shadow" style={{ padding: 16, borderRadius: 12, marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{review.customer.fullName}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{review.order.orderNo} · {review.order.title}</div>
                </div>
                <div style={{ fontSize: 16 }}>{'⭐'.repeat(review.rating)}</div>
              </div>

              {review.comment && (
                <div style={{ fontSize: 13, color: 'var(--text)', marginBottom: 8, lineHeight: 1.5 }}>
                  "{review.comment}"
                </div>
              )}

              {review.tags && review.tags.length > 0 && (
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {review.tags.map(tag => (
                    <span key={tag} style={{ background: 'var(--primary-light)', color: 'var(--primary)', fontSize: 11, padding: '2px 8px', borderRadius: 20, fontWeight: 600 }}>
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div style={{ fontSize: 11, color: 'var(--text-light)', marginBottom: 6 }}>
                {new Date(review.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
              </div>

              {review.technicianReply ? (
                <div style={{ background: '#F3F4F6', padding: '10px 12px', borderRadius: 8, fontSize: 12, marginTop: 8, borderLeft: '3px solid var(--primary)' }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>คุณตอบกลับ:</div>
                  <div>{review.technicianReply}</div>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: 'var(--text-light)', fontStyle: 'italic' }}>ยังไม่ได้ตอบกลับ</div>
              )}
            </div>
          ))
        )}
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
