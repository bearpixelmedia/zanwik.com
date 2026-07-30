import { NextResponse } from 'next/server'
import { reviews } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const product = searchParams.get('product')
  let result = reviews
  if (product) result = result.filter(r => r.product === product)
  return NextResponse.json(result)
}

export async function POST(request: Request) {
  const body = await request.json()
  const review = { _id: `r${Date.now()}`, ...body, createdAt: new Date().toISOString().split('T')[0] }
  reviews.push(review)
  return NextResponse.json(review, { status: 201 })
}
