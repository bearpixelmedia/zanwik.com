'use client'

import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useState, FormEvent } from 'react'
import { products } from '@/lib/mock-data'

export default function ReviewPage() {
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <>
        <Header />
        <section className="py-16 bg-gray-50 min-h-screen">
          <div className="max-w-xl mx-auto text-center px-4">
            <div className="text-5xl text-primary mb-4">&#10003;</div>
            <h1 className="text-3xl font-bold text-gray-900">Review Submitted!</h1>
            <p className="mt-2 text-gray-600">Thank you for sharing your experience. Your review will be published after moderation.</p>
          </div>
        </section>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <section className="py-16 bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Write a Review</h1>
          <p className="text-gray-600 mb-8">Share your experience with a software product to help others make informed decisions.</p>
          <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
              <select required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none">
                <option value="">Select a product</option>
                {products.map(p => <option key={p._id} value={p.name}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
              <select required className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none">
                <option value="">Select rating</option>
                {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Star{r > 1 ? 's' : ''}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Review Title</label>
              <input required type="text" className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Your Review</label>
              <textarea required rows={5} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What do you like best?</label>
              <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">What do you like least?</label>
              <textarea rows={3} className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none"></textarea>
            </div>
            <button type="submit" className="w-full bg-primary text-white font-semibold py-3 rounded-lg hover:bg-primary-700 transition-colors">
              Submit Review
            </button>
          </form>
        </div>
      </section>
      <Footer />
    </>
  )
}
