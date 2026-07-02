'use client'
import { useEffect, useState, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { chatApi, uploadApi } from '@/lib/api'

export default function ChatRoomPage() {
  const params = useParams()
  const router = useRouter()
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [uploadingImage, setUploadingImage] = useState(false)
  const [otherName, setOtherName] = useState('')
  const [myId, setMyId] = useState<string>('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const token = localStorage.getItem('tech_token')
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]))
        setMyId(payload.sub || payload.userId || '')
      } catch {}
    }
  }, [])

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

  const sendText = async () => {
    if (!input.trim() || sending) return
    setSending(true)
    const res = await chatApi.sendMessage(params.id as string, input.trim())
    if (res.success) setMessages(p => [...p, res.message])
    setInput('')
    setSending(false)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || uploadingImage) return
    setUploadingImage(true)
    try {
      const res = await uploadApi.image(file, 'chat')
      if (res.success && res.url) {
        const msgRes = await chatApi.sendMessage(params.id as string, res.url, 'image')
        if (msgRes.success) setMessages(p => [...p, msgRes.message])
      }
    } finally {
      setUploadingImage(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
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
          const isMine = msg.isMine || msg.senderId === myId
          return (
            <div key={msg.id} style={{ display: 'flex', flexDirection: 'column', alignItems: isMine ? 'flex-end' : 'flex-start', marginBottom: 12 }}>
              <div style={{ display: 'flex', gap: 6, maxWidth: '80%', flexDirection: isMine ? 'row-reverse' : 'row', alignItems: 'flex-end' }}>
                {!isMine && <div style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, flexShrink: 0 }}>{msg.sender?.fullName?.charAt(0)}</div>}
                {msg.messageType === 'image' ? (
                  <div style={{ background: 'white', borderRadius: 14, padding: 3, boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                    <img src={msg.message} alt="รูป" style={{ borderRadius: 12, maxWidth: 220, maxHeight: 220, objectFit: 'cover', cursor: 'pointer' }}
                      onClick={() => window.open(msg.message, '_blank')}
                      onError={e => (e.currentTarget.style.display='none')} />
                  </div>
                ) : (
                  <div style={{ background: isMine ? 'var(--primary)' : 'white', padding: '10px 14px', borderRadius: 16, fontSize: 14, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', color: isMine ? '#3D2C00' : 'var(--text)' }}>
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
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleImageUpload}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingImage}
          style={{ width: 40, height: 40, borderRadius: 12, border: 'none', background: 'var(--primary-light)', fontSize: 18, cursor: uploadingImage ? 'default' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          {uploadingImage ? '⏳' : '🖼️'}
        </button>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendText() } }}
          placeholder="พิมพ์ข้อความ..."
          rows={1}
          style={{ flex: 1, border: '1px solid var(--border)', borderRadius: 12, padding: '10px 12px', fontSize: 14, fontFamily: 'Prompt, sans-serif', resize: 'none', outline: 'none', maxHeight: 100, overflowY: 'auto' }}
        />
        <button
          onClick={sendText}
          disabled={!input.trim() || sending}
          style={{ width: 42, height: 42, borderRadius: 12, background: input.trim() ? 'var(--primary)' : 'var(--border)', border: 'none', fontSize: 18, cursor: input.trim() ? 'pointer' : 'default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {sending ? '...' : '↑'}
        </button>
      </div>
    </div>
  )
}
