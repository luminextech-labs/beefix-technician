'use client'

import Link from 'next/link'

interface BackButtonProps {
  href?: string
  onClick?: () => void
  style?: React.CSSProperties
  light?: boolean
}

export default function BackButton({ href, onClick, style, light }: BackButtonProps) {
  const content = (
    <div style={{
      width: 36, height: 36, borderRadius: '50%',
      background: light ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.08)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', flexShrink: 0,
      border: light ? '1.5px solid rgba(255,255,255,0.5)' : 'none',
      ...style,
    }}>
      {/* Chevron left icon inside circle */}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
        <path d="M15 18L9 12L15 6" stroke={light ? 'white' : '#3D2C00'} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
      {content}
    </button>
  )
}
