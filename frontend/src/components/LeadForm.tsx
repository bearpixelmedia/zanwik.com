'use client'

import { useState, FormEvent } from 'react'

export default function LeadForm() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center px-4">
          <div className="text-5xl mb-4">&#10003;</div>
          <h2 className="text-2xl font-bold text-gray-900">Thank You!</h2>
          <p className="mt-2 text-gray-600">Our team will reach out within 24 hours with personalized software recommendations.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900">Need Help Deciding?</h2>
          <p className="mt-2 text-gray-600">Talk to solution experts for free. We&apos;ll help you find the right tools for your budget and needs.</p>
        </div>
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input required type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input required type="email" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input required type="tel" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Organization</label>
              <input required type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">What software are you looking for?</label>
            <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary focus:border-primary outline-none"></textarea>
          </div>
          <div className="mt-4 flex items-start gap-2">
            <input type="checkbox" id="consent" required className="mt-1" />
            <label htmlFor="consent" className="text-xs text-gray-500">I agree to receive marketing messages from Zanwik. By opting in, I agree to the Terms of Service and Privacy Policy.</label>
          </div>
          <button type="submit" className="mt-6 w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-700 transition-colors">
            Get Free Advice
          </button>
        </form>
      </div>
    </section>
  )
}
