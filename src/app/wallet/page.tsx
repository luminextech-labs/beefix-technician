'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { walletApi } from '@/lib/api'

export default function WalletPage() {
  const [wallet, setWallet] = useState<any>(null)
  const [txs, setTxs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    walletApi.get().then(r => {
      if (r.success) { setWallet(r.wallet); setTxs(r.transactions || []) }
    }).finally(() => setLoading(false))
  }, [])

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', paddingBottom: 80 }}>
      <div style={{ background: 'var(--primary)', padding: '16px 20px 60px', borderRadius: '0 0 24px 24px' }}>
        <div style={{ fontSize: 20, fontWeight: 700, color: '#3D2C00', marginBottom: 16 }}>💳 กระเป๋าเงิน</div>
        <div className="card-shadow" style={{ padding: 20, background: 'var(--primary-dark)', borderRadius: 16 }}>
          <div style={{ fontSize: 12, color: '#FFF8E7', marginBottom: 4 }}>ยอดเงินคงเหลือ</div>
          <div style={{ fontSize: 32, fontWeight: 700, color: '#3D2C00' }}>
            ฿{Number(wallet?.balance || 0).toLocaleString()}
          </div>
        </div>
      </div>

      <div style={{ padding: '20px 16px 0' }}>
        <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📜 รายการล่าสุด</div>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[...Array(3)].map((_, i) => <div key={i} style={{ height: 60, background: '#f0f0f0', borderRadius: 12 }} />)}
          </div>
        ) : txs.length === 0 ? (
          <div className="card-shadow" style={{ padding: 24, textAlign: 'center' }}>
            <div style={{ fontSize: 36, marginBottom: 8 }}>💰</div>
            <div style={{ fontWeight: 600 }}>ยังไม่มีรายการ</div>
          </div>
        ) : (
          <div className="card-shadow">
            {txs.map((tx: any, i: number) => (
              <div key={i} className="earning-row" style={{ padding: '12px 16px' }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{tx.description}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-light)' }}>
                    {new Date(tx.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                <div style={{ fontSize: 14, fontWeight: 700, color: Number(tx.amount) > 0 ? 'var(--green)' : 'var(--text)' }}>
                  {Number(tx.amount) > 0 ? '+' : ''}฿{Math.abs(Number(tx.amount)).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        <Link href="/withdrawals">
          <button className="btn-primary" style={{ background: 'var(--green)', color: 'white' }}>
            🏧 ถอนเงิน
          </button>
        </Link>
      </div>

      <div className="bottom-nav">
        <Link href="/dashboard" className="nav-item"><span className="nav-icon">🏠</span>หน้าแรก</Link>
        <Link href="/orders" className="nav-item"><span className="nav-icon">📋</span>งาน</Link>
        <Link href="/chat" className="nav-item"><span className="nav-icon">💬</span>แชท</Link>
        <Link href="/wallet" className="nav-item active"><span className="nav-icon">💳</span>กระเป๋า</Link>
        <Link href="/profile" className="nav-item"><span className="nav-icon">👤</span>โปรไฟล์</Link>
      </div>
    </div>
  )
}
