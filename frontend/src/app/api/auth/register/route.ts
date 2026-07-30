import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const { email, name } = await request.json()
  const token = Buffer.from(`${email}-${Date.now()}`).toString('base64')
  return NextResponse.json({ token, user: { id: Date.now().toString(), name, email, role: 'user' } }, { status: 201 })
}
