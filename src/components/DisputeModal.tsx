'use client'
import { useState } from 'react'
import { disputesApi } from '@/lib/api'

const REASONS = [
  'ลูกค้าไม่ยอมรับการชำระเงิน',
  'ลูกค้าขอเพิ่มงานโดยไม่ยอมเพิ่มราคา',
  'ลูกค้าไม่อยู่บ้านตามนัด',
  'ลูกค้าทำร้ายช่าง',
  'ปัญหาเรื่องคุณภาพงาน',
  'อื่นๆ',
]

interface Props {
  orderId: string
  onSuccess: () => void
  onClose: () => void
}

export default function DisputeModal({ orderId, onSuccess, onClose }: Props) {
  const [reason, setReason] = useState('')
  const [otherReason, setOtherReason] = useState('')
  const [description, setDescription] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    const finalReason = reason === 'อื่นๆ' ? otherReason.trim() : reason
    if (!finalReason) { setError('กรุณาเลือกเหตุผล'); return }
    setSubmitting(true)
    setError('')
    try {
      await disputesApi.open(orderId, { reason: finalReason, description: description.trim() || undefined })
      onSuccess()
    } catch (e: any) {
      setError(e.message || 'เกิดข้อผิดพลาด')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: 16,
    }}>
      <div style={{
        background: 'white', borderRadius: 20, width: '100%', maxWidth: 420,
        padding: 24,
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#DC2626', marginBottom: 4 }}>⚖️ เปิดข้อพิพาท</div>
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>แอดมินจะเป็นคนตัดสิน</div>

        {error && <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#374151' }}>เหตุผล</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
          {REASONS.map(r => (
            <button
              key={r}
              onClick={() => setReason(r)}
              style={{
                padding: '10px 14px', borderRadius: 10, fontSize: 13,
                border: reason === r ? '2px solid #DC2626' : '1.5px solid #E5E7EB',
                background: reason === r ? '#FEF2F2' : '#F9FAFB',
                color: reason === r ? '#DC2626' : '#374151',
                fontWeight: reason === r ? 700 : 500,
                cursor: 'pointer', textAlign: 'left', fontFamily: 'inherit',
              }}
            >{r}</button>
          ))}
        </div>
        {reason === 'อื่นๆ' && (
          <input
            value={otherReason}
            onChange={e => setOtherReason(e.target.value)}
            placeholder="ระบุเหตุผล..."
            style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: 16 }}
          />
        )}

        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8, color: '#374151' }}>รายละเอียดเพิ่มเติม (ไม่บังคับ)</div>
        <textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          rows={3}
          placeholder="อธิบายปัญหาที่เกิดขึ้น..."
          style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box', marginBottom: 20 }}
        />

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
            disabled={submitting}
            style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #E5E7EB', background: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#6B7280', fontFamily: 'inherit' }}
          >ยกเลิก</button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: '#DC2626', color: 'white', fontSize: 14, fontWeight: 800, cursor: submitting ? 'default' : 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.6 : 1 }}
          >{submitting ? 'กำลังส่ง…' : '⚖️ เปิดข้อพิพาท'}</button>
        </div>
      </div>
    </div>
  )
}
