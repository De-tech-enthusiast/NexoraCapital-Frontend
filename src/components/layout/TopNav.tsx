// ============================================
// NEXORA CAPITAL - Top Navigation Component
// ============================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import {
  Bell,
  Menu,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useDashboardStore } from '@/store/dashboardStore';
import { format } from 'date-fns';

interface TopNavProps {
  onMenuClick: () => void;
  isSidebarCollapsed: boolean;
}

const TopNav = ({ onMenuClick, isSidebarCollapsed }: TopNavProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { dashboardData, markNotificationAsRead } = useDashboardStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const unreadCount = dashboardData?.unreadNotificationsCount || 0;
  const recentNotifications = dashboardData?.notifications.slice(0, 5) || [];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <header className="h-16 bg-white border-b border-[#e7e5e4] sticky top-0 z-30">
      <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 -ml-2 text-[#78716c] hover:text-[#44403c] hover:bg-[#f5f5f4] rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Greeting */}
          <div className={cn('hidden sm:block', isSidebarCollapsed && 'lg:ml-0')}>
            <h1 className="text-lg font-semibold text-[#1c1917]">
              {getGreeting()}, {user?.firstName || 'Investor'}
            </h1>
            <p className="text-xs text-[#78716c]">
              {format(new Date(), 'EEEE, MMMM do, yyyy')}
            </p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => {
                setIsNotificationsOpen(!isNotificationsOpen);
                setIsProfileOpen(false);
              }}
              className="relative p-2 text-[#78716c] hover:text-[#44403c] hover:bg-[#f5f5f4] rounded-lg transition-colors"
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-medium rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {isNotificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl border border-[#e7e5e4] shadow-lg shadow-black/10 z-50">
                <div className="p-4 border-b border-[#e7e5e4]">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-[#1c1917]">Notifications</h3>
                    <button
                      onClick={() => navigate('/notifications')}
                      className="text-xs text-[#1e3a5f] hover:underline"
                    >
                      View all
                    </button>
                  </div>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {recentNotifications.length === 0 ? (
                    <p className="p-4 text-center text-sm text-[#78716c]">
                      No notifications
                    </p>
                  ) : (
                    recentNotifications.map((notification) => (
                      <button
                        key={notification.id}
                        onClick={() => {
                          markNotificationAsRead(notification.id);
                          if (notification.actionUrl) {
                            navigate(notification.actionUrl);
                          }
                          setIsNotificationsOpen(false);
                        }}
                        className={cn(
                          'w-full p-4 text-left hover:bg-[#f5f5f4] transition-colors border-b border-[#e7e5e4] last:border-b-0',
                          !notification.read && 'bg-blue-50/50'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div className={cn(
                            'w-2 h-2 mt-1.5 rounded-full flex-shrink-0',
                            notification.read ? 'bg-transparent' : 'bg-[#1e3a5f]'
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'text-sm',
                              notification.read ? 'text-[#44403c]' : 'font-medium text-[#1c1917]'
                            )}>
                              {notification.title}
                            </p>
                            <p className="mt-0.5 text-xs text-[#78716c] line-clamp-2">
                              {notification.message}
                            </p>
                            <p className="mt-1 text-xs text-[#a8a29e]">
                              {format(new Date(notification.createdAt), 'MMM d, h:mm a')}
                            </p>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotificationsOpen(false);
              }}
              className="flex items-center gap-2 p-1.5 pr-3 rounded-lg hover:bg-[#f5f5f4] transition-colors"
            >
              <div className="w-8 h-8 bg-[#1e3a5f] rounded-full flex items-center justify-center text-white font-medium text-sm">
                {user?.firstName?.[0] || user?.email?.[0] || 'U'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-sm font-medium text-[#1c1917]">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-[#78716c]">{user?.email}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-[#a8a29e]" />
            </button>

            {/* Profile Dropdown Menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl border border-[#e7e5e4] shadow-lg shadow-black/10 z-50 py-1">
                <div className="px-4 py-3 border-b border-[#e7e5e4]">
                  <p className="text-sm font-medium text-[#1c1917]">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-[#78716c]">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    navigate('/profile');
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#44403c] hover:bg-[#f5f5f4] transition-colors"
                >
                  <User className="h-4 w-4" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    navigate('/security');
                    setIsProfileOpen(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-[#44403c] hover:bg-[#f5f5f4] transition-colors"
                >
                  <Settings className="h-4 w-4" />
                  Security
                </button>
                <div className="border-t border-[#e7e5e4] my-1" />
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(isNotificationsOpen || isProfileOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setIsNotificationsOpen(false);
            setIsProfileOpen(false);
          }}
        />
      )}
    </header>
  );
};

export { TopNav };
