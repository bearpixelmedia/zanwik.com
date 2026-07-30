import { NextResponse } from 'next/server'
import { products } from '@/lib/mock-data'

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const product = products.find(p => p.slug === params.slug)
  if (!product) return NextResponse.json({ error: 'Product not found' }, { status: 404 })
  return NextResponse.json(product)
}
