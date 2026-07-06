import { NextRequest, NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://beefix-web.vercel.app'

// DELETE /api/portfolio?id=xxx - delete portfolio item (auth required)
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { searchParams } = new URL(req.url)
    const itemId = searchParams.get('id')
    if (!itemId) return NextResponse.json({ success: false, message: 'ต้องระบุ id' }, { status: 400 })

    const token = req.headers.get('authorization') || ''
    const res = await fetch(`${API_URL}/api/technicians/portfolio/${itemId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', authorization: token },
    })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json({ success: false, message: 'เกิดข้อผิดพลาด' }, { status: 500 })
  }
}
