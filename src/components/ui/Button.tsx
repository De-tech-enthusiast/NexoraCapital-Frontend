// ============================================
// NEXORA CAPITAL - Button Component
// ============================================

import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      fullWidth = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary: cn(
        'bg-[#1e3a5f] text-white',
        'hover:bg-[#152942]',
        'focus:ring-2 focus:ring-[#1e3a5f] focus:ring-offset-2',
        'disabled:bg-[#1e3a5f]/50 disabled:cursor-not-allowed'
      ),
      secondary: cn(
        'bg-[#f5f5f4] text-[#1e3a5f]',
        'hover:bg-[#e7e5e4]',
        'focus:ring-2 focus:ring-[#1e3a5f] focus:ring-offset-2',
        'disabled:bg-[#f5f5f4]/50 disabled:cursor-not-allowed'
      ),
      outline: cn(
        'border border-[#d6d3d1] bg-white text-[#1e3a5f]',
        'hover:bg-[#fafaf9] hover:border-[#a8a29e]',
        'focus:ring-2 focus:ring-[#1e3a5f] focus:ring-offset-2',
        'disabled:bg-white/50 disabled:cursor-not-allowed'
      ),
      ghost: cn(
        'bg-transparent text-[#1e3a5f]',
        'hover:bg-[#f5f5f4]',
        'focus:ring-2 focus:ring-[#1e3a5f] focus:ring-offset-2',
        'disabled:text-[#1e3a5f]/50 disabled:cursor-not-allowed'
      ),
      danger: cn(
        'bg-red-600 text-white',
        'hover:bg-red-700',
        'focus:ring-2 focus:ring-red-600 focus:ring-offset-2',
        'disabled:bg-red-600/50 disabled:cursor-not-allowed'
      ),
    };

    const sizes = {
      sm: 'h-9 px-4 text-sm',
      md: 'h-11 px-6 text-sm',
      lg: 'h-12 px-8 text-base',
    };

    return (
      <button
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center gap-2',
          'font-medium transition-all duration-200',
          'rounded-lg',
          'focus:outline-none',
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          (disabled || isLoading) && 'opacity-70 cursor-not-allowed',
          className
        )}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {!isLoading && leftIcon}
        {children}
        {!isLoading && rightIcon}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
