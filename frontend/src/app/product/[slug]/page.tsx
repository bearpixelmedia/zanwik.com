import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ReviewCard from '@/components/ReviewCard'
import { products, reviews } from '@/lib/mock-data'
import { notFound } from 'next/navigation'
import Link from 'next/link'

export default function ProductPage({ params }: { params: { slug: string } }) {
  const product = products.find(p => p.slug === params.slug)
  if (!product) notFound()
  const productReviews = reviews.filter(r => r.product === product.name)

  return (
    <>
      <Header />
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:flex gap-12">
            <div className="lg:w-2/3">
              <div className="flex items-start gap-4 mb-6">
                <div className="w-16 h-16 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0 border">
                  <span className="text-2xl font-bold text-gray-700">{product.name.charAt(0)}</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
                  <p className="text-lg text-gray-600 mt-1">{product.tagline}</p>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => <span key={i}>{i < Math.floor(product.rating) ? '\u2605' : '\u2606'}</span>)}
                    </div>
                    <span className="font-medium text-gray-900">{product.rating}</span>
                    <span className="text-gray-400">({product.reviewCount} reviews)</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed mb-8">{product.description}</p>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Features</h2>
              <ul className="grid grid-cols-2 gap-2 mb-8">
                {product.features.map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-primary">&#10003;</span> {f}
                  </li>
                ))}
              </ul>
              <h2 className="text-xl font-semibold text-gray-900 mb-4">User Reviews</h2>
              {productReviews.length > 0 ? (
                <div className="space-y-4">
                  {productReviews.map(r => <ReviewCard key={r._id} review={r} />)}
                </div>
              ) : (
                <p className="text-gray-500">No reviews yet. Be the first to <Link href="/review" className="text-primary hover:underline">write a review</Link>.</p>
              )}
            </div>
            <div className="lg:w-1/3 mt-8 lg:mt-0">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-24">
                <p className="text-sm text-gray-500 mb-1">Pricing</p>
                <p className="text-lg font-semibold text-gray-900">{product.pricing}</p>
                <p className="text-sm text-gray-500 mt-3 mb-1">Category</p>
                <Link href={`/category/${product.category.slug}`} className="text-primary text-sm hover:underline">{product.category.name}</Link>
                <a href={product.website} target="_blank" rel="noopener noreferrer" className="mt-6 block w-full bg-primary text-white text-center font-semibold py-3 rounded-lg hover:bg-primary-700 transition-colors">
                  Visit Website
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  )
}
