// ============================================
// NEXORA CAPITAL - Timeline Component
// ============================================

import { cn } from '@/utils/cn';
import { format } from 'date-fns';
import type { Activity } from '@/types';
import { 
  ArrowDownLeft, 
  ArrowUpRight, 
  Target, 
  User, 
  Shield,
  CheckCircle2,
  Clock,
  AlertCircle
} from 'lucide-react';

interface TimelineProps {
  items: Activity[];
  className?: string;
}

const getActivityIcon = (type: Activity['type']) => {
  switch (type) {
    case 'deposit':
      return <ArrowDownLeft className="h-4 w-4" />;
    case 'withdrawal':
      return <ArrowUpRight className="h-4 w-4" />;
    case 'goal_created':
    case 'goal_updated':
      return <Target className="h-4 w-4" />;
    case 'profile_updated':
      return <User className="h-4 w-4" />;
    case 'security_updated':
      return <Shield className="h-4 w-4" />;
    default:
      return <CheckCircle2 className="h-4 w-4" />;
  }
};

const getStatusIcon = (status?: Activity['status']) => {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    case 'pending':
      return <Clock className="h-4 w-4 text-amber-500" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-500" />;
    default:
      return null;
  }
};

const Timeline = ({ items, className }: TimelineProps) => {
  if (items.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <p className="text-sm text-[#78716c]">No recent activity</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-0', className)}>
      {items.map((item, index) => (
        <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
          {/* Timeline line */}
          {index < items.length - 1 && (
            <div className="absolute left-5 top-10 bottom-0 w-px bg-[#e7e5e4]" />
          )}
          
          {/* Icon */}
          <div className={cn(
            'relative z-10 flex-shrink-0 w-10 h-10 rounded-full',
            'flex items-center justify-center',
            'bg-[#f5f5f4] text-[#1e3a5f]'
          )}>
            {getActivityIcon(item.type)}
          </div>
          
          {/* Content */}
          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-[#1c1917]">
                  {item.title}
                </p>
                <p className="mt-0.5 text-sm text-[#78716c]">
                  {item.description}
                </p>
              </div>
              {getStatusIcon(item.status)}
            </div>
            <p className="mt-2 text-xs text-[#a8a29e]">
              {format(new Date(item.createdAt), 'MMM d, yyyy • h:mm a')}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};

export { Timeline };
