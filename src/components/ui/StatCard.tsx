// ============================================
// NEXORA CAPITAL - Stat Card Component
// ============================================

import { cn } from '@/utils/cn';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  currency?: string;
  icon?: React.ReactNode;
  className?: string;
  loading?: boolean;
}

const StatCard = ({
  title,
  value,
  subtitle,
  change,
  changeType = 'neutral',
  currency,
  icon,
  className,
  loading = false,
}: StatCardProps) => {
  const formatValue = (val: string | number) => {
    if (typeof val === 'string') return val;
    
    if (currency) {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      }).format(val);
    }
    
    return new Intl.NumberFormat('en-US').format(val);
  };

  const getChangeIcon = () => {
    switch (changeType) {
      case 'positive':
        return <TrendingUp className="h-3.5 w-3.5" />;
      case 'negative':
        return <TrendingDown className="h-3.5 w-3.5" />;
      default:
        return <Minus className="h-3.5 w-3.5" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'positive':
        return 'text-green-600 bg-green-50';
      case 'negative':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-[#78716c] bg-[#f5f5f4]';
    }
  };

  if (loading) {
    return (
      <div className={cn(
        'bg-white rounded-xl border border-[#e7e5e4] p-6',
        className
      )}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 w-24 bg-[#e7e5e4] rounded" />
          <div className="h-8 w-32 bg-[#e7e5e4] rounded" />
          <div className="h-3 w-20 bg-[#e7e5e4] rounded" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn(
        'bg-white rounded-xl border border-[#e7e5e4] p-6',
        'hover:border-[#d6d3d1] hover:shadow-lg hover:shadow-[#1e3a5f]/5',
        'transition-all duration-200',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#78716c]">{title}</p>
          <p className="mt-2 text-2xl font-semibold text-[#1c1917]">
            {formatValue(value)}
          </p>
          {subtitle && (
            <p className="mt-1 text-xs text-[#a8a29e]">{subtitle}</p>
          )}
          {change !== undefined && (
            <div className={cn(
              'mt-3 inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium',
              getChangeColor()
            )}>
              {getChangeIcon()}
              <span>{Math.abs(change)}%</span>
            </div>
          )}
        </div>
        {icon && (
          <div className="p-3 bg-[#f5f5f4] rounded-lg text-[#1e3a5f]">
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export { StatCard };
