// ============================================
// NEXORA CAPITAL - Portfolio Page
// ============================================

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Wallet,
  TrendingUp,
  PiggyBank,
  Target,
  PieChart,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useDashboardStore, portfolioAllocation } from '@/store/dashboardStore';
import { StatCard } from '@/components/ui/StatCard';
import { Card, CardHeader, CardContent } from '@/components/ui/Card';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { format } from 'date-fns';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RePieChart,
  Pie,
  Cell,
} from 'recharts';
import type { Transaction } from '@/types';

const PortfolioPage = () => {
  const { dashboardData, fetchDashboardData, isLoading } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const portfolio = dashboardData?.portfolio;
  const goal = dashboardData?.goal;
  const performance = dashboardData?.performance || [];
  const transactions = dashboardData?.recentTransactions || [];

  const chartData = performance.map((p) => ({
    date: format(new Date(p.date), 'MMM d'),
    value: p.value,
    invested: p.invested,
  }));

  const transactionColumns: Column<Transaction>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (item) => format(new Date(item.createdAt), 'MMM d, yyyy'),
    },
    {
      key: 'type',
      header: 'Type',
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.type === 'deposit' ? (
            <ArrowDownRight className="h-4 w-4 text-green-500" />
          ) : item.type === 'withdrawal' ? (
            <ArrowUpRight className="h-4 w-4 text-red-500" />
          ) : (
            <TrendingUp className="h-4 w-4 text-blue-500" />
          )}
          <span className="capitalize">{item.type}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (item) => (
        <span className="font-medium">
          ${item.amount.toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
            item.status === 'completed'
              ? 'bg-green-50 text-green-700 border-green-200'
              : item.status === 'pending'
              ? 'bg-amber-50 text-amber-700 border-amber-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-[#1c1917]">Portfolio</h1>
        <p className="mt-1 text-[#78716c]">
          Comprehensive view of your investment performance
        </p>
      </motion.section>

      {/* Portfolio Stats */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4"
      >
        <StatCard
          title="Current Value"
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
          title="Total Returns"
          value={portfolio?.totalProfit || 0}
          currency="USD"
          change={10.71}
          changeType="positive"
          icon={<TrendingUp className="h-5 w-5" />}
          loading={isLoading}
        />
        <StatCard
          title="Return Rate"
          value={`${portfolio?.profitPercentage || 0}%`}
          change={2.3}
          changeType="positive"
          icon={<Target className="h-5 w-5" />}
          loading={isLoading}
        />
      </motion.section>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Performance Chart */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <Card>
            <CardHeader
              title="Performance History"
              subtitle="Portfolio value over time"
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
                        <linearGradient id="portfolioValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="investedValue" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22c55e" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
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
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, '']}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        name="Portfolio Value"
                        stroke="#1e3a5f"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#portfolioValue)"
                      />
                      <Area
                        type="monotone"
                        dataKey="invested"
                        name="Amount Invested"
                        stroke="#22c55e"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#investedValue)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.section>

        {/* Asset Allocation */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Card>
            <CardHeader
              title="Asset Allocation"
              subtitle="Distribution by category"
            />
            <CardContent>
              <div className="h-48">
                {isLoading ? (
                  <div className="h-full flex items-center justify-center">
                    <div className="animate-pulse bg-[#e7e5e4] h-full w-full rounded-lg" />
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <RePieChart>
                      <Pie
                        data={portfolioAllocation}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {portfolioAllocation.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => `$${Number(value).toLocaleString()}`}
                      />
                    </RePieChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="mt-4 space-y-2">
                {portfolioAllocation.map((item) => (
                  <div key={item.asset} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="text-sm text-[#44403c]">{item.asset}</span>
                    </div>
                    <div className="text-sm">
                      <span className="font-medium text-[#1c1917]">{item.percentage}%</span>
                      <span className="text-[#a8a29e] ml-1">
                        (${item.value.toLocaleString()})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </div>

      {/* Goal Progress */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.4 }}
      >
        <Card>
          <CardHeader
            title="Investment Goal Progress"
            subtitle={goal?.name || 'Your wealth building journey'}
          />
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <ProgressBar
                  value={goal?.progress || 0}
                  size="lg"
                  showValue={true}
                />
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-[#f5f5f4] rounded-lg">
                    <p className="text-xs text-[#78716c] uppercase tracking-wider">Current</p>
                    <p className="mt-1 text-xl font-semibold text-[#1c1917]">
                      ${(goal?.currentAmount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-[#f5f5f4] rounded-lg">
                    <p className="text-xs text-[#78716c] uppercase tracking-wider">Target</p>
                    <p className="mt-1 text-xl font-semibold text-[#1c1917]">
                      ${(goal?.targetAmount || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-[#f5f5f4] rounded-lg">
                    <p className="text-xs text-[#78716c] uppercase tracking-wider">Remaining</p>
                    <p className="mt-1 text-xl font-semibold text-[#1c1917]">
                      ${((goal?.targetAmount || 0) - (goal?.currentAmount || 0)).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-[#78716c]" />
                  <div>
                    <p className="text-sm text-[#78716c]">Start Date</p>
                    <p className="font-medium text-[#1c1917]">
                      {goal?.startDate ? format(new Date(goal.startDate), 'MMM d, yyyy') : '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Target className="h-5 w-5 text-[#78716c]" />
                  <div>
                    <p className="text-sm text-[#78716c]">Target Date</p>
                    <p className="font-medium text-[#1c1917]">
                      {goal?.endDate ? format(new Date(goal.endDate), 'MMM d, yyyy') : '-'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <PieChart className="h-5 w-5 text-[#78716c]" />
                  <div>
                    <p className="text-sm text-[#78716c]">Duration</p>
                    <p className="font-medium text-[#1c1917]">
                      {goal?.duration || 0} months
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Recent Transactions */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.5 }}
      >
        <Card>
          <CardHeader
            title="Recent Transactions"
            subtitle="Your latest deposit and withdrawal activity"
          />
          <CardContent>
            <DataTable
              columns={transactionColumns}
              data={transactions}
              keyExtractor={(item) => item.id}
              loading={isLoading}
              emptyMessage="No transactions found"
            />
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
};

export default PortfolioPage;
