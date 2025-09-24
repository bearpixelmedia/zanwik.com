import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import StructuredData from '../components/StructuredData';

const Blog = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading blog posts
    const mockPosts = [
      {
        id: 1,
        title: "The Complete Guide to API Integration for Entrepreneurs",
        excerpt: "Learn how to integrate APIs into your business applications with our comprehensive guide covering authentication, error handling, and best practices.",
        slug: "complete-guide-api-integration-entrepreneurs",
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
        slug: "top-10-apis-startup-should-know",
        date: "2024-01-12",
        readTime: "6 min read",
        category: "List",
        featured: false,
        image: "/startup-apis.jpg"
      },
      {
        id: 3,
        title: "API Security Best Practices: Protecting Your Data",
        excerpt: "Essential security practices for API integration including authentication, rate limiting, and data protection strategies.",
        slug: "api-security-best-practices",
        date: "2024-01-10",
        readTime: "10 min read",
        category: "Security",
        featured: false,
        image: "/api-security.jpg"
      },
      {
        id: 4,
        title: "How to Test APIs Effectively: A Developer's Guide",
        excerpt: "Master API testing with our comprehensive guide covering unit testing, integration testing, and automated testing strategies.",
        slug: "how-to-test-apis-effectively",
        date: "2024-01-08",
        readTime: "7 min read",
        category: "Testing",
        featured: false,
        image: "/api-testing.jpg"
      },
      {
        id: 5,
        title: "Building a Successful API-First Business",
        excerpt: "Learn how to build and scale an API-first business model, from initial development to monetization strategies.",
        slug: "building-successful-api-first-business",
        date: "2024-01-05",
        readTime: "12 min read",
        category: "Business",
        featured: true,
        image: "/api-business.jpg"
      },
      {
        id: 6,
        title: "REST vs GraphQL: Which Should You Choose?",
        excerpt: "Compare REST and GraphQL APIs to make the right choice for your project. We break down the pros and cons of each approach.",
        slug: "rest-vs-graphql-which-choose",
        date: "2024-01-03",
        readTime: "9 min read",
        category: "Comparison",
        featured: false,
        image: "/rest-vs-graphql.jpg"
      }
    ];

    setTimeout(() => {
      setPosts(mockPosts);
      setLoading(false);
    }, 1000);
  }, []);

  const featuredPosts = posts.filter(post => post.featured);
  const regularPosts = posts.filter(post => !post.featured);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data */}
      <StructuredData type="website" />
      
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Zanwik Developer Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Learn API integration, discover new tools, and stay updated with the latest in developer resources and business automation.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Featured Posts */}
        {featuredPosts.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Featured Articles</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map(post => (
                <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="h-48 bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-4xl font-bold">{post.category}</span>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-3">
                      <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                        {post.category}
                      </span>
                      <span className="text-gray-500 text-sm ml-3">{post.readTime}</span>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      <Link to={`/blog/${post.slug}`} className="hover:text-blue-600">
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
          </div>
        )}

        {/* Regular Posts */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Latest Articles</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map(post => (
              <article key={post.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                <div className="h-40 bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-bold">{post.category}</span>
                </div>
                <div className="p-6">
                  <div className="flex items-center mb-3">
                    <span className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                      {post.category}
                    </span>
                    <span className="text-gray-500 text-sm ml-3">{post.readTime}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">
                    <Link to={`/blog/${post.slug}`} className="hover:text-blue-600">
                      {post.title}
                    </Link>
                  </h3>
                  <p className="text-gray-600 mb-4 text-sm">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">{post.date}</span>
                    <Link 
                      to={`/blog/${post.slug}`}
                      className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                    >
                      Read More →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Get the latest API tutorials, business insights, and developer resources delivered to your inbox.
          </p>
          <div className="max-w-md mx-auto flex gap-4">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 px-4 py-2 rounded-lg text-gray-900"
            />
            <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors">
              Subscribe
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;
