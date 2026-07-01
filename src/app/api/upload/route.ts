import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://beefix-web.vercel.app'

export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization') || ''
    const formData = await req.formData()
    const res = await fetch(`${API_URL}/api/upload`, {
      method: 'POST',
      headers: { authorization: token },
      body: formData,
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
