import { NextResponse } from 'next/server'

const leads: any[] = []

export async function POST(request: Request) {
  const body = await request.json()
  const lead = { _id: `l${Date.now()}`, ...body, status: 'new', createdAt: new Date().toISOString() }
  leads.push(lead)
  return NextResponse.json(lead, { status: 201 })
}

export async function GET() {
  return NextResponse.json(leads)
}
