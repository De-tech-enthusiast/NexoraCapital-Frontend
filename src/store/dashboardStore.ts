// ============================================
// NEXORA CAPITAL - Dashboard Store
// ============================================

import { create } from 'zustand';
import { portfolioApi, notificationApi } from '@/services/api';
import type { 
  DashboardData, 
  PortfolioAllocation 
} from '@/types';

interface DashboardState {
  // Data
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;

  // Actions
  fetchDashboardData: () => Promise<void>;
  refreshData: () => Promise<void>;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  clearError: () => void;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  // Initial State
  dashboardData: null,
  isLoading: false,
  error: null,
  lastUpdated: null,

  // Actions
  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });

    try {
      // Fetch dashboard data from API
      const response = await portfolioApi.getDashboard();
      const apiData = response.data as any;

      // Fetch notifications
      const notifResponse = await notificationApi.getNotifications();
      const notifData = notifResponse.data as any;

      // Fetch recent activity
      let activityData: any[] = [];
      try {
        const activityResponse = await notificationApi.getActivities();
        activityData = (activityResponse.data as any[]) || [];
      } catch {
        activityData = [];
      }

      // Transform API data to match frontend types
      const data: DashboardData = {
        user: apiData.user,
        portfolio: apiData.portfolio ? {
          id: apiData.portfolio.id.toString(),
          userId: apiData.portfolio.userId.toString(),
          currentValue: parseFloat(apiData.portfolio.currentValue),
          totalInvested: parseFloat(apiData.portfolio.totalInvested),
          totalProfit: parseFloat(apiData.portfolio.totalProfit),
          profitPercentage: parseFloat(apiData.portfolio.profitPercentage),
          goalId: apiData.goal?.id?.toString() || null,
          createdAt: apiData.portfolio.createdAt,
          updatedAt: apiData.portfolio.updatedAt,
        } : null,
        goal: apiData.goal ? {
          id: apiData.goal.id.toString(),
          userId: apiData.goal.userId.toString(),
          name: apiData.goal.name,
          targetAmount: parseFloat(apiData.goal.targetAmount),
          currentAmount: parseFloat(apiData.goal.currentAmount),
          duration: apiData.goal.duration,
          startDate: apiData.goal.startDate,
          endDate: apiData.goal.endDate,
          status: apiData.goal.status,
          progress: parseFloat(apiData.goal.progress),
        } : null,
        recentTransactions: (apiData.recentTransactions || []).map((tx: any) => ({
          id: tx.id.toString(),
          userId: tx.userId.toString(),
          reference: tx.reference,
          type: tx.type,
          amount: parseFloat(tx.amount),
          currency: tx.currency,
          status: tx.status,
          description: tx.description,
          metadata: tx.metadata,
          createdAt: tx.createdAt,
          updatedAt: tx.updatedAt,
        })),
        recentActivity: activityData.map((a: any) => ({
          id: a.id.toString(),
          userId: a.userId?.toString() ?? '',
          type: a.type,
          title: a.title,
          description: a.description,
          status: a.status,
          metadata: a.metadata,
          createdAt: a.createdAt,
        })),
        notifications: (notifData.notifications || []).map((n: any) => ({
          id: n.id.toString(),
          userId: n.userId.toString(),
          title: n.title,
          message: n.message,
          type: n.type,
          read: n.read,
          actionUrl: n.actionUrl,
          createdAt: n.createdAt,
        })),
        unreadNotificationsCount: notifData.unreadCount || 0,
        performance: (apiData.performance || []).map((p: any) => ({
          date: p.date,
          value: parseFloat(p.value),
          invested: parseFloat(p.invested),
        })),
      };

      set({
        dashboardData: data,
        isLoading: false,
        lastUpdated: new Date(),
      });
    } catch (error: any) {
      set({
        error: error.message || 'Failed to fetch dashboard data',
        isLoading: false,
      });
    }
  },

  refreshData: async () => {
    await get().fetchDashboardData();
  },

  markNotificationAsRead: async (id: string) => {
    try {
      await notificationApi.markAsRead(id);
      
      const { dashboardData } = get();
      if (!dashboardData) return;

      const updatedNotifications = dashboardData.notifications.map(n =>
        n.id === id ? { ...n, read: true } : n
      );

      set({
        dashboardData: {
          ...dashboardData,
          notifications: updatedNotifications,
          unreadNotificationsCount: updatedNotifications.filter(n => !n.read).length,
        },
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  },

  markAllNotificationsAsRead: async () => {
    try {
      await notificationApi.markAllAsRead();
      
      const { dashboardData } = get();
      if (!dashboardData) return;

      const updatedNotifications = dashboardData.notifications.map(n => ({ ...n, read: true }));

      set({
        dashboardData: {
          ...dashboardData,
          notifications: updatedNotifications,
          unreadNotificationsCount: 0,
        },
      });
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  },

  clearError: () => set({ error: null }),
}));

// Portfolio allocation data (static for display)
export const portfolioAllocation: PortfolioAllocation[] = [
  { asset: 'Digital Assets', percentage: 45, value: 20925, color: '#1e3a5f' },
  { asset: 'Stablecoins', percentage: 30, value: 13950, color: '#2d5a87' },
  { asset: 'Yield Farming', percentage: 15, value: 6975, color: '#4a7fb5' },
  { asset: 'DeFi Protocols', percentage: 10, value: 4650, color: '#7ba3d1' },
];
