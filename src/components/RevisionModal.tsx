'use client'
import { useState } from 'react'
import { revisionsApi } from '@/lib/api'

interface Props {
  orderId: string
  currentOrder: any
  onSuccess: () => void
  onClose: () => void
}

export default function RevisionModal({ orderId, currentOrder, onSuccess, onClose }: Props) {
  const [title, setTitle] = useState(currentOrder?.title || '')
  const [description, setDescription] = useState(currentOrder?.description || '')
  const [jobDate, setJobDate] = useState(
    currentOrder?.jobDate ? new Date(currentOrder.jobDate).toISOString().split('T')[0] : ''
  )
  const [jobTime, setJobTime] = useState(currentOrder?.jobTime || '')
  const [laborCost, setLaborCost] = useState(currentOrder?.laborCost?.toString() || '')
  const [travelCost, setTravelCost] = useState(currentOrder?.travelCost?.toString() || '')
  const [materialCost, setMaterialCost] = useState(currentOrder?.materialCost?.toString() || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    setSubmitting(true)
    setError('')
    try {
      await revisionsApi.create(orderId, {
        title: title || undefined,
        description: description || undefined,
        jobDate: jobDate || undefined,
        jobTime: jobTime || undefined,
        laborCost: laborCost ? parseFloat(laborCost) : undefined,
        travelCost: travelCost ? parseFloat(travelCost) : undefined,
        materialCost: materialCost ? parseFloat(materialCost) : undefined,
      })
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
        background: 'white', borderRadius: 20, width: '100%', maxWidth: 480,
        maxHeight: '90vh', overflowY: 'auto', padding: 24,
      }}>
        <div style={{ fontSize: 18, fontWeight: 800, color: '#3D2C00', marginBottom: 4 }}>📝 ขอแก้ไขรายละเอียดงาน</div>
        <div style={{ fontSize: 12, color: '#9CA3AF', marginBottom: 16 }}>อีกฝ่ายต้องอนุมัติก่อน</div>

        {error && <div style={{ background: '#FEE2E2', color: '#DC2626', padding: '10px 14px', borderRadius: 10, fontSize: 13, marginBottom: 12 }}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { label: 'ชื่องาน', value: title, set: setTitle, placeholder: 'ชื่องาน' },
          ].map(({ label, value, set, placeholder }) => (
            <div key={label}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#374151' }}>{label}</div>
              <input
                value={value}
                onChange={e => set(e.target.value)}
                placeholder={placeholder}
                style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
          ))}

          <div>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#374151' }}>รายละเอียดเพิ่มเติม</div>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={3}
              placeholder="รายละเอียดเพิ่มเติม..."
              style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', resize: 'none', outline: 'none', boxSizing: 'border-box' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#374151' }}>วันที่</div>
              <input type="date" value={jobDate} onChange={e => setJobDate(e.target.value)}
                style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#374151' }}>เวลา</div>
              <input type="time" value={jobTime} onChange={e => setJobTime(e.target.value)}
                style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[
              { label: 'ค่าแรง', value: laborCost, set: setLaborCost },
              { label: 'ค่าเดินทาง', value: travelCost, set: setTravelCost },
              { label: 'ค่าวัสดุ', value: materialCost, set: setMaterialCost },
            ].map(({ label, value, set }) => (
              <div key={label}>
                <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: '#374151' }}>{label} (฿)</div>
                <input type="number" min="0" value={value} onChange={e => set(e.target.value)} placeholder="0"
                  style={{ width: '100%', border: '1.5px solid #E5E7EB', borderRadius: 10, padding: '10px 12px', fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
          <button
            onClick={onClose}
            disabled={submitting}
            style={{ flex: 1, padding: '12px', borderRadius: 12, border: '1.5px solid #E5E7EB', background: 'white', fontSize: 14, fontWeight: 700, cursor: 'pointer', color: '#6B7280', fontFamily: 'inherit' }}
          >ยกเลิก</button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', background: 'var(--primary)', color: '#3D2C00', fontSize: 14, fontWeight: 800, cursor: submitting ? 'default' : 'pointer', fontFamily: 'inherit', opacity: submitting ? 0.6 : 1 }}
          >{submitting ? 'กำลังส่ง…' : 'ส่งคำขอแก้ไข'}</button>
        </div>
      </div>
    </div>
  )
}
