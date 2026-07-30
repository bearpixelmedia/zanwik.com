import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ProductCard from '@/components/ProductCard'
import { categories, products } from '@/lib/mock-data'
import { notFound } from 'next/navigation'

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const cat = categories.find(c => c.slug === params.slug)
  if (!cat) notFound()
  const catProducts = products.filter(p => p.category.slug === params.slug)

  return (
    <>
      <Header />
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">{cat.name}</h1>
          <p className="text-lg text-gray-600 mb-8">{cat.description}</p>
          {cat.subcategories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {cat.subcategories.map(sub => (
                <span key={sub.slug} className="bg-white border border-gray-200 text-sm px-3 py-1 rounded-full text-gray-600">{sub.name}</span>
              ))}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {catProducts.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
          {catProducts.length === 0 && (
            <p className="text-center text-gray-500 py-12">No products listed in this category yet.</p>
          )}
        </div>
      </section>
      <Footer />
    </>
  )
}
