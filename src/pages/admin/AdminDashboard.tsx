// ============================================
// NEXORA CAPITAL - Admin Dashboard (Overview)
// ============================================

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Wallet,
  TrendingUp,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  UserPlus,
} from 'lucide-react';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { adminApi } from '@/services/api';

interface AdminStats {
  users: { total: number; admins: number; newToday: number };
  portfolio: { totalAum: number; totalInvested: number; totalProfit: number; averageReturn: number };
  pending: { deposits: number; withdrawals: number };
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    adminApi
      .getStats()
      .then((res) => setStats(res.data as AdminStats))
      .catch(() => setStats(null))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-[#1c1917]">Admin Overview</h1>
        <p className="mt-1 text-[#78716c]">Platform-wide metrics and pending actions</p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats?.users.total || 0}
          subtitle={`${stats?.users.newToday || 0} new today`}
          icon={<Users className="h-5 w-5" />}
          loading={isLoading}
        />
        <StatCard
          title="Assets Under Management"
          value={stats?.portfolio.totalAum || 0}
          currency="USD"
          icon={<Wallet className="h-5 w-5" />}
          loading={isLoading}
        />
        <StatCard
          title="Total Profit Paid"
          value={stats?.portfolio.totalProfit || 0}
          currency="USD"
          icon={<TrendingUp className="h-5 w-5" />}
          loading={isLoading}
        />
        <StatCard
          title="Avg. Return"
          value={`${stats?.portfolio.averageReturn || 0}%`}
          icon={<TrendingUp className="h-5 w-5" />}
          loading={isLoading}
        />
      </div>

      {/* Pending Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Pending Deposits" subtitle="Awaiting your review" />
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-50 rounded-lg">
                  <ArrowDownLeft className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#1c1917]">
                    {stats?.pending.deposits || 0}
                  </p>
                  <p className="text-sm text-[#78716c]">deposits pending</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate('/admin/deposits')}>
                Review
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader title="Pending Withdrawals" subtitle="Awaiting your approval" />
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-50 rounded-lg">
                  <ArrowUpRight className="h-6 w-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#1c1917]">
                    {stats?.pending.withdrawals || 0}
                  </p>
                  <p className="text-sm text-[#78716c]">withdrawals pending</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => navigate('/admin/withdrawals')}>
                Review
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader title="Quick Actions" />
        <CardContent className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Button variant="outline" fullWidth leftIcon={<Users className="h-4 w-4" />} onClick={() => navigate('/admin/users')}>
            Manage Users
          </Button>
          <Button variant="outline" fullWidth leftIcon={<Clock className="h-4 w-4" />} onClick={() => navigate('/admin/deposits')}>
            Review Deposits
          </Button>
          <Button variant="outline" fullWidth leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => navigate('/admin/logs')}>
            View Audit Logs
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
