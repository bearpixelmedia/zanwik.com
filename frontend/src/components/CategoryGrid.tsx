import Link from 'next/link'
import { Category } from '@/types'

export default function CategoryGrid({ categories }: { categories: Category[] }) {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">Choose from 100,000+ Software Options</h2>
          <p className="mt-4 text-gray-600">Browse our most popular categories to find the right software for your business.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map(cat => (
            <Link key={cat._id} href={`/category/${cat.slug}`} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow border border-gray-100">
              <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                <span className="text-primary text-xl font-bold">{cat.name.charAt(0)}</span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{cat.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{cat.productCount}+ products</p>
            </Link>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/categories" className="text-primary font-semibold hover:underline">
            View All Categories &rarr;
          </Link>
        </div>
      </div>
    </section>
  )
}
