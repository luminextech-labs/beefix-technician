'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi, ordersApi, walletApi, techniciansApi } from '@/lib/api'

interface Stat { label: string; value: string | number; icon: string }
interface Order { id: string; orderNo: string; title: string; status: string; jobDate: string; totalAmount: string }

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [tech, setTech] = useState<any>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [walletBal, setWalletBal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [updatingAvail, setUpdatingAvail] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('tech_token')
    if (!token) { router.replace('/login'); return }

    Promise.all([
      authApi.me(),
      ordersApi.getAll(),
      walletApi.get(),
      techniciansApi.me(),
    ]).then(([meRes, ordersRes, walletRes, techRes]) => {
      if (meRes.success) setUser(meRes.user)
      if (ordersRes.success) setOrders(ordersRes.orders.slice(0, 5))
      if (walletRes.success) setWalletBal(Number(walletRes.wallet?.balance || 0))
      if (techRes.success) setTech(techRes.technician)
    }).catch(() => router.replace('/login'))
    .finally(() => setLoading(false))
  }, [router])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg)' }}>
      <div style={{ textAlign:'center' }}><div style={{ fontSize:48, marginBottom:8 }}>🔧</div><div>กำลังโหลด...</div></div>
    </div>
  )

  const pending = orders.filter(o => o.status === 'pending').length
  const stats: Stat[] = [
    { label: 'รอยืนยัน', value: pending, icon: '📋' },
    { label: 'งานทั้งหมด', value: orders.length, icon: '🔧' },
    { label: 'ยอดเงิน', value: `฿${walletBal.toLocaleString()}`, icon: '💰' },
  ]

  const handleToggleAvailable = async () => {
    if (!tech || updatingAvail) return
    setUpdatingAvail(true)
    try {
      const res = await techniciansApi.updateProfile({ isAvailable: !tech.isAvailable })
      if (res.success) setTech((t: any) => ({ ...t, isAvailable: !t.isAvailable }))
    } finally {
      setUpdatingAvail(false)
    }
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: '80px' }}>
      {/* HEADER */}
      <div style={{ background: 'var(--primary)', padding: '16px 20px 60px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <div>
            <div style={{ fontSize: 13, color: '#3D2C00', opacity: 0.8 }}>สวัสดีครับ</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#3D2C00' }}>{user?.fullName || 'ช่าง'}</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href="/notifications" style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>🔔</Link>
            <button onClick={() => { authApi.logout(); router.push('/login') }} style={{ width: 40, height: 40, background: 'rgba(255,255,255,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, border: 'none', cursor: 'pointer' }}>🚪</button>
          </div>
        </div>
        {/* AVAILABILITY TOGGLE */}
        <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: 12, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: '#3D2C00' }}>{tech?.isAvailable ? '✅ พร้อมรับงาน' : '⏸ ไม่พร้อมรับงาน'}</div>
            <div style={{ fontSize: 11, color: '#3D2C00', opacity: 0.8 }}>เปิดรับงานจากลูกค้า</div>
          </div>
          <button
            onClick={handleToggleAvailable}
            disabled={updatingAvail}
            style={{
              width: 48, height: 28, borderRadius: 14, border: 'none',
              background: tech?.isAvailable ? '#16A34A' : '#D1D5DB',
              position: 'relative', cursor: updatingAvail ? 'default' : 'pointer',
              transition: 'background 0.2s', opacity: updatingAvail ? 0.7 : 1,
            }}>
            <div style={{
              width: 22, height: 22, borderRadius: '50%', background: '#fff',
              position: 'absolute', top: 3,
              left: tech?.isAvailable ? 23 : 3,
              transition: 'left 0.2s',
            }} />
          </button>
        </div>
        {/* STATS */}
        <div style={{ display: 'flex', gap: 10 }}>
          {stats.map(s => (
            <div key={s.label} style={{ flex: 1, background: 'rgba(255,255,255,0.3)', borderRadius: 12, padding: '12px 10px', textAlign: 'center' }}>
              <div style={{ fontSize: 20, marginBottom: 2 }}>{s.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#3D2C00' }}>{s.value}</div>
              <div style={{ fontSize: 10, color: '#3D2C00', opacity: 0.8 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* PENDING ORDERS */}
      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div style={{ fontSize: 15, fontWeight: 700 }}>📋 งานรอดำเนินการ</div>
          <Link href="/orders" style={{ fontSize: 12, color: 'var(--primary)', fontWeight: 600 }}>ดูทั้งหมด →</Link>
        </div>

        {orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length === 0 ? (
          <div className="card-shadow" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>✅</div>
            <div style={{ fontWeight: 600 }}>ไม่มีงานรอ</div>
            <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4 }}>พร้อมรับงานใหม่เสมอ</div>
          </div>
        ) : (
          orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').map(order => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <div className="card-shadow" style={{ padding: 14, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 2 }}>{order.title}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{order.orderNo} · {order.jobDate}</div>
                </div>
                <span className={`badge-${order.status}`}>{order.status === 'pending' ? 'รอยืนยัน' : order.status === 'confirmed' ? 'ยืนยันแล้ว' : order.status === 'in_progress' ? 'กำลังทำ' : order.status}</span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* QUICK ACTIONS */}
      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 12 }}>⚡ ลัด</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/orders" className="card-shadow" style={{ flex: 1, padding: 14, textAlign: 'center', display: 'block' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>📋</div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>งานทั้งหมด</div>
          </Link>
          <Link href="/wallet" className="card-shadow" style={{ flex: 1, padding: 14, textAlign: 'center', display: 'block' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>💰</div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>กระเป๋า</div>
          </Link>
          <Link href="/profile" className="card-shadow" style={{ flex: 1, padding: 14, textAlign: 'center', display: 'block' }}>
            <div style={{ fontSize: 24, marginBottom: 4 }}>👤</div>
            <div style={{ fontSize: 12, fontWeight: 600 }}>โปรไฟล์</div>
          </Link>
        </div>
      </div>

      {/* BOTTOM NAV */}
      <div className="bottom-nav">
        <Link href="/dashboard" className="nav-item active"><span className="nav-icon">🏠</span>หน้าแรก</Link>
        <Link href="/orders" className="nav-item"><span className="nav-icon">📋</span>งาน</Link>
        <Link href="/chat" className="nav-item"><span className="nav-icon">💬</span>แชท</Link>
        <Link href="/wallet" className="nav-item"><span className="nav-icon">💳</span>กระเป๋า</Link>
        <Link href="/profile" className="nav-item"><span className="nav-icon">👤</span>โปรไฟล์</Link>
      </div>
    </div>
  )
}
