import Link from 'next/link'
import { Product } from '@/types'

export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.slug}`} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100 flex flex-col">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
          <span className="text-gray-600 font-bold text-lg">{product.name.charAt(0)}</span>
        </div>
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 truncate">{product.name}</h3>
          <p className="text-sm text-gray-500 line-clamp-1">{product.tagline}</p>
        </div>
      </div>
      <div className="mt-3 flex items-center gap-2 text-sm">
        <span className="text-yellow-500">&#9733;</span>
        <span className="font-medium">{product.rating}</span>
        <span className="text-gray-400">({product.reviewCount} reviews)</span>
      </div>
      <p className="text-xs text-gray-400 mt-1">{product.pricing}</p>
    </Link>
  )
}
