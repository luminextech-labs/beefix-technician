'use client'
import { useEffect, useState } from 'react'
import { walletApi } from '@/lib/api'

export default function WithdrawalsPage() {
  const [withdrawals, setWithdrawals] = useState<any[]>([])
  const [walletBal, setWalletBal] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    walletApi.get().then(r => {
      if (r.success) {
        setWalletBal(Number(r.wallet?.balance || 0))
        setWithdrawals((r.transactions || []).filter((t: any) => t.type === 'withdrawal'))
      }
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ background: 'var(--primary)', padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center', borderRadius: '0 0 24px 24px' }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: '#3D2C00', flex: 1 }}>🏧 ถอนเงิน</div>
        <div style={{ fontSize: 14, fontWeight: 600, color: '#3D2C00' }}>฿{walletBal.toLocaleString()}</div>
      </div>

      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📜 รายการถอน</div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>{[...Array(3)].map((_, i) => <div key={i} style={{ height: 60, background: '#f0f0f0', borderRadius: 12 }} />)}</div>
        ) : withdrawals.length === 0 ? (
          <div className="card-shadow" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>🏧</div>
            <div style={{ fontWeight: 600 }}>ยังไม่มีรายการถอน</div>
          </div>
        ) : (
          <div className="card-shadow">
            {withdrawals.map((w: any, i: number) => (
              <div key={i} className="earning-row" style={{ padding: '12px 16px' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{w.description || 'ถอนเงิน'}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-light)' }}>{new Date(w.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--green)' }}>-฿{Math.abs(Number(w.amount)).toLocaleString()}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
