import { Testimonial } from '@/types'

export default function TestimonialSection({ testimonial }: { testimonial: Testimonial }) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="md:flex items-center gap-12">
          <div className="md:w-1/3 mb-8 md:mb-0">
            <div className="w-24 h-24 bg-primary-50 rounded-full flex items-center justify-center mb-4">
              <span className="text-3xl text-primary font-bold">{testimonial.name.charAt(0)}</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900">{testimonial.name}</h3>
            <p className="text-gray-500">{testimonial.company}</p>
            <p className="text-gray-500 text-sm">{testimonial.role}</p>
          </div>
          <div className="md:w-2/3">
            <svg className="w-8 h-8 text-primary mb-4" fill="currentColor" viewBox="0 0 32 32">
              <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z"/>
            </svg>
            <p className="text-lg text-gray-700 leading-relaxed">{testimonial.quote}</p>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {testimonial.stats.map(stat => (
                <div key={stat.label} className="bg-primary-50 rounded-lg p-4 text-center">
                  <p className="text-2xl font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-gray-600 mt-1">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
