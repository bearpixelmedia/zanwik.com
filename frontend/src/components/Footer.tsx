import Link from 'next/link'

const footerLinks = {
  'Top Categories': [
    { href: '/crm', label: 'CRM Software' },
    { href: '/hr', label: 'HR Software' },
    { href: '/emr-software', label: 'EMR Software' },
    { href: '/lms', label: 'LMS Software' },
    { href: '/accounting-software', label: 'Accounting Software' },
    { href: '/project-management', label: 'Project Management' },
  ],
  Company: [
    { href: '/about', label: 'About Us' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/for-vendors', label: 'For Vendors' },
  ],
  Resources: [
    { href: '/resources', label: 'Resource Center' },
    { href: '/categories', label: 'All Categories' },
    { href: '/review', label: 'Write a Review' },
  ]
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-xl font-bold text-white">Zanwik</Link>
            <p className="mt-3 text-sm text-gray-400">Right selection to grow your business</p>
            <p className="mt-4 text-sm">info@zanwik.com</p>
          </div>
          {Object.entries(footerLinks).map(([heading, links]) => (
            <div key={heading}>
              <h3 className="text-sm font-semibold text-white mb-4">{heading}</h3>
              <ul className="space-y-3">
                {links.map(l => (
                  <li key={l.href}><Link href={l.href} className="text-sm hover:text-white transition-colors">{l.label}</Link></li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500">Zanwik &copy; 2026 All Rights Reserved</p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-gray-500 hover:text-white">Privacy Policy</Link>
            <Link href="/terms" className="text-gray-500 hover:text-white">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
