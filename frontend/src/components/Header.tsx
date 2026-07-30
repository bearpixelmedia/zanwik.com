'use client'

import Link from 'next/link'
import { useState } from 'react'
import clsx from 'clsx'

const navLinks = [
  { href: '/categories', label: 'Software Categories' },
  { href: '/for-vendors', label: 'For Vendors' },
  { href: '/resources', label: 'Resource Center' },
  { href: '/review', label: 'Write a Review' }
]

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary">Zanwik</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} className="text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                {l.label}
              </Link>
            ))}
          </nav>
          <div className="hidden md:flex items-center gap-3">
            <Link href="https://my.zanwik.com/login" className="text-sm font-medium text-gray-700 hover:text-primary">
              Log In
            </Link>
            <Link href="https://my.zanwik.com/signup" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
              Join Free
            </Link>
          </div>
          <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        {open && (
          <div className="md:hidden pb-4 border-t border-gray-100 pt-4">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} className="block py-2 text-sm font-medium text-gray-700 hover:text-primary" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col gap-2">
              <Link href="https://my.zanwik.com/login" className="text-sm font-medium text-gray-700 hover:text-primary py-2">Log In</Link>
              <Link href="https://my.zanwik.com/signup" className="bg-primary text-white text-center px-4 py-2 rounded-lg text-sm font-medium">Join Free</Link>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
