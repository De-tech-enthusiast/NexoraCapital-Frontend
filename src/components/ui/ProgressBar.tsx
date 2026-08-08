// ============================================
// NEXORA CAPITAL - Progress Bar Component
// ============================================

import { cn } from '@/utils/cn';
import { motion } from 'framer-motion';

interface ProgressBarProps {
  value: number;
  max?: number;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
  label?: string;
  className?: string;
}

const ProgressBar = ({
  value,
  max = 100,
  showValue = true,
  size = 'md',
  variant = 'default',
  label,
  className,
}: ProgressBarProps) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variants = {
    default: 'bg-[#1e3a5f]',
    success: 'bg-green-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-2">
          {label && (
            <span className="text-sm font-medium text-[#44403c]">{label}</span>
          )}
          {showValue && (
            <span className="text-sm font-semibold text-[#1c1917]">
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      <div className={cn('w-full bg-[#e7e5e4] rounded-full overflow-hidden', sizes[size])}>
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={cn('h-full rounded-full', variants[variant])}
        />
      </div>
    </div>
  );
};

export { ProgressBar };
