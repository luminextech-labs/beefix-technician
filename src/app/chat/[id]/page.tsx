'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { chatApi } from '@/lib/api'

export default function ChatRoomPage() {
  const params = useParams()
  const router = useRouter()
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [otherName, setOtherName] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const load = () => {
    chatApi.getMessages(params.id as string).then(r => {
      if (r.success) {
        setMessages(r.messages)
        if (r.messages.length > 0) {
          setOtherName(r.messages[0].sender?.fullName || 'ลูกค้า')
        }
      }
    })
  }

  useEffect(() => {
    load()
    const i = setInterval(load, 3000)
    return () => clearInterval(i)
  }, [params.id])

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const send = async () => {
    if (!input.trim() || sending) return
    setSending(true)
    const res = await chatApi.sendMessage(params.id as string, input.trim())
    if (res.success) setMessages(p => [...p, res.message])
    setInput('')
    setSending(false)
  }

  return (
    <div style={{ background: 'var(--bg)', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* HEADER */}
      <div style={{ background: 'var(--primary)', padding: '12px 16px', display: 'flex', gap: 12, alignItems: 'center', flexShrink: 0, borderRadius: '0 0 24px 24px' }}>
        <button onClick={() => router.push('/chat')} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#3D2C00' }}>←</button>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 700, color: '#3D2C00' }}>{otherName}</div>
      </div>

      {/* MESSAGES */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 12px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', marginTop: 60, color: 'var(--text-light)', fontSize: 14 }}>
            เริ่มสนทนาได้เลย 👋
          </div>
        )}
        {messages.map(msg => {
          const isMine = msg.senderId !== JSON.parse(atob(localStorage.getItem('tech_token')?.split('.')[1] || 'ey=='))?.sub
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 6, maxWidth: '80%', flexDirection: isMine ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                {!isMine && <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{msg.sender?.fullName?.charAt(0)}</div>}
                {msg.messageType === 'image' ? (
                  <div style={{ background: 'white', borderRadius: 14, padding: 3, boxShadow: 'var(--shadow)' }}>
                    <img src={msg.message} alt="รูป" style={{ borderRadius: 12, maxWidth: 220, maxHeight: 220, objectFit: 'cover' }} onError={e => (e.currentTarget.style.display='none')} />
                  </div>
                ) : (
                  <div style={{ background: isMine ? 'var(--primary)' : 'white', padding: '10px 14px', borderRadius: 16, fontSize: 14, boxShadow: 'var(--shadow)', color: isMine ? '#3D2C00' : 'var(--text)' }}>
                    {msg.message}
                  </div>
                )}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-light)', marginTop: 2, paddingLeft: 8, paddingRight: 8 }}>{new Date(msg.createdAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* INPUT */}
      <div style={{ background: 'white', borderTop: '1px solid var(--border)', padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'flex-end', flexShrink: 0 }}>
        <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} placeholder="พิมพ์ข้อความ..." rows={1} style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px', fontSize: 14, fontFamily: 'Prompt, sans-serif', resize: 'none', outline: 'none', maxHeight: 100, overflowY: 'auto' }} />
        <button onClick={send} disabled={!input.trim() || sending} style={{ width: 42, height: 42, borderRadius: 12, background: input.trim() ? 'var(--primary)' : 'var(--border)', border: 'none', fontSize: 18, cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {sending ? '...' : '↑'}
        </button>
      </div>
    </div>
  )
}
