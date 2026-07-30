import Header from '@/components/Header'
import Footer from '@/components/Footer'
import Link from 'next/link'
import { resources } from '@/lib/mock-data'

export default function ResourcesPage() {
  return (
    <>
      <Header />
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Resource Center</h1>
          <p className="text-lg text-gray-600 mb-12">Insights, guides, and reports to help you make smarter software decisions.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map(r => (
              <Link key={r._id} href={`/resources/${r.slug}`} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-sm">Image</div>
                <div className="p-6">
                  <span className="text-xs font-medium text-primary bg-primary-50 px-2 py-1 rounded-full">{r.category}</span>
                  <h2 className="mt-3 text-lg font-semibold text-gray-900">{r.title}</h2>
                  <p className="mt-2 text-sm text-gray-600 line-clamp-2">{r.excerpt}</p>
                  <p className="mt-4 text-xs text-gray-400">{r.date} &middot; {r.author}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
