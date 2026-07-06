'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ordersApi, chatApi } from '@/lib/api'
import BackButton from '@/components/BackButton'
import RevisionModal from '@/components/RevisionModal'
import DisputeModal from '@/components/DisputeModal'

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
  const [showRevisionModal, setShowRevisionModal] = useState(false)
  const [showDisputeModal, setShowDisputeModal] = useState(false)

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
        <BackButton onClick={() => router.back()} />
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

        {/* Revision & Dispute */}
        {!['completed', 'cancelled'].includes(order.status) && (
          <button className="btn-secondary" style={{ marginTop: 8, color: 'var(--primary)', borderColor: 'var(--primary)' }}
            onClick={() => setShowRevisionModal(true)}>
            📝 ขอแก้ไขงาน
          </button>
        )}
        {['in_progress', 'completed'].includes(order.status) && !order.disputes?.some((d: any) => d.status === 'open') && (
          <button style={{ marginTop: 8, width: '100%', padding: 10, borderRadius: 10, border: '1px solid #DC2626', background: '#FEF2F2', color: '#DC2626', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}
            onClick={() => setShowDisputeModal(true)}>
            ⚖️ เปิดข้อพิพาท
          </button>
        )}

        {/* Open dispute alert */}
        {order.disputes?.some((d: any) => d.status === 'open') && (
          <div style={{ marginTop: 12, padding: 12, background: '#FEF2F2', borderRadius: 12, border: '1px solid #FECACA' }}>
            <div style={{ fontWeight: 700, color: '#DC2626', fontSize: 13, marginBottom: 4 }}>⚖️ มีข้อพิพาทที่เปิดอยู่</div>
            {order.disputes.filter((d: any) => d.status === 'open').map((d: any) => (
              <div key={d.id} style={{ fontSize: 12, color: '#7F1D1D' }}>• {d.reason}</div>
            ))}
          </div>
        )}

        {/* Revision history */}
        {order.revisions?.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: 'var(--text)' }}>📝 ประวัติการแก้ไขงาน</div>
            {order.revisions.map((rev: any) => (
              <div key={rev.id} style={{ padding: 12, borderRadius: 12, marginBottom: 8, background: rev.status === 'approved' ? '#D1FAE5' : rev.status === 'rejected' ? '#FEE2E2' : '#F3F4F6', border: `1px solid ${rev.status === 'approved' ? '#A7F3D0' : rev.status === 'rejected' ? '#FECACA' : '#E5E7EB'}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                  <span style={{ fontSize: 12, fontWeight: 600 }}>{rev.requestedBy === order.customerId ? order.customer?.fullName : 'ช่าง'}</span>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: rev.status === 'approved' ? '#D1FAE5' : rev.status === 'rejected' ? '#FEE2E2' : '#FEF3C7', color: rev.status === 'approved' ? '#059669' : rev.status === 'rejected' ? '#DC2626' : '#D97706' }}>
                    {rev.status === 'approved' ? '✅ อนุมัติ' : rev.status === 'rejected' ? '❌ ปฏิเสธ' : '⏳ รอ' }
                  </span>
                </div>
                {rev.title && <div style={{ fontSize: 12, color: '#374151' }}>ชื่องาน: {rev.title}</div>}
                {rev.note && <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2, fontStyle: 'italic' }}>หมายเหตุ: {rev.note}</div>}

                {/* Approve/Reject for pending revisions from customer */}
                {rev.status === 'pending' && rev.requestedBy === order.customerId && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <button
                      onClick={async () => {
                        const { revisionsApi } = await import('@/lib/api')
                        await revisionsApi.approve(params.id as string, rev.id)
                        load()
                      }}
                      style={{ flex: 1, padding: '6px', borderRadius: 8, border: 'none', background: '#22C55E', color: 'white', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                    >✅ อนุมัติ</button>
                    <button
                      onClick={async () => {
                        const { revisionsApi } = await import('@/lib/api')
                        await revisionsApi.reject(params.id as string, rev.id)
                        load()
                      }}
                      style={{ flex: 1, padding: '6px', borderRadius: 8, border: '1px solid #DC2626', background: 'white', color: '#DC2626', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
                    >❌ ปฏิเสธ</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Revision Modal */}
      {showRevisionModal && (
        <RevisionModal orderId={params.id as string} currentOrder={order} onClose={() => setShowRevisionModal(false)} onSuccess={() => { setShowRevisionModal(false); load() }} />
      )}

      {/* Dispute Modal */}
      {showDisputeModal && (
        <DisputeModal orderId={params.id as string} onClose={() => setShowDisputeModal(false)} onSuccess={() => { setShowDisputeModal(false); load() }} />
      )}
      </div>
    </div>
  )
}
