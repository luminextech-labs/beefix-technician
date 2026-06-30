'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi, walletApi } from '@/lib/api'

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [walletBal, setWalletBal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([authApi.me(), walletApi.get()]).then(([meRes, walletRes]) => {
      if (meRes.success) setUser(meRes.user)
      if (walletRes.success) setWalletBal(Number(walletRes.wallet?.balance || 0))
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 80 }}>
      {/* HEADER */}
      <div style={{ background: 'var(--primary)', padding: '16px 20px 60px', borderRadius: '0 0 24px 24px', textAlign: 'center' }}>
        <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--primary-dark)', margin: '0 auto 12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
          {user?.fullName?.charAt(0) || '?'}
        </div>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#3D2C00' }}>{user?.fullName}</div>
        <div style={{ fontSize: 13, color: '#3D2C00', opacity: 0.7, marginTop: 2 }}>{user?.email}</div>
        <div style={{ fontSize: 12, color: '#3D2C00', opacity: 0.7 }}>{user?.phone}</div>
      </div>

      {/* STATS */}
      <div style={{ padding: '0 16px', marginTop: -40 }}>
        <div className="card-shadow" style={{ padding: 16, display: 'flex', justifyContent: 'space-around', textAlign: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--green)' }}>฿{walletBal.toLocaleString()}</div>
            <div style={{ fontSize: 11, color: 'var(--text-light)' }}>ยอดเงิน</div>
          </div>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>⭐ {user?.technician?.ratingAvg || '0.0'}</div>
            <div style={{ fontSize: 11, color: 'var(--text-light)' }}>คะแนนเฉลี่ย</div>
          </div>
          <div style={{ width: 1, background: 'var(--border)' }} />
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--primary)' }}>{user?.technician?.ratingCount || 0}</div>
            <div style={{ fontSize: 11, color: 'var(--text-light)' }}>รีวิว</div>
          </div>
        </div>

        {/* MENU */}
        <div className="card-shadow" style={{ overflow: 'hidden', marginBottom: 12, borderRadius: 16 }}>
          <Link href="/profile/edit">
            <div className="menu-item"><span style={{ fontSize: 20 }}>✏️</span><span style={{ fontSize: 14, fontWeight: 600 }}>แก้ไขโปรไฟล์</span><span style={{ marginLeft: 'auto', color: 'var(--text-light)' }}>→</span></div>
          </Link>
          <Link href="/profile/services">
            <div className="menu-item"><span style={{ fontSize: 20 }}>🔧</span><span style={{ fontSize: 14, fontWeight: 600 }}>บริการของฉัน</span><span style={{ marginLeft: 'auto', color: 'var(--text-light)' }}>→</span></div>
          </Link>
          <Link href="/profile/reviews">
            <div className="menu-item"><span style={{ fontSize: 20 }}>⭐</span><span style={{ fontSize: 14, fontWeight: 600 }}>ดูรีวิว</span><span style={{ marginLeft: 'auto', color: 'var(--text-light)' }}>→</span></div>
          </Link>
        </div>

        <div className="card-shadow" style={{ overflow: 'hidden', marginBottom: 16, borderRadius: 16 }}>
          <div className="menu-item" onClick={() => { authApi.logout(); router.push('/login') }} style={{ cursor: 'pointer' }}>
            <span style={{ fontSize: 20 }}>🚪</span><span style={{ fontSize: 14, fontWeight: 600, color: 'var(--red)' }}>ออกจากระบบ</span>
          </div>
        </div>
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
