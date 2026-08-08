// ============================================
// NEXORA CAPITAL - Admin Audit Logs Page
// ============================================

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ScrollText } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { DataTable, type Column } from '@/components/ui/DataTable';
import { EmptyState } from '@/components/ui/EmptyState';
import { adminApi } from '@/services/api';
import { format } from 'date-fns';

interface AdminLog {
  id: number;
  action: string;
  targetType: string | null;
  targetId: number | null;
  notes: string | null;
  createdAt: string;
  admin?: { firstName: string; lastName: string; email: string };
}

const actionLabels: Record<string, string> = {
  balance_adjustment: 'Balance Adjustment',
  deposit_approved: 'Deposit Approved',
  deposit_rejected: 'Deposit Rejected',
  withdrawal_approved: 'Withdrawal Approved',
  withdrawal_rejected: 'Withdrawal Rejected',
  notification_sent: 'Notification Sent',
};

const AdminLogsPage = () => {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    adminApi
      .getLogs({ limit: 100 })
      .then((res) => setLogs((res.data as AdminLog[]) || []))
      .catch(() => setLogs([]))
      .finally(() => setIsLoading(false));
  }, []);

  const columns: Column<AdminLog>[] = [
    {
      key: 'action',
      header: 'Action',
      render: (l) => (
        <span className="font-medium text-[#1c1917]">
          {actionLabels[l.action] || l.action}
        </span>
      ),
    },
    {
      key: 'admin',
      header: 'Admin',
      render: (l) => (
        <span className="text-sm text-[#44403c]">
          {l.admin ? `${l.admin.firstName} ${l.admin.lastName}` : 'System'}
        </span>
      ),
    },
    {
      key: 'target',
      header: 'Target',
      render: (l) => (
        <span className="text-sm text-[#78716c]">
          {l.targetType ? `${l.targetType} #${l.targetId ?? ''}` : '-'}
        </span>
      ),
    },
    {
      key: 'notes',
      header: 'Notes',
      render: (l) => (
        <span className="text-sm text-[#78716c] max-w-xs truncate block">
          {l.notes || '-'}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'Date',
      render: (l) => (
        <span className="text-sm text-[#78716c]">
          {format(new Date(l.createdAt), 'MMM d, yyyy h:mm a')}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-bold text-[#1c1917]">Audit Logs</h1>
        <p className="mt-1 text-[#78716c]">Complete history of administrator actions</p>
      </motion.div>

      {!isLoading && logs.length === 0 ? (
        <Card>
          <EmptyState
            icon={<ScrollText className="h-8 w-8" />}
            title="No logs yet"
            description="Administrator actions will appear here"
          />
        </Card>
      ) : (
        <DataTable
          columns={columns}
          data={logs}
          keyExtractor={(l) => l.id.toString()}
          loading={isLoading}
          emptyMessage="No logs found"
        />
      )}
    </div>
  );
};

export default AdminLogsPage;
