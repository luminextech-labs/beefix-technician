'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ordersApi } from '@/lib/api'

const STATUS_LABELS: Record<string, string> = {
  pending: 'รอยืนยัน',
  confirmed: 'ยืนยันแล้ว',
  in_progress: 'กำลังทำ',
  completed: 'เสร็จแล้ว',
  cancelled: 'ยกเลิก',
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [filter, setFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ordersApi.getAll().then(r => {
      if (r.success) setOrders(r.orders)
    }).finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter)

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ background: 'var(--primary)', padding: '16px 20px 60px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#3D2C00' }}>📋 งานทั้งหมด</div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: 8, padding: '0 16px', marginTop: -40, marginBottom: 16, overflowX: 'auto' }}>
        {['all', 'pending', 'confirmed', 'in_progress', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '8px 16px',
              borderRadius: 50,
              border: 'none',
              fontSize: 12,
              fontWeight: 600,
              fontFamily: 'Prompt, sans-serif',
              cursor: 'pointer',
              background: filter === f ? 'var(--primary)' : 'white',
              color: filter === f ? '#3D2C00' : 'var(--text-light)',
              boxShadow: 'var(--shadow)',
              whiteSpace: 'nowrap',
            }}
          >
            {f === 'all' ? 'ทั้งหมด' : STATUS_LABELS[f]}
          </button>
        ))}
      </div>

      <div style={{ padding: '0 16px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(4)].map((_, i) => <div key={i} style={{ height: 80, background: '#f0f0f0', borderRadius: 16 }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card-shadow" style={{ padding: 32, textAlign: 'center' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>📭</div>
            <div style={{ fontWeight: 600 }}>ไม่มีงาน</div>
          </div>
        ) : (
          filtered.map(order => (
            <Link key={order.id} href={`/orders/${order.id}`}>
              <div className="card-shadow" style={{ padding: 14, marginBottom: 10, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 2 }}>{order.title}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 4 }}>{order.orderNo} · {order.jobDate}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>฿{Number(order.totalAmount).toLocaleString()}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
                  <span className={`badge-${order.status}`}>{STATUS_LABELS[order.status] || order.status}</span>
                  <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{order.paymentStatus === 'paid' ? '✅ จ่ายแล้ว' : '⏳ รอจ่าย'}</div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="bottom-nav">
        <Link href="/dashboard" className="nav-item"><span className="nav-icon">🏠</span>หน้าแรก</Link>
        <Link href="/orders" className="nav-item active"><span className="nav-icon">📋</span>งาน</Link>
        <Link href="/chat" className="nav-item"><span className="nav-icon">💬</span>แชท</Link>
        <Link href="/wallet" className="nav-item"><span className="nav-icon">💳</span>กระเป๋า</Link>
        <Link href="/profile" className="nav-item"><span className="nav-icon">👤</span>โปรไฟล์</Link>
      </div>
    </div>
  )
}
