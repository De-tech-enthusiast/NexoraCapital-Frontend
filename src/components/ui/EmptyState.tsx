// ============================================
// NEXORA CAPITAL - Empty State Component
// ============================================

import { cn } from '@/utils/cn';
import { Button } from './Button';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const EmptyState = ({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        'py-12 px-4',
        className
      )}
    >
      {icon && (
        <div className="p-4 bg-[#f5f5f4] rounded-full text-[#a8a29e] mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-lg font-medium text-[#1c1917]">{title}</h3>
      {description && (
        <p className="mt-2 text-sm text-[#78716c] max-w-sm">{description}</p>
      )}
      {action && (
        <Button
          variant="outline"
          onClick={action.onClick}
          className="mt-6"
        >
          {action.label}
        </Button>
      )}
    </div>
  );
};

export { EmptyState };
