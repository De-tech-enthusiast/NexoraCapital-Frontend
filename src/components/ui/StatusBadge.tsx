// ============================================
// NEXORA CAPITAL - Status Badge Component
// ============================================

import { cn } from '@/utils/cn';
import type { TransactionStatus, NotificationType } from '@/types';

interface StatusBadgeProps {
  status: TransactionStatus | NotificationType | string;
  className?: string;
}

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config: Record<string, { label: string; className: string }> = {
    // Transaction statuses
    completed: {
      label: 'Completed',
      className: 'bg-green-50 text-green-700 border-green-200',
    },
    pending: {
      label: 'Pending',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    confirming: {
      label: 'Confirming',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    failed: {
      label: 'Failed',
      className: 'bg-red-50 text-red-700 border-red-200',
    },
    cancelled: {
      label: 'Cancelled',
      className: 'bg-gray-100 text-gray-700 border-gray-300',
    },
    processing: {
      label: 'Processing',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    // Notification types
    success: {
      label: 'Success',
      className: 'bg-green-50 text-green-700 border-green-200',
    },
    info: {
      label: 'Info',
      className: 'bg-blue-50 text-blue-700 border-blue-200',
    },
    warning: {
      label: 'Warning',
      className: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    error: {
      label: 'Error',
      className: 'bg-red-50 text-red-700 border-red-200',
    },
    // Verification statuses
    verified: {
      label: 'Verified',
      className: 'bg-green-50 text-green-700 border-green-200',
    },
    unverified: {
      label: 'Unverified',
      className: 'bg-red-50 text-red-700 border-red-200',
    },
  };

  const { label, className: statusClassName } = config[status.toLowerCase()] || {
    label: status,
    className: 'bg-gray-50 text-gray-700 border-gray-200',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
        statusClassName,
        className
      )}
    >
      {label}
    </span>
  );
};

export { StatusBadge };
