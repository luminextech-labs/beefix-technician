import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://beefix-web.vercel.app'

export async function GET(req: NextRequest) {
  try {
    const token = req.headers.get('authorization') || ''
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const query = status ? `?status=${status}` : ''
    const res = await fetch(`${API_URL}/api/orders${query}`, {
      headers: { 'Content-Type': 'application/json', authorization: token },
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
