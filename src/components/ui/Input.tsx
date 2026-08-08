// ============================================
// NEXORA CAPITAL - Input Component
// ============================================

import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = true,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn(fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[#44403c] mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#a8a29e]">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              'block w-full rounded-lg border bg-white',
              'text-[#1c1917] placeholder:text-[#a8a29e]',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]',
              'disabled:bg-[#f5f5f4] disabled:cursor-not-allowed',
              error
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-[#d6d3d1] hover:border-[#a8a29e]',
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              'h-11 px-4 text-sm',
              className
            )}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a8a29e]">
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <div className="mt-2 flex items-center gap-1.5 text-sm text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}
        {helperText && !error && (
          <p className="mt-2 text-sm text-[#78716c]">{helperText}</p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export { Input };
