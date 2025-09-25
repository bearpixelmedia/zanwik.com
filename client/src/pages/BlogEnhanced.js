import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import StructuredData from '../components/StructuredData';

const BlogEnhanced = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading blog posts
    const mockPosts = [
      {
        id: 1,
        title: "The Complete Guide to API Integration for Entrepreneurs",
        excerpt: "Learn how to integrate APIs into your business applications with our comprehensive guide covering authentication, error handling, and best practices.",
        slug: "api-integration-guide-2024",
        date: "2024-01-15",
        readTime: "8 min read",
        category: "Tutorial",
        featured: true,
        image: "/api-integration-guide.jpg"
      },
      {
        id: 2,
        title: "Top 10 APIs Every Startup Should Know About",
        excerpt: "Discover the essential APIs that can accelerate your startup's growth, from payment processing to communication tools.",
        slug: "top-10-apis-startup",
        date: "2024-01-12",
        readTime: "6 min read",
        category: "List",
        featured: false,
        image: "/startup-apis.jpg"
      },
      {
        id: 3,
        title: "API Security Best Practices: Protect Your Data",
        excerpt: "Essential security practices for API development and integration. Learn how to protect your applications and user data.",
        slug: "api-security-best-practices",
        date: "2024-01-10",
        readTime: "7 min read",
        category: "Security",
        featured: false,
        image: "/api-security.jpg"
      }
    ];

    setPosts(mockPosts);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>API Blog - Zanwik API Directory</title>
        <meta name="description" content="Latest insights, tutorials, and best practices for API development. Learn from our comprehensive guides and expert tips." />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Zanwik API Blog",
            "description": "Latest insights, tutorials, and best practices for API development",
            "url": "https://www.zanwik.com/blog",
            "publisher": {
              "@type": "Organization",
              "name": "Zanwik",
              "url": "https://www.zanwik.com"
            },
            "blogPost": posts.map(post => ({
              "@type": "BlogPosting",
              "headline": post.title,
              "description": post.excerpt,
              "url": `https://www.zanwik.com/blog/${post.slug}`,
              "datePublished": post.date,
              "author": {
                "@type": "Organization",
                "name": "Zanwik"
              },
              "publisher": {
                "@type": "Organization",
                "name": "Zanwik"
              }
            }))
          })}
        </script>
      </Helmet>

      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-blue-600 hover:text-blue-800 font-medium">← Back to API Directory</Link>
            </div>
            <div className="flex space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Breadcrumbs */}
      <nav className="bg-gray-100 py-3" aria-label="Breadcrumb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li><Link to="/" className="hover:text-blue-600">Home</Link></li>
            <li className="flex items-center">
              <svg className="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              <span className="text-gray-900 font-medium">Blog</span>
            </li>
          </ol>
        </div>
      </nav>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <h1 className="text-4xl font-bold text-gray-900">API Blog</h1>
            <p className="mt-2 text-lg text-gray-600">Latest insights, tutorials, and best practices for API development</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Featured Post */}
        {posts.filter(post => post.featured).length > 0 && (
          <section className="mb-12">
            <h2 className="sr-only">Featured Article</h2>
            {posts.filter(post => post.featured).map(featuredPost => (
              <div key={featuredPost.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <img 
                      src={featuredPost.image} 
                      alt={featuredPost.title}
                      className="w-full h-64 md:h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
                      }}
                    />
                  </div>
                  <div className="md:w-1/2 p-8">
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                        {featuredPost.category}
                      </span>
                      <span className="text-gray-500 text-sm">{featuredPost.readTime}</span>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">
                      <Link to={`/blog/${featuredPost.slug}`} className="hover:text-blue-600 transition-colors">
                        {featuredPost.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 mb-6">{featuredPost.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">{featuredPost.date}</span>
                      <Link 
                        to={`/blog/${featuredPost.slug}`}
                        className="text-blue-600 hover:text-blue-800 font-medium"
                      >
                        Read More →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Blog Posts Grid */}
        <section>
          <h2 className="sr-only">All Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.filter(post => !post.featured).map((post) => (
              <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <img 
                  src={post.image} 
                  alt={post.title}
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80';
                  }}
                />
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="bg-gray-100 text-gray-800 text-sm font-medium px-2.5 py-0.5 rounded">
                      {post.category}
                    </span>
                    <span className="text-gray-500 text-sm">{post.readTime}</span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    <Link to={`/blog/${post.slug}`} className="hover:text-blue-600 transition-colors">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{post.date}</span>
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default BlogEnhanced;
