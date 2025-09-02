import React from 'react';

const Admin = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <img src="/zanwik-icon.svg" alt="Zanwik" className="h-8 w-8 mr-3" />
              <span className="text-2xl font-bold text-gray-900">Zanwik</span>
            </div>
            <div className="hidden md:flex space-x-8">
              <a href="/apis" className="text-gray-600 hover:text-gray-900 font-medium">APIs</a>
              <a href="#features" className="text-gray-600 hover:text-gray-900 font-medium">Features</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 font-medium">About</a>
              <a href="#contact" className="text-gray-600 hover:text-gray-900 font-medium">Contact</a>
            </div>
            <a 
              href="/dashboard" 
              className="bg-black text-white px-6 py-2 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Dashboard
            </a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Enterprise SaaS Solutions
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed">
            Streamline operations, boost productivity, and scale with confidence. Zanwik provides the tools you need to build and manage successful SaaS ventures.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="/dashboard" 
              className="bg-black text-white px-8 py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Get Started
            </a>
            <a 
              href="#features" 
              className="border border-gray-300 text-gray-900 px-8 py-4 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Learn More
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose Zanwik?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Built for modern businesses that demand excellence in every aspect of their operations.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:border-black transition-colors hover:-translate-y-1 transform">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white text-xl mb-6">
                ⚡
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                Optimized performance ensures your applications run smoothly at any scale, providing the best user experience possible.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:border-black transition-colors hover:-translate-y-1 transform">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white text-xl mb-6">
                🔒
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Enterprise Security</h3>
              <p className="text-gray-600 leading-relaxed">
                Bank-level security protocols protect your data and ensure compliance with industry standards and regulations.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:border-black transition-colors hover:-translate-y-1 transform">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white text-xl mb-6">
                📊
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Advanced Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Comprehensive insights and real-time monitoring help you make data-driven decisions and optimize performance.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:border-black transition-colors hover:-translate-y-1 transform">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white text-xl mb-6">
                🚀
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Scalable Infrastructure</h3>
              <p className="text-gray-600 leading-relaxed">
                Built to grow with your business, our infrastructure automatically scales to meet your changing needs.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:border-black transition-colors hover:-translate-y-1 transform">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white text-xl mb-6">
                🛠️
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Developer Friendly</h3>
              <p className="text-gray-600 leading-relaxed">
                Modern APIs and comprehensive documentation make integration seamless for your development team.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:border-black transition-colors hover:-translate-y-1 transform">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white text-xl mb-6">
                💼
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">Business Focused</h3>
              <p className="text-gray-600 leading-relaxed">
                Every feature is designed with business outcomes in mind, helping you achieve your strategic goals.
              </p>
            </div>
            
            <div className="bg-gray-50 p-8 rounded-xl border border-gray-200 hover:border-black transition-colors hover:-translate-y-1 transform">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-white text-xl mb-6">
                🔌
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">API Directory</h3>
              <p className="text-gray-600 leading-relaxed">
                Discover and test thousands of APIs with our comprehensive directory, testing tools, and developer resources.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Built for Success</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Zanwik is more than just a platform—it's a comprehensive solution designed to help businesses thrive in the digital age. We understand the challenges modern companies face and provide the tools needed to overcome them.
              </p>
              <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                Our team of experts has years of experience building and scaling successful SaaS ventures. We've distilled that knowledge into a platform that empowers you to focus on what matters most: growing your business.
              </p>
              
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">99.9%</div>
                  <div className="text-sm text-gray-600 font-medium">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">24/7</div>
                  <div className="text-sm text-gray-600 font-medium">Support</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">500+</div>
                  <div className="text-sm text-gray-600 font-medium">Companies</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-gray-900 mb-2">50M+</div>
                  <div className="text-sm text-gray-600 font-medium">API Calls</div>
                </div>
              </div>
            </div>
            
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">Trusted by Industry Leaders</h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                From startups to Fortune 500 companies, businesses of all sizes trust Zanwik to power their critical operations. Our platform has been battle-tested in the most demanding environments.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                We're committed to continuous improvement and innovation, ensuring that our platform evolves with your business needs. When you choose Zanwik, you're choosing a partner for long-term success.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Get in Touch</h2>
            <p className="text-xl text-gray-600">
              Ready to transform your business? Let's discuss how Zanwik can help you achieve your goals.
            </p>
          </div>
          
          <form className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <input
                type="text"
                id="company"
                name="company"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                Message
              </label>
              <textarea
                id="message"
                name="message"
                rows={6}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="w-full bg-black text-white py-4 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
            >
              Send Message
            </button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-lg font-semibold mb-4">Zanwik</h3>
              <p className="text-gray-400 leading-relaxed">
                Enterprise SaaS solutions for modern businesses. Streamline operations, boost productivity, and scale with confidence.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <div className="space-y-2">
                <a href="#features" className="block text-gray-400 hover:text-white transition-colors">Features</a>
                <a href="/dashboard" className="block text-gray-400 hover:text-white transition-colors">Dashboard</a>
                <a href="#about" className="block text-gray-400 hover:text-white transition-colors">About</a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <div className="space-y-2">
                <a href="#contact" className="block text-gray-400 hover:text-white transition-colors">Contact</a>
                <a href="/dashboard" className="block text-gray-400 hover:text-white transition-colors">Documentation</a>
                <a href="/dashboard" className="block text-gray-400 hover:text-white transition-colors">Status</a>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <div className="space-y-2">
                <a href="#about" className="block text-gray-400 hover:text-white transition-colors">About Us</a>
                <a href="#contact" className="block text-gray-400 hover:text-white transition-colors">Careers</a>
                <a href="#contact" className="block text-gray-400 hover:text-white transition-colors">Privacy</a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>&copy; 2024 Zanwik. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Admin;
