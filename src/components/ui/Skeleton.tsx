// ============================================
// NEXORA CAPITAL - Skeleton Component
// ============================================

import { cn } from '@/utils/cn';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
}

const Skeleton = ({
  className,
  variant = 'text',
  width,
  height,
}: SkeletonProps) => {
  const variants = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-none',
    rounded: 'rounded-lg',
  };

  return (
    <div
      className={cn(
        'animate-pulse bg-[#e7e5e4]',
        variants[variant],
        className
      )}
      style={{
        width: width,
        height: height,
      }}
    />
  );
};

// Pre-built skeleton layouts
const StatCardSkeleton = () => (
  <div className="bg-white rounded-xl border border-[#e7e5e4] p-6 space-y-4">
    <Skeleton width={120} height={16} />
    <Skeleton width={100} height={32} />
    <Skeleton width={80} height={16} />
  </div>
);

const ChartSkeleton = () => (
  <div className="bg-white rounded-xl border border-[#e7e5e4] p-6">
    <Skeleton width={150} height={20} className="mb-6" />
    <Skeleton height={200} className="rounded-lg" />
  </div>
);

const TableRowSkeleton = ({ columns = 4 }: { columns?: number }) => (
  <div className="flex items-center gap-4 p-4 border-b border-[#e7e5e4]">
    {[...Array(columns)].map((_, i) => (
      <Skeleton key={i} height={16} className="flex-1" />
    ))}
  </div>
);

const CardSkeleton = () => (
  <div className="bg-white rounded-xl border border-[#e7e5e4] p-6 space-y-4">
    <div className="flex items-center justify-between">
      <Skeleton width={150} height={20} />
      <Skeleton width={24} height={24} variant="circular" />
    </div>
    <Skeleton height={100} className="rounded-lg" />
  </div>
);

export { Skeleton, StatCardSkeleton, ChartSkeleton, TableRowSkeleton, CardSkeleton };
