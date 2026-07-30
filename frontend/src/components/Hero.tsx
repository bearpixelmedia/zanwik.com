import Link from 'next/link'

export default function Hero() {
  return (
    <section className="bg-gradient-to-br from-primary-900 via-primary to-primary-700 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28">
        <div className="max-w-3xl">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
            Find the Right Software for Your Business—Faster
          </h1>
          <p className="mt-6 text-lg md:text-xl text-primary-100">
            Save time comparing software options, make decisions based on unbiased reviews, and get expert advice.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link href="/categories" className="bg-white text-primary font-semibold px-8 py-3 rounded-lg text-center hover:bg-gray-100 transition-colors shadow-lg">
              Browse Categories
            </Link>
            <Link href="/recommendation" className="bg-accent text-white font-semibold px-8 py-3 rounded-lg text-center hover:bg-accent-600 transition-colors shadow-lg">
              Get Free Recommendation
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
