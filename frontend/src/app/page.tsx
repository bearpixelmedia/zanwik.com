import Header from '@/components/Header'
import Hero from '@/components/Hero'
import CategoryGrid from '@/components/CategoryGrid'
import ProductCard from '@/components/ProductCard'
import TestimonialSection from '@/components/TestimonialSection'
import LeadForm from '@/components/LeadForm'
import Footer from '@/components/Footer'
import { categories, products, testimonials } from '@/lib/mock-data'

export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <CategoryGrid categories={categories} />
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Software</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 8).map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        </div>
      </section>
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Success Stories</h2>
          {testimonials.map(t => <TestimonialSection key={t.name} testimonial={t} />)}
        </div>
      </section>
      <LeadForm />
      <Footer />
    </>
  )
}
