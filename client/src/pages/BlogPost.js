import React from 'react';
import { useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';
import StructuredData from '../components/StructuredData';

const BlogPost = () => {
  const { slug } = useParams();

  // Mock blog post data - in real app, this would come from API
  const blogPosts = {
    'complete-guide-api-integration-entrepreneurs': {
      title: "The Complete Guide to API Integration for Entrepreneurs",
      content: `
        <h2>Introduction</h2>
        <p>API integration is crucial for modern businesses. In this comprehensive guide, we'll walk you through everything you need to know about integrating APIs into your applications.</p>
        
        <h2>What is API Integration?</h2>
        <p>API integration is the process of connecting different software applications through their APIs (Application Programming Interfaces) to share data and functionality.</p>
        
        <h2>Key Benefits for Entrepreneurs</h2>
        <ul>
          <li><strong>Faster Development:</strong> Leverage existing services instead of building from scratch</li>
          <li><strong>Cost Efficiency:</strong> Reduce development costs by using third-party solutions</li>
          <li><strong>Scalability:</strong> Easily scale your application with proven services</li>
          <li><strong>Focus on Core Business:</strong> Spend time on your unique value proposition</li>
        </ul>
        
        <h2>Step-by-Step Integration Process</h2>
        <h3>1. Choose the Right API</h3>
        <p>Select APIs that align with your business needs. Consider factors like:</p>
        <ul>
          <li>Documentation quality</li>
          <li>Pricing structure</li>
          <li>Rate limits</li>
          <li>Community support</li>
        </ul>
        
        <h3>2. Authentication Setup</h3>
        <p>Most APIs require authentication. Common methods include:</p>
        <ul>
          <li>API Keys</li>
          <li>OAuth 2.0</li>
          <li>JWT Tokens</li>
          <li>Basic Authentication</li>
        </ul>
        
        <h3>3. Error Handling</h3>
        <p>Implement robust error handling to ensure your application remains stable:</p>
        <pre><code>try {
  const response = await fetch(apiUrl, options);
  if (!response.ok) {
    throw new Error(\`HTTP error! status: \${response.status}\`);
  }
  const data = await response.json();
  return data;
} catch (error) {
  console.error('API call failed:', error);
  // Handle error appropriately
}</code></pre>
        
        <h2>Best Practices</h2>
        <ul>
          <li>Always use HTTPS for API calls</li>
          <li>Implement rate limiting on your end</li>
          <li>Cache responses when appropriate</li>
          <li>Monitor API usage and costs</li>
          <li>Have fallback plans for API failures</li>
        </ul>
        
        <h2>Conclusion</h2>
        <p>API integration is a powerful tool for entrepreneurs. By following these guidelines, you can successfully integrate APIs into your applications and accelerate your business growth.</p>
      `,
      date: "2024-01-15",
      readTime: "8 min read",
      category: "Tutorial",
      author: "Zanwik Team"
    },
    'top-10-apis-startup-should-know': {
      title: "Top 10 APIs Every Startup Should Know About",
      content: `
        <h2>Introduction</h2>
        <p>As a startup, choosing the right APIs can make or break your product. Here are the top 10 APIs that every startup should consider integrating.</p>
        
        <h2>1. Stripe API - Payment Processing</h2>
        <p>Essential for any business that needs to accept payments. Stripe offers comprehensive payment solutions with excellent documentation.</p>
        
        <h2>2. Twilio API - Communication</h2>
        <p>Add SMS, voice, and video capabilities to your application. Perfect for user verification and notifications.</p>
        
        <h2>3. SendGrid API - Email Services</h2>
        <p>Reliable email delivery service for transactional and marketing emails. Essential for user communication.</p>
        
        <h2>4. Google Maps API - Location Services</h2>
        <p>Add maps, geocoding, and location-based features to your application.</p>
        
        <h2>5. AWS S3 API - File Storage</h2>
        <p>Scalable cloud storage for files, images, and documents. Cost-effective and reliable.</p>
        
        <h2>6. GitHub API - Code Management</h2>
        <p>Integrate with GitHub for version control, issue tracking, and collaboration features.</p>
        
        <h2>7. Slack API - Team Communication</h2>
        <p>Build integrations with Slack for team notifications and workflow automation.</p>
        
        <h2>8. Firebase API - Backend Services</h2>
        <p>Complete backend solution including database, authentication, and hosting.</p>
        
        <h2>9. OpenAI API - AI Services</h2>
        <p>Add AI capabilities like text generation, translation, and analysis to your application.</p>
        
        <h2>10. Zapier API - Workflow Automation</h2>
        <p>Connect different services and automate workflows without coding.</p>
        
        <h2>Conclusion</h2>
        <p>These APIs provide the foundation for most modern applications. Choose based on your specific needs and start integrating them into your startup's tech stack.</p>
      `,
      date: "2024-01-12",
      readTime: "6 min read",
      category: "List",
      author: "Zanwik Team"
    }
  };

  const post = blogPosts[slug] || {
    title: "Post Not Found",
    content: "<p>The blog post you're looking for doesn't exist.</p>",
    date: "",
    readTime: "",
    category: "",
    author: ""
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Structured Data for Article */}
      <StructuredData 
        type="article" 
        data={{
          title: post.title,
          description: post.content.replace(/<[^>]*>/g, '').substring(0, 160),
          datePublished: post.date,
          dateModified: post.date,
          image: "https://www.zanwik.com/zanwik-icon.svg"
        }}
      />
      
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <nav className="mb-6">
            <Link to="/blog" className="text-blue-600 hover:text-blue-800">
              ← Back to Blog
            </Link>
          </nav>
          
          <div className="mb-6">
            <span className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
              {post.category}
            </span>
            <span className="text-gray-500 text-sm ml-3">{post.readTime}</span>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            {post.title}
          </h1>
          
          <div className="flex items-center text-gray-600">
            <span>By {post.author}</span>
            <span className="mx-2">•</span>
            <span>{post.date}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <article 
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
        
        {/* Author Bio */}
        <div className="mt-12 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-2">About the Author</h3>
          <p className="text-gray-600">
            The Zanwik team consists of experienced developers and entrepreneurs who are passionate about helping others succeed with API integration and business automation.
          </p>
        </div>
        
        {/* Related Posts */}
        <div className="mt-12">
          <h3 className="text-2xl font-bold mb-6">Related Articles</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-semibold mb-2">
                <Link to="/blog/api-security-best-practices" className="hover:text-blue-600">
                  API Security Best Practices
                </Link>
              </h4>
              <p className="text-gray-600 text-sm">Essential security practices for API integration including authentication and data protection.</p>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <h4 className="text-lg font-semibold mb-2">
                <Link to="/blog/how-to-test-apis-effectively" className="hover:text-blue-600">
                  How to Test APIs Effectively
                </Link>
              </h4>
              <p className="text-gray-600 text-sm">Master API testing with our comprehensive guide covering unit and integration testing.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;
