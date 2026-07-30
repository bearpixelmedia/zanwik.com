import { NextResponse } from 'next/server'
import { products } from '@/lib/mock-data'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  let result = products
  if (category) result = result.filter(p => p.category.slug === category)
  return NextResponse.json(result)
}
