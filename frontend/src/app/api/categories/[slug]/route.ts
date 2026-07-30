import { NextResponse } from 'next/server'
import { categories } from '@/lib/mock-data'

export async function GET(_request: Request, { params }: { params: { slug: string } }) {
  const cat = categories.find(c => c.slug === params.slug)
  if (!cat) return NextResponse.json({ error: 'Category not found' }, { status: 404 })
  return NextResponse.json(cat)
}
