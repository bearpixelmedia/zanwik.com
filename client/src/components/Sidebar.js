import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  FolderOpen,
  BarChart3,
  Activity,
  Server,
  Users,
  Settings
} from 'lucide-react';

const Sidebar = () => {
  const { hasPermission } = useAuth();
  const location = useLocation();

  const navigation = [
    {
      name: 'Dashboard',
      href: '/',
      icon: LayoutDashboard,
      current: location.pathname === '/',
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: FolderOpen,
      current: location.pathname === '/projects',
      permission: 'projects.read',
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      current: location.pathname === '/analytics',
      permission: 'analytics.read',
    },
    {
      name: 'Monitoring',
      href: '/monitoring',
      icon: Activity,
      current: location.pathname === '/monitoring',
      permission: 'infrastructure.read',
    },
    {
      name: 'Infrastructure',
      href: '/infrastructure',
      icon: Server,
      current: location.pathname === '/infrastructure',
      permission: 'infrastructure.read',
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      current: location.pathname === '/users',
      permission: 'users.read',
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      current: location.pathname === '/settings',
    },
  ];

  const filteredNavigation = navigation.filter(item => {
    if (!item.permission) return true;
    return hasPermission(item.permission.split('.')[0], item.permission.split('.')[1]);
  });

  return (
    <div className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-gray-800">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">U</span>
                  </div>
                </div>
                <div className="ml-3">
                  <h1 className="text-white text-lg font-semibold">Umbrella</h1>
                  <p className="text-gray-300 text-xs">Dashboard</p>
                </div>
              </div>
            </div>
            
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {filteredNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      `group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                        isActive
                          ? 'bg-gray-900 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`
                    }
                  >
                    <Icon
                      className={`mr-3 flex-shrink-0 h-6 w-6 ${
                        item.current ? 'text-white' : 'text-gray-400 group-hover:text-gray-300'
                      }`}
                    />
                    {item.name}
                  </NavLink>
                );
              })}
            </nav>
          </div>
          
          {/* Quick Stats */}
          <div className="flex-shrink-0 flex bg-gray-700 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div>
                  <div className="text-sm font-medium text-white">
                    Quick Stats
                  </div>
                  <div className="text-xs text-gray-300">
                    <div className="flex justify-between mt-1">
                      <span>Projects: 10</span>
                      <span>Healthy: 8</span>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span>Revenue: $12.5K</span>
                      <span>Users: 1.2K</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar; 