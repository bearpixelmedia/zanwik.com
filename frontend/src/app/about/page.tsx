import Header from '@/components/Header'
import Footer from '@/components/Footer'

export default function AboutPage() {
  return (
    <>
      <Header />
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-6">About Zanwik</h1>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Zanwik helps businesses find the right software through unbiased reviews, expert advice, and personalized recommendations. We believe that choosing software shouldn&apos;t be overwhelming — it should be informed, efficient, and confident.
          </p>
          <p className="text-gray-700 leading-relaxed mb-6">
            Our platform features thousands of verified user reviews across dozens of software categories, from CRM and HR to healthcare IT and project management. We help both buyers and sellers connect more effectively.
          </p>
          <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">Our Mission</h2>
          <p className="text-gray-700 leading-relaxed">
            To simplify the software selection process for businesses of all sizes, saving time and money while ensuring the right technology choices.
          </p>
        </div>
      </section>
      <Footer />
    </>
  )
}
