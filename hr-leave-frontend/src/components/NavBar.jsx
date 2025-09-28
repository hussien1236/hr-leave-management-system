import { useState, useEffect, useRef } from 'react';
import { 
  Menu, 
  X, 
  Home, 
  Users, 
  Settings, 
  BarChart3, 
  FileText, 
  Bell, 
  User, 
  LogOut,
  ChevronDown,
  Building2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [isMoreDropdownOpen, setIsMoreDropdownOpen] = useState(false);
  const moreDropdownRef = useRef(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState(3); // Mock notification count
  const profileDropdownRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileDropdownOpen(false);
      }
       if (moreDropdownRef.current && !moreDropdownRef.current.contains(event.target)) {
      setIsMoreDropdownOpen(false);
    }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close mobile menu when screen size changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) { // md breakpoint
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Navigation items based on user role
  const getNavItems = (userRole) => {
    const baseItems = [
      { name: 'Dashboard', href: '/', icon: Home },
    ];

    if (userRole === 'admin') {
      return [
        ...baseItems,
        { name: 'Leave Requests', href: '/allLeaveRequests', icon: BarChart3 },
        { name: 'Leave Types', href: '/leaveTypes', icon: Settings },
        { name: 'Reports', href: '/reports', icon: FileText },
        { name: 'Create User', href: '/createUser', icon: Users },
        { name: 'Users', href: '/users', icon: Users },
      ];
    } else if (userRole === 'manager') {
      return [
        ...baseItems,
        { name: 'Team', href: '/team', icon: Users },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Leave Requests', href: '/allLeaveRequests', icon: BarChart3 },
        { name: 'Reports', href: '/reports', icon: FileText }

      ];
    } else {
      return [ 
        ...baseItems, 
        { name: 'My Leave Requests', href: '/myLeaveRequests', icon: FileText },
        { name: 'Request Leave', href: '/requestLeave', icon: Settings }
      ];
    }
  };

  const navItems = user ? getNavItems(user.role) : [];

  const handleLogout = () => {
    logout();
    nav('/login');
  };

  const handleNotificationClick = () => {
    setNotifications(0);
    alert('Notifications panel would open here');
  };

  const handleNavItemClick = (href) => {
    nav(href);
    setIsMobileMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  if (!user) return null;

  return (
    <nav className="bg-white shadow-lg mb-10 border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          
          {/* Logo and Brand */}
          <div className="flex items-center flex-shrink-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-2 sm:mr-3">
              <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-lg sm:text-xl font-bold text-gray-900 truncate">
              CompanyApp
            </span>
          </div>

          {/* Desktop Navigation - Hidden on mobile/tablet */}
          <div className="hidden lg:block flex-1 max-w-xs xl:max-w-sm ml-6 xl:ml-10">
            <div className="flex items-center justify-center space-x-1 xl:space-x-2">
              {navItems.slice(0, 4).map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    onClick={() => handleNavItemClick(item.href)}
                    className="flex items-center px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200 whitespace-nowrap"
                  >
                    <Icon className="w-4 h-4 mr-1 xl:mr-2 flex-shrink-0" />
                    <span className="hidden xl:block">{item.name}</span>
                    <span className="xl:hidden">{item.name.split(' ')[0]}</span>
                  </button>
                );
              })}
              
              {/* More items dropdown for desktop if needed */}
             {navItems.length > 4 && (
  <div className="relative" ref={moreDropdownRef}>
    <button 
      onClick={() => setIsMoreDropdownOpen(!isMoreDropdownOpen)}
      className="flex items-center px-2 xl:px-3 py-2 rounded-md text-xs xl:text-sm font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
    >
      <Settings className="w-4 h-4 mr-1 xl:mr-2" />
      <span className="hidden xl:block">More</span>
      <ChevronDown className={`w-3 h-3 ml-1 transition-transform duration-200 ${isMoreDropdownOpen ? 'rotate-180' : ''}`} />
    </button>

    {/* More Dropdown Menu */}
    {isMoreDropdownOpen && (
      <div className="absolute left-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
        {navItems.slice(4).map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.name}
              onClick={() => {
                handleNavItemClick(item.href);
                setIsMoreDropdownOpen(false);
              }}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
            >
              <Icon className="w-4 h-4 mr-3 text-gray-500" />
              {item.name}
            </button>
          );
        })}
      </div>
    )}
  </div>
)}
            </div>
          </div>

          {/* Desktop Right Section */}
          <div className="hidden md:flex items-center space-x-2 lg:space-x-3 xl:space-x-4">
            
            {/* Notifications */}
            <button
              onClick={handleNotificationClick}
              className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <Bell className="w-4 h-4 lg:w-5 lg:h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 lg:w-5 lg:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </button>

            {/* Profile Dropdown */}
            <div className="relative" ref={profileDropdownRef}>
              <button
                onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                className="flex items-center space-x-2 lg:space-x-3 p-1.5 lg:p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-3 h-3 lg:w-4 lg:h-4 text-white" />
                </div>
                <div className="text-left hidden lg:block">
                  <p className="text-sm font-medium text-gray-900 truncate max-w-24 xl:max-w-32">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500 capitalize">{user.role}</p>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${isProfileDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Profile Dropdown Menu */}
              {isProfileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    <p className="text-xs text-blue-600 capitalize mt-1">{user.role}</p>
                  </div>
                  <button
                    onClick={() => {
                      alert('Profile settings');
                      setIsProfileDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                  >
                    <User className="w-4 h-4 mr-3 text-gray-500" />
                    Profile Settings
                  </button>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsProfileDropdownOpen(false);
                    }}
                    className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150"
                  >
                    <LogOut className="w-4 h-4 mr-3" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Mobile/Tablet Menu Button and Notifications */}
          <div className="md:hidden flex items-center space-x-2">
            {/* Mobile Notifications */}
            <button
              onClick={handleNotificationClick}
              className="relative p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
            >
              <Bell className="w-5 h-5" />
              {notifications > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notifications > 9 ? '9+' : notifications}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-md text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
            >
              {isMobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Menu */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${isMobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="bg-white border-t border-gray-200">
          {/* Navigation Items */}
          <div className="px-3 pt-2 pb-3 space-y-1 max-h-64 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => handleNavItemClick(item.href)}
                  className="flex items-center w-full px-3 py-2.5 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                >
                  <Icon className="w-5 h-5 mr-3 text-gray-500" />
                  {item.name}
                </button>
              );
            })}
          </div>
          
          {/* Mobile Profile Section */}
          <div className="pt-4 pb-3 border-t border-gray-200 bg-gray-50">
            <div className="flex items-center px-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-white" />
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <div className="text-base font-medium text-gray-800 truncate">{user.name}</div>
                <div className="text-sm text-gray-500 truncate">{user.email}</div>
                <div className="text-sm text-blue-600 capitalize">{user.role}</div>
              </div>
            </div>
            <div className="mt-3 px-2 space-y-1">
              <button
                onClick={() => {
                  alert('Profile settings');
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors duration-200"
              >
                <User className="w-5 h-5 mr-3 text-gray-500" />
                Profile Settings
              </button>
              <button
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
                className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50 transition-colors duration-200"
              >
                <LogOut className="w-5 h-5 mr-3" />
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}