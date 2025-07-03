import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LayoutDashboard, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut,
  Menu,
  X,
  Building2,
  Monitor,
  FolderOpen,
  TrendingUp
} from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '../utils/cn';

const Sidebar = () => {
  const { logout } = useAuth();
  const location = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
      description: 'Overview and analytics'
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: FolderOpen,
      description: 'Manage your projects'
    },
    {
      name: 'Analytics',
      href: '/analytics',
      icon: BarChart3,
      description: 'Detailed insights'
    },
    {
      name: 'Infrastructure',
      href: '/infrastructure',
      icon: Building2,
      description: 'System resources'
    },
    {
      name: 'Monitoring',
      href: '/monitoring',
      icon: Monitor,
      description: 'Real-time monitoring'
    },
    {
      name: 'Users',
      href: '/users',
      icon: Users,
      description: 'User management'
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      description: 'Account settings'
    }
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className={cn(
      "flex flex-col h-screen bg-card border-r border-border transition-all duration-300 ease-in-out",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-semibold text-lg text-foreground">Umbrella</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive(item.href)
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon className={cn(
                "h-5 w-5 transition-colors",
                isActive(item.href) ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
              )} />
              {!isCollapsed && (
                <div className="flex-1">
                  <span>{item.name}</span>
                  {isActive(item.href) && (
                    <p className="text-xs opacity-80 mt-0.5">{item.description}</p>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            "w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent",
            isCollapsed && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && <span className="ml-3">Sign Out</span>}
        </Button>
      </div>
    </div>
  );
};

export default Sidebar; 