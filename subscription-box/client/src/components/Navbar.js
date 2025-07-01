import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Package, 
  Users, 
  BarChart3, 
  ShoppingCart, 
  User, 
  LogOut, 
  Menu, 
  X,
  Home,
  Settings
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, isAuthenticated, isBusinessOwner, isCustomer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const isActive = (path) => {
    return location.pathname === path;
  };

  const NavLink = ({ to, children, icon: Icon, className = '' }) => (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
        isActive(to)
          ? 'bg-blue-100 text-blue-700'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      } ${className}`}
      onClick={() => setIsMenuOpen(false)}
    >
      {Icon && <Icon className="mr-2 h-4 w-4" />}
      {children}
    </Link>
  );

  if (!isAuthenticated) {
    return (
      <nav className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <Package className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">
                  SubscriptionBox
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link
                to="/login"
                className="text-gray-700 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Package className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">
                SubscriptionBox
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {isBusinessOwner && (
              <>
                <NavLink to="/dashboard" icon={Home}>
                  Dashboard
                </NavLink>
                <NavLink to="/subscriptions" icon={Package}>
                  Subscriptions
                </NavLink>
                <NavLink to="/products" icon={ShoppingCart}>
                  Products
                </NavLink>
                <NavLink to="/analytics" icon={BarChart3}>
                  Analytics
                </NavLink>
              </>
            )}

            {isCustomer && (
              <>
                <NavLink to="/customer-dashboard" icon={Home}>
                  Dashboard
                </NavLink>
                <NavLink to="/marketplace" icon={Package}>
                  Marketplace
                </NavLink>
              </>
            )}

            {/* User Menu */}
            <div className="relative ml-3">
              <div className="flex items-center space-x-3">
                <span className="text-sm text-gray-700">
                  {user?.businessName || `${user?.firstName} ${user?.lastName}`}
                </span>
                <div className="relative">
                  <button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <div className="h-8 w-8 rounded-full bg-blue-600 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  </button>

                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </Link>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {isBusinessOwner && (
              <>
                <NavLink to="/dashboard" icon={Home} className="block">
                  Dashboard
                </NavLink>
                <NavLink to="/subscriptions" icon={Package} className="block">
                  Subscriptions
                </NavLink>
                <NavLink to="/products" icon={ShoppingCart} className="block">
                  Products
                </NavLink>
                <NavLink to="/analytics" icon={BarChart3} className="block">
                  Analytics
                </NavLink>
              </>
            )}

            {isCustomer && (
              <>
                <NavLink to="/customer-dashboard" icon={Home} className="block">
                  Dashboard
                </NavLink>
                <NavLink to="/marketplace" icon={Package} className="block">
                  Marketplace
                </NavLink>
              </>
            )}

            <div className="border-t pt-4 mt-4">
              <div className="px-3 py-2 text-sm text-gray-500">
                {user?.businessName || `${user?.firstName} ${user?.lastName}`}
              </div>
              <NavLink to="/profile" icon={User} className="block">
                Profile
              </NavLink>
              <NavLink to="/settings" icon={Settings} className="block">
                Settings
              </NavLink>
              <button
                onClick={handleLogout}
                className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-md"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar; 