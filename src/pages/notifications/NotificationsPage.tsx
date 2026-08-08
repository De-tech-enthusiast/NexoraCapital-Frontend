// ============================================
// NEXORA CAPITAL - Notifications Page
// ============================================

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Bell,
  Check,
  ArrowRight,
  Info,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { format } from 'date-fns';
import type { Notification } from '@/types';

const NotificationsPage = () => {
  const {
    dashboardData,
    fetchDashboardData,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    isLoading,
  } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const notifications = dashboardData?.notifications || [];
  const unreadCount = dashboardData?.unreadNotificationsCount || 0;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1c1917]">Notifications</h1>
            <p className="mt-1 text-[#78716c]">
              Stay updated with your investment activity
            </p>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              leftIcon={<Check className="h-4 w-4" />}
              onClick={markAllNotificationsAsRead}
            >
              Mark All as Read
            </Button>
          )}
        </div>
      </motion.section>

      {/* Notifications List */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardHeader
            title={`All Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
          />
          <CardContent>
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-[#e7e5e4] rounded-lg animate-pulse" />
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <EmptyState
                icon={<Bell className="h-8 w-8" />}
                title="No notifications yet"
                description="We'll notify you when there's activity on your account"
              />
            ) : (
              <div className="space-y-2">
                {notifications.map((notification, index) => (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      notification.read
                        ? 'bg-white border-[#e7e5e4] hover:border-[#d6d3d1]'
                        : 'bg-blue-50/50 border-blue-200 hover:bg-blue-50'
                    }`}
                    onClick={() => markNotificationAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`p-2 rounded-lg ${
                          notification.read ? 'bg-[#f5f5f4]' : 'bg-white'
                        }`}
                      >
                        {getIcon(notification.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p
                              className={`font-medium ${
                                notification.read
                                  ? 'text-[#44403c]'
                                  : 'text-[#1c1917]'
                              }`}
                            >
                              {notification.title}
                            </p>
                            <p className="mt-1 text-sm text-[#78716c]">
                              {notification.message}
                            </p>
                            <p className="mt-2 text-xs text-[#a8a29e]">
                              {format(new Date(notification.createdAt), 'MMM d, yyyy • h:mm a')}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {!notification.read && (
                              <Badge variant="info" size="sm">
                                New
                              </Badge>
                            )}
                            {notification.actionUrl && (
                              <Button variant="ghost" size="sm" className="flex-shrink-0">
                                <ArrowRight className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
};

export default NotificationsPage;
