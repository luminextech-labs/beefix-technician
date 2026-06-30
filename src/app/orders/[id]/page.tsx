'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ordersApi, chatApi } from '@/lib/api'

const STATUS_LABELS: Record<string, string> = {
  pending: 'รอยืนยัน',
  confirmed: 'ยืนยันแล้ว',
  in_progress: 'กำลังทำ',
  completed: 'เสร็จแล้ว',
  cancelled: 'ยกเลิก',
}

export default function OrderDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const load = () => {
    ordersApi.getOne(params.id as string).then(r => {
      if (r.success) setOrder(r.order)
    }).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [params.id])

  const updateStatus = async (status: string) => {
    setUpdating(true)
    try {
      const r = await ordersApi.updateStatus(params.id as string, status)
      if (r.success) {
        setOrder(r.order)
        if (status === 'confirmed') {
          // Auto-create chat room
          await chatApi.createRoom(params.id as string)
        }
      }
    } finally {
      setUpdating(false)
    }
  }

  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', background:'var(--bg)', fontSize:14 }}>กำลังโหลด...</div>
  if (!order) return <div style={{ padding:20, textAlign:'center' }}>ไม่พบงาน</div>

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 100 }}>
      {/* HEADER */}
      <div style={{ background: 'var(--primary)', padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center', borderRadius: '0 0 24px 24px' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#3D2C00' }}>←</button>
        <div style={{ fontSize: 16, fontWeight: 700, color: '#3D2C00', flex: 1 }}>{order.orderNo}</div>
        <span className={`badge-${order.status}`}>{STATUS_LABELS[order.status] || order.status}</span>
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        {/* JOB INFO */}
        <div className="card-shadow" style={{ padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{order.title}</div>
          {order.description && <div style={{ fontSize: 13, color: 'var(--text-light)', marginBottom: 12 }}>{order.description}</div>}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
              <span style={{ color: 'var(--text-light)' }}>📅</span>
              <span>{order.jobDate} เวลา {order.jobTime}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
              <span style={{ color: 'var(--text-light)' }}>📍</span>
              <span>{order.address?.address}, {order.address?.district}, {order.address?.province}</span>
            </div>
            <div style={{ display: 'flex', gap: 8, fontSize: 13 }}>
              <span style={{ color: 'var(--text-light)' }}>👤</span>
              <span>{order.customer?.fullName} · {order.customer?.phone}</span>
            </div>
          </div>
        </div>

        {/* PRICE */}
        <div className="card-shadow" style={{ padding: 16, marginBottom: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>รายละเอียดราคา</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
            <span>ค่าแรง</span><span>฿{Number(order.laborCost).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
            <span>ค่าเดินทาง</span><span>฿{Number(order.travelCost || 0).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 700, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
            <span>รวม</span><span style={{ color: 'var(--green)' }}>฿{Number(order.totalAmount).toLocaleString()}</span>
          </div>
        </div>

        {/* PAYMENT STATUS */}
        <div className="card-shadow" style={{ padding: 16, marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600 }}>การชำระเงิน</div>
            <div style={{ fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>{order.paymentStatus === 'paid' ? '✅ ชำระแล้ว' : '⏳ รอชำระ'}</div>
          </div>
          <div style={{ fontSize: 13, fontWeight: 600 }}>{order.payment?.method === 'wallet' ? '💳 Wallet' : order.payment?.method}</div>
        </div>

        {/* ACTION BUTTONS */}
        {order.status === 'pending' && (
          <button className="btn-primary" style={{ marginBottom: 10 }} disabled={updating} onClick={() => updateStatus('confirmed')}>
            {updating ? 'กำลัง...' : '✅ ยืนยันรับงาน'}
          </button>
        )}
        {order.status === 'confirmed' && (
          <button className="btn-primary" style={{ marginBottom: 10, background: '#7C3AED', color: 'white', boxShadow: 'none' }} disabled={updating} onClick={() => updateStatus('in_progress')}>
            {updating ? 'กำลัง...' : '🔧 เริ่มทำงาน'}
          </button>
        )}
        {order.status === 'in_progress' && (
          <button className="btn-primary" style={{ marginBottom: 10, background: 'var(--green)', color: 'white', boxShadow: 'none' }} disabled={updating} onClick={() => updateStatus('completed')}>
            {updating ? 'กำลัง...' : '✅ งานเสร็จสิ้น'}
          </button>
        )}
        {order.status === 'completed' && (
          <div className="card-shadow" style={{ padding: 16, textAlign: 'center', background: '#D1FAE5' }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>🎉</div>
            <div style={{ fontWeight: 700, color: '#059669' }}>งานเสร็จสิ้น!</div>
            <div style={{ fontSize: 12, color: '#059669', marginTop: 4 }}>รอลูกค้ารีวิว</div>
          </div>
        )}

        {/* CHAT */}
        <Link href={`/chat/${order.chatRoom?.id}`}>
          <button className="btn-secondary" style={{ marginTop: 8 }}>
            💬 แชทกับลูกค้า
          </button>
        </Link>
      </div>
    </div>
  )
}
