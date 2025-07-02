import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Package, 
  Users, 
  BarChart3, 
  CreditCard, 
  Truck, 
  Shield,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

const Landing = () => {
  const features = [
    {
      icon: Package,
      title: 'Subscription Management',
      description: 'Create and manage multiple subscription tiers with ease. Set up recurring billing, customize delivery schedules, and track customer preferences.'
    },
    {
      icon: Users,
      title: 'Customer Portal',
      description: 'Give your customers full control over their subscriptions. Allow them to pause, skip, or cancel shipments with just a few clicks.'
    },
    {
      icon: BarChart3,
      title: 'Analytics Dashboard',
      description: 'Get deep insights into your business performance. Track revenue, churn rates, customer lifetime value, and product performance.'
    },
    {
      icon: CreditCard,
      title: 'Secure Payments',
      description: 'Integrated with Stripe for secure payment processing. Handle failed payments, retry logic, and subscription updates automatically.'
    },
    {
      icon: Truck,
      title: 'Shipping Management',
      description: 'Automated shipping notifications, tracking updates, and address management. Integrate with major carriers for seamless fulfillment.'
    },
    {
      icon: Shield,
      title: 'Inventory Control',
      description: 'Real-time inventory tracking with low-stock alerts. Manage product variants, suppliers, and reorder points efficiently.'
    }
  ];

  const benefits = [
    'Increase customer retention with flexible subscription options',
    'Reduce manual work with automated billing and shipping',
    'Scale your business with comprehensive analytics and insights',
    'Improve customer satisfaction with self-service portal',
    'Boost revenue with recurring billing and upselling opportunities',
    'Streamline operations with integrated inventory management'
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-purple-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Build Your Subscription Box Empire
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              The complete platform for creating, managing, and scaling your subscription box business. 
              From inventory to analytics, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/register"
                className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center justify-center"
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white hover:text-blue-600 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our comprehensive platform provides all the tools you need to build and scale your subscription box business.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 p-8 rounded-lg hover:shadow-lg transition-shadow">
                <div className="bg-blue-600 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Why Choose SubscriptionBox?
              </h2>
              <div className="space-y-4">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-start">
                    <CheckCircle className="h-6 w-6 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700">{benefit}</p>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-flex items-center"
                >
                  Get Started Today
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </div>
            </div>
            <div className="bg-white p-8 rounded-lg shadow-lg">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">
                Pricing Plans
              </h3>
              <div className="space-y-6">
                <div className="border-b pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Starter</span>
                    <span className="text-2xl font-bold text-blue-600">$29</span>
                  </div>
                  <p className="text-gray-600 text-sm">Perfect for small businesses</p>
                  <ul className="text-sm text-gray-600 mt-2">
                    <li>• Up to 100 subscribers</li>
                    <li>• Basic analytics</li>
                    <li>• Email support</li>
                  </ul>
                </div>
                <div className="border-b pb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Professional</span>
                    <span className="text-2xl font-bold text-blue-600">$79</span>
                  </div>
                  <p className="text-gray-600 text-sm">For growing businesses</p>
                  <ul className="text-sm text-gray-600 mt-2">
                    <li>• Up to 1,000 subscribers</li>
                    <li>• Advanced analytics</li>
                    <li>• Priority support</li>
                  </ul>
                </div>
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Enterprise</span>
                    <span className="text-2xl font-bold text-blue-600">$199</span>
                  </div>
                  <p className="text-gray-600 text-sm">For large operations</p>
                  <ul className="text-sm text-gray-600 mt-2">
                    <li>• Unlimited subscribers</li>
                    <li>• Custom integrations</li>
                    <li>• Dedicated support</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Start Your Subscription Box Business?
          </h2>
          <p className="text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Join thousands of entrepreneurs who are already using SubscriptionBox to build successful recurring revenue businesses.
          </p>
          <Link
            to="/register"
            className="bg-white text-blue-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-colors inline-flex items-center"
          >
            Start Your Free Trial
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
          <p className="text-blue-100 mt-4 text-sm">
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Package className="h-8 w-8 text-blue-400" />
                <span className="ml-2 text-xl font-bold">SubscriptionBox</span>
              </div>
              <p className="text-gray-400">
                The complete platform for subscription box businesses.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Features</a></li>
                <li><a href="#" className="hover:text-white">Pricing</a></li>
                <li><a href="#" className="hover:text-white">Integrations</a></li>
                <li><a href="#" className="hover:text-white">API</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">Status</a></li>
                <li><a href="#" className="hover:text-white">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">About</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Careers</a></li>
                <li><a href="#" className="hover:text-white">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 SubscriptionBox. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing; 