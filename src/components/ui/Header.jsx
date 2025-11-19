import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import ThemeToggle from './ThemeToggle';
import Button from './Button';
import Icon from '../AppIcon';

const Header = ({ closeAllDropdowns }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const { user, userProfile, signOut, isAuthenticated } = useAuth();
  const { theme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/signin');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Enhanced theme toggle handler (Fix for bug #6)
  const handleThemeToggle = () => {
    // Close all dropdowns when theme is toggled
    if (closeAllDropdowns) {
      closeAllDropdowns();
    }
    setIsProfileMenuOpen(false);
  };

  // Enhanced profile dropdown handler
  const handleProfileMenuToggle = () => {
    // Close all other dropdowns when opening profile menu
    if (closeAllDropdowns) {
      closeAllDropdowns();
    }
    setIsProfileMenuOpen(!isProfileMenuOpen);
  };

  const navigationItems = [
    { name: 'Financial Modeling', href: '/financial-modeling-hub', icon: 'TrendingUp' },
    { name: 'Scenario Comparison', href: '/scenario-comparison', icon: 'BarChart3' },
    { name: 'Cost Optimization', href: '/cost-optimization-lab', icon: 'Target' },
    { name: 'KPI Monitoring', href: '/kpi-monitoring-center', icon: 'Activity' }
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Icon name="TrendingUp" size={28} className="text-primary" />
              <span className="text-xl font-bold text-foreground">FinModel Hub</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-1">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.name}
                  to={item?.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location?.pathname === item?.href
                      ? 'bg-primary/10 text-primary' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name={item?.icon} size={16} />
                  <span>{item?.name}</span>
                </Link>
              ))}
            </nav>
          )}

          {/* Right side - Auth & Theme */}
          <div className="flex items-center space-x-3">
            <ThemeToggle onToggle={handleThemeToggle} />
            
            {isAuthenticated ? (
              <div className="relative" data-dropdown="profile">
                <Button
                  variant="ghost"
                  onClick={handleProfileMenuToggle}
                  className="flex items-center space-x-2"
                >
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {userProfile?.avatar_url ? (
                      <img 
                        src={userProfile?.avatar_url} 
                        alt="Profile" 
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <Icon name="User" size={16} className="text-primary" />
                    )}
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-foreground">
                    {userProfile?.full_name || user?.email?.split('@')?.[0]}
                  </span>
                  <Icon name="ChevronDown" size={14} className="text-muted-foreground" />
                </Button>

                {/* Enhanced Profile Dropdown with proper close behavior */}
                {isProfileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-background border border-border rounded-md shadow-lg z-50">
                    <div className="px-4 py-3 border-b border-border">
                      <p className="text-sm font-medium text-foreground">
                        {userProfile?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      {userProfile?.company_name && (
                        <p className="text-xs text-muted-foreground">{userProfile?.company_name}</p>
                      )}
                    </div>
                    
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="flex items-center px-4 py-2 text-sm text-foreground hover:bg-muted"
                      >
                        <Icon name="User" size={16} className="mr-3" />
                        Profile Settings
                      </Link>
                      
                      <button
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          handleSignOut();
                        }}
                        className="flex items-center w-full px-4 py-2 text-sm text-foreground hover:bg-muted"
                      >
                        <Icon name="LogOut" size={16} className="mr-3" />
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" asChild>
                  <Link to="/signin">
                    <Icon name="LogIn" size={16} className="mr-2" />
                    Sign in
                  </Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">
                    <Icon name="UserPlus" size={16} className="mr-2" />
                    Sign up
                  </Link>
                </Button>
              </div>
            )}

            {/* Mobile menu button */}
            {isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                <Icon name={isMenuOpen ? "X" : "Menu"} size={20} />
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Navigation */}
        {isAuthenticated && isMenuOpen && (
          <div className="md:hidden border-t border-border mt-2 pt-2 pb-3">
            <nav className="space-y-1">
              {navigationItems?.map((item) => (
                <Link
                  key={item?.name}
                  to={item?.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    location?.pathname === item?.href
                      ? 'bg-primary/10 text-primary' :'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  <Icon name={item?.icon} size={16} />
                  <span>{item?.name}</span>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;