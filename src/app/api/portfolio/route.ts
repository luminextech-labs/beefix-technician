import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://beefix-web.vercel.app'

// GET /api/portfolio?technicianId=xxx - public
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const technicianId = searchParams.get('technicianId')
    const res = await fetch(`${API_URL}/api/technicians/portfolio?technicianId=${technicianId || ''}`, {
      headers: { 'Content-Type': 'application/json' },
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}

// POST /api/portfolio - create portfolio item (auth required)
export async function POST(req: NextRequest) {
  try {
    const token = req.headers.get('authorization') || ''
    const body = await req.json()
    const res = await fetch(`${API_URL}/api/technicians/portfolio`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', authorization: token },
      body: JSON.stringify(body),
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
