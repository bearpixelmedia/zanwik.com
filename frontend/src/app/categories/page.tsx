import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { categories } from '@/lib/mock-data'

export default function CategoriesPage() {
  return (
    <>
      <Header />
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Top Software & Services</h1>
          <p className="text-lg text-gray-600 mb-12">Discover a curated selection of top software and services tailored to your needs.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map(cat => (
              <div key={cat._id} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-primary text-xl font-bold">{cat.name.charAt(0)}</span>
                </div>
                <h2 className="text-xl font-semibold text-gray-900 mb-2">{cat.name}</h2>
                <p className="text-sm text-gray-500 mb-4">{cat.description}</p>
                <ul className="space-y-2 mb-4">
                  {cat.subcategories.slice(0, 3).map(sub => (
                    <li key={sub.slug}>
                      <Link href={`/category/${cat.slug}/${sub.slug}`} className="text-sm text-primary hover:underline">{sub.name}</Link>
                    </li>
                  ))}
                </ul>
                <Link href={`/category/${cat.slug}`} className="text-sm font-semibold text-primary hover:underline">
                  Browse All {cat.name} &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
