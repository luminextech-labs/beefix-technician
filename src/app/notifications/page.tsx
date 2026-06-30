'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { notificationsApi } from '@/lib/api'

const ICONS: Record<string, string> = {
  new_order: '📋', order_confirmed: '✅', payment_received: '💰',
  review_received: '⭐', new_message: '💬', order_cancelled: '❌',
}

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState<any[]>([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificationsApi.get().then(r => {
      if (r.success) { setNotifs(r.notifications); setUnread(r.unreadCount) }
    }).finally(() => setLoading(false))
  }, [])

  const markAll = async () => {
    await notificationsApi.markAllRead()
    setNotifs(p => p.map(n => ({ ...n, isRead: true })))
    setUnread(0)
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ background: 'var(--primary)', padding: '16px 20px 24px', borderRadius: '0 0 24px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#3D2C00' }}>🔔 การแจ้งเตือน</div>
        {unread > 0 && (
          <button onClick={markAll} style={{ background: 'rgba(255,255,255,0.3)', border: 'none', borderRadius: 20, padding: '6px 14px', color: '#3D2C00', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Prompt, sans-serif' }}>
            อ่านทั้งหมดแล้ว
          </button>
        )}
      </div>

      <div style={{ padding: '20px 16px 0' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[...Array(4)].map((_, i) => <div key={i} style={{ height: 70, background: '#f0f0f0', borderRadius: 16 }} />)}</div>
        ) : notifs.length === 0 ? (
          <div className="card-shadow" style={{ padding: 40, textAlign: 'center', marginTop: 20 }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>🔔</div>
            <div style={{ fontWeight: 700 }}>ไม่มีการแจ้งเตือน</div>
          </div>
        ) : (
          notifs.map(n => (
            <div key={n.id} className="card-shadow" style={{ padding: '14px 16px', marginBottom: 8, background: n.isRead ? 'white' : 'var(--primary-light)', display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: n.isRead ? '#f5f5f5' : '#FFF0B3', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {ICONS[n.type] || '🔔'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: n.isRead ? 600 : 700, fontSize: 14, marginBottom: 2 }}>{n.title}</div>
                {n.body && <div style={{ fontSize: 12, color: 'var(--text-light)', lineHeight: 1.4 }}>{n.body}</div>}
                <div style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 4 }}>{new Date(n.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</div>
              </div>
              {!n.isRead && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--primary)', flexShrink: 0, marginTop: 6 }} />}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
