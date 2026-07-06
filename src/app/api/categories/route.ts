import { NextResponse } from 'next/server'

const WEB_API = process.env.NEXT_PUBLIC_API_URL || 'https://beefix-web.vercel.app'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const res = await fetch(`${WEB_API}/api/categories`, {
      headers: { 'Content-Type': 'application/json' },
      next: { revalidate: 60 },
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด', categories: [] }, { status: 500 })
  }
}
