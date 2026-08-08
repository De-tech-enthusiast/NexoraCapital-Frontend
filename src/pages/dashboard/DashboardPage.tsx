// ============================================
// NEXORA CAPITAL - Dashboard Page
// ============================================

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  Target,
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  PieChart,
  Bell,
} from 'lucide-react';
import { useDashboardStore } from '@/store/dashboardStore';
import { useAuthStore } from '@/store/authStore';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Timeline } from '@/components/ui/Timeline';
import { Badge } from '@/components/ui/Badge';
import { format } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const DashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { dashboardData, fetchDashboardData, isLoading } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const portfolio = dashboardData?.portfolio;
  const goal = dashboardData?.goal;
  const performance = dashboardData?.performance || [];
  const recentActivity = dashboardData?.recentActivity || [];
  const notifications = dashboardData?.notifications?.slice(0, 3) || [];

  const chartData = performance.map((p) => ({
    date: format(new Date(p.date), 'MMM d'),
    value: p.value,
    invested: p.invested,
  }));

  return (
    <div className="space-y-8">
      {/* Welcome Hero */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1c1917]">
              Welcome back, {user?.firstName}
            </h1>
            <p className="mt-1 text-[#78716c]">
              Your investments are progressing steadily.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              leftIcon={<ArrowDownLeft className="h-4 w-4" />}
              onClick={() => navigate('/deposit')}
            >
              Deposit
            </Button>
            <Button
              leftIcon={<PieChart className="h-4 w-4" />}
              onClick={() => navigate('/portfolio')}
            >
              Portfolio
            </Button>
          </div>
        </div>
      </motion.section>

      {/* Portfolio Summary */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        <StatCard
          title="Current Portfolio Value"
          value={portfolio?.currentValue || 0}
          currency="USD"
          change={10.71}
          changeType="positive"
          icon={<Wallet className="h-5 w-5" />}
          loading={isLoading}
        />
        <StatCard
          title="Total Invested"
          value={portfolio?.totalInvested || 0}
          currency="USD"
          icon={<PiggyBank className="h-5 w-5" />}
          loading={isLoading}
        />
        <StatCard
          title="Total Profit"
          value={portfolio?.totalProfit || 0}
          currency="USD"
          change={10.71}
          changeType="positive"
          icon={<TrendingUp className="h-5 w-5" />}
          loading={isLoading}
        />
        <StatCard
          title="Goal Progress"
          value={`${(goal?.progress || 0).toFixed(1)}%`}
          subtitle={`$${(goal?.currentAmount || 0).toLocaleString()} of $${(goal?.targetAmount || 0).toLocaleString()}`}
          icon={<Target className="h-5 w-5" />}
          loading={isLoading}
        />
      </motion.section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Growth Chart */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader
              title="Portfolio Growth"
              subtitle="Track your investment performance over time"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  rightIcon={<ArrowRight className="h-4 w-4" />}
                  onClick={() => navigate('/portfolio')}
                >
                  View Details
                </Button>
              }
            />
            <CardContent>
              <div className="h-80">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-pulse bg-[#e7e5e4] h-full w-full rounded-lg" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData}>
                      <defs>
                        <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
                      <XAxis
                        dataKey="date"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#78716c', fontSize: 12 }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#78716c', fontSize: 12 }}
                        tickFormatter={(value) => `$${value / 1000}k`}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: 'white',
                          border: '1px solid #e7e5e4',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        }}
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Value']}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#1e3a5f"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Goal Progress & Quick Actions */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="space-y-6"
        >
          {/* Goal Progress */}
          <Card>
            <CardHeader
              title={goal?.name || 'Investment Goal'}
              subtitle="Your path to financial growth"
            />
            <CardContent className="space-y-4">
              <ProgressBar
                value={goal?.progress || 0}
                variant={
                  (goal?.progress || 0) >= 75
                    ? 'success'
                    : (goal?.progress || 0) >= 50
                    ? 'default'
                    : 'warning'
                }
              />
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#78716c]">Current</span>
                <span className="font-medium text-[#1c1917]">
                  ${(goal?.currentAmount || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-[#78716c]">Target</span>
                <span className="font-medium text-[#1c1917]">
                  ${(goal?.targetAmount || 0).toLocaleString()}
                </span>
              </div>
              <div className="pt-2 border-t border-[#e7e5e4]">
                <p className="text-xs text-[#a8a29e]">
                  Estimated completion: {goal?.duration || 8} months
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader title="Quick Actions" />
            <CardContent className="space-y-2">
              <Button
                variant="outline"
                fullWidth
                leftIcon={<ArrowDownLeft className="h-4 w-4" />}
                onClick={() => navigate('/deposit')}
              >
                Make a Deposit
              </Button>
              <Button
                variant="outline"
                fullWidth
                leftIcon={<ArrowUpRight className="h-4 w-4" />}
                onClick={() => navigate('/withdraw')}
              >
                Request Withdrawal
              </Button>
            </CardContent>
          </Card>
        </motion.section>
      </div>

      {/* Bottom Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activity */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <Card>
            <CardHeader
              title="Recent Activity"
              subtitle="Your latest actions and updates"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/transactions')}
                >
                  View All
                </Button>
              }
            />
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-4">
                      <div className="w-10 h-10 bg-[#e7e5e4] rounded-full animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-[#e7e5e4] rounded animate-pulse" />
                        <div className="h-3 w-48 bg-[#e7e5e4] rounded animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <Timeline items={recentActivity} />
              )}
            </CardContent>
          </Card>
        </motion.section>

        {/* Notifications Preview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
        >
          <Card>
            <CardHeader
              title="Notifications"
              subtitle="Stay updated with your investments"
              action={
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/notifications')}
                >
                  View All
                </Button>
              }
            />
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="h-16 bg-[#e7e5e4] rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-8">
                  <Bell className="h-8 w-8 text-[#d6d3d1] mx-auto mb-3" />
                  <p className="text-sm text-[#78716c]">No new notifications</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notification) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg border transition-colors cursor-pointer hover:bg-[#f5f5f4] ${
                        notification.read
                          ? 'bg-white border-[#e7e5e4]'
                          : 'bg-blue-50/50 border-blue-200'
                      }`}
                      onClick={() => navigate('/notifications')}
                    >
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <Badge
                            variant={notification.type}
                            size="sm"
                            dot={!notification.read}
                          >
                            {notification.type}
                          </Badge>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm ${
                              notification.read
                                ? 'text-[#44403c]'
                                : 'font-medium text-[#1c1917]'
                            }`}
                          >
                            {notification.title}
                          </p>
                          <p className="mt-0.5 text-xs text-[#78716c] line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.section>
      </div>
    </div>
  );
};

export default DashboardPage;
