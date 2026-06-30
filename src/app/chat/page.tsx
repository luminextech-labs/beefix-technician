'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { chatApi } from '@/lib/api'

export default function ChatListPage() {
  const [rooms, setRooms] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    chatApi.getRooms().then(r => {
      if (r.success) setRooms(r.rooms)
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ background: 'var(--primary)', padding: '16px 20px 24px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#3D2C00' }}>💬 แชท</div>
      </div>

      <div style={{ padding: '20px 16px 0' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...Array(3)].map((_, i) => <div key={i} style={{ height: 76, background: '#f0f0f0', borderRadius: 16 }} />)}
          </div>
        ) : rooms.length === 0 ? (
          <div className="card-shadow" style={{ padding: 32, textAlign: 'center', marginTop: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>💬</div>
            <div style={{ fontWeight: 700 }}>ยังไม่มีแชท</div>
            <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 4 }}>แชทจะปรากฏเมื่อยืนยันงาน</div>
          </div>
        ) : (
          rooms.map(room => (
            <Link key={room.id} href={`/chat/${room.id}`}>
              <div style={{ display: 'flex', gap: 12, padding: 14, background: 'white', borderRadius: 16, marginBottom: 10, boxShadow: 'var(--shadow)', alignItems: 'center' }}>
                <div style={{ width: 50, height: 50, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                  {room.customer?.fullName?.charAt(0) || '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{room.customer?.fullName}</div>
                    {room.lastMessageAt && <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{new Date(room.lastMessageAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short' })}</div>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)', marginBottom: 2 }}>📋 {room.order?.title}</div>
                  {room.lastMessage && <div style={{ fontSize: 12, color: 'var(--text-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room.lastMessage}</div>}
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <div className="bottom-nav">
        <Link href="/dashboard" className="nav-item"><span className="nav-icon">🏠</span>หน้าแรก</Link>
        <Link href="/orders" className="nav-item"><span className="nav-icon">📋</span>งาน</Link>
        <Link href="/chat" className="nav-item active"><span className="nav-icon">💬</span>แชท</Link>
        <Link href="/wallet" className="nav-item"><span className="nav-icon">💳</span>กระเป๋า</Link>
        <Link href="/profile" className="nav-item"><span className="nav-icon">👤</span>โปรไฟล์</Link>
      </div>
    </div>
  )
}
