import Header from '@/components/Header'
import Footer from '@/components/Footer'
import LeadForm from '@/components/LeadForm'
import Link from 'next/link'

export default function ForVendorsPage() {
  return (
    <>
      <Header />
      <section className="bg-gradient-to-br from-primary-900 via-primary to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold">Grow Your Software Business</h1>
          <p className="mt-4 text-xl text-primary-100 max-w-2xl mx-auto">Get sales-ready leads at 30% lower cost and increase brand awareness with buyers actively looking for solutions.</p>
        </div>
      </section>
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Get Sales-Ready Leads Without The Wait</h2>
              <p className="text-gray-600 mb-6">Our lead generation service connects you with businesses actively searching for software like yours. Pay only for qualified leads that match your criteria.</p>
              <Link href="/contact" className="inline-block bg-primary text-white font-semibold px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors">Get More Leads</Link>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Claim Your Profile</h2>
              <p className="text-gray-600 mb-6">Make your software stand out. Claim your Zanwik profile, add product details, screenshots, and respond to reviews to attract more buyers.</p>
              <Link href="/contact" className="inline-block bg-accent text-white font-semibold px-6 py-3 rounded-lg hover:bg-accent-600 transition-colors">Claim Now & Get Seen!</Link>
            </div>
          </div>
        </div>
      </section>
      <LeadForm />
      <Footer />
    </>
  )
}
