// ============================================
// NEXORA CAPITAL - Transactions Page
// ============================================

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Download,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { format } from 'date-fns';
import type { Transaction } from '@/types';
import { transactionApi } from '@/services/api';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    setIsLoading(true);
    transactionApi
      .getTransactions({ limit: 200 })
      .then((res) => {
        const data = res.data as any;
        const list = (data.transactions || []).map((tx: any) => ({
          id: tx.id.toString(),
          userId: tx.userId?.toString() ?? '',
          reference: tx.reference,
          type: tx.type,
          amount: parseFloat(tx.amount),
          currency: tx.currency,
          status: tx.status,
          description: tx.description || '',
          metadata: tx.metadata,
          createdAt: tx.createdAt,
          updatedAt: tx.updatedAt,
        }));
        setTransactions(list);
      })
      .catch(() => setTransactions([]))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredTransactions = transactions.filter((tx) => {
    const matchesSearch =
      tx.reference.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType =
      filterType === 'all' || tx.type === filterType;
    return matchesSearch && matchesType;
  });

  const transactionColumns: Column<Transaction>[] = [
    {
      key: 'date',
      header: 'Date',
      render: (item) => (
        <div>
          <p className="font-medium text-[#1c1917]">
            {format(new Date(item.createdAt), 'MMM d, yyyy')}
          </p>
          <p className="text-xs text-[#a8a29e]">
            {format(new Date(item.createdAt), 'h:mm a')}
          </p>
        </div>
      ),
    },
    {
      key: 'reference',
      header: 'Reference',
      render: (item) => (
        <span className="font-mono text-sm text-[#44403c]">{item.reference}</span>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      render: (item) => (
        <div className="flex items-center gap-2">
          {item.type === 'deposit' ? (
            <ArrowDownLeft className="h-4 w-4 text-green-500" />
          ) : item.type === 'withdrawal' ? (
            <ArrowUpRight className="h-4 w-4 text-red-500" />
          ) : (
            <TrendingUp className="h-4 w-4 text-blue-500" />
          )}
          <span className="capitalize text-[#44403c]">{item.type}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'Amount',
      align: 'right',
      render: (item) => (
        <div className="text-right">
          <p
            className={`font-medium ${
              item.type === 'withdrawal' ? 'text-red-600' : 'text-[#1c1917]'
            }`}
          >
            {item.type === 'withdrawal' ? '-' : '+'}
            ${item.amount.toLocaleString()}
          </p>
          <p className="text-xs text-[#a8a29e]">{item.currency}</p>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (item) => <StatusBadge status={item.status} />,
    },
    {
      key: 'description',
      header: 'Description',
      render: (item) => (
        <p className="text-sm text-[#78716c] max-w-xs truncate">
          {item.description}
        </p>
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-[#1c1917]">Transactions</h1>
            <p className="mt-1 text-[#78716c]">
              View your complete transaction history
            </p>
          </div>
          <Button variant="outline" leftIcon={<Download className="h-4 w-4" />}>
            Export CSV
          </Button>
        </div>
      </motion.section>

      {/* Filters */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Card>
          <CardContent className="py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search transactions..."
                  leftIcon={<Search className="h-4 w-4" />}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-[#78716c]" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="h-11 px-4 rounded-lg border border-[#d6d3d1] bg-white text-sm text-[#1c1917] focus:outline-none focus:ring-2 focus:ring-[#1e3a5f]"
                >
                  <option value="all">All Types</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="dividend">Returns</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.section>

      {/* Transactions Table */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <DataTable
          columns={transactionColumns}
          data={filteredTransactions}
          keyExtractor={(item) => item.id}
          loading={isLoading}
          emptyMessage="No transactions found matching your criteria"
          pagination={{
            currentPage,
            totalPages: Math.max(1, Math.ceil(filteredTransactions.length / 10)),
            onPageChange: setCurrentPage,
          }}
        />
      </motion.section>
    </div>
  );
};

export default TransactionsPage;
