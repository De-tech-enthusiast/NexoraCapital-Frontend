// ============================================
// NEXORA CAPITAL - Select Component
// ============================================

import { forwardRef } from 'react';
import { cn } from '@/utils/cn';
import { ChevronDown, AlertCircle } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      label,
      error,
      helperText,
      options,
      placeholder,
      fullWidth = true,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={cn(fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-[#44403c] mb-2"
          >
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={selectId}
            className={cn(
              'block w-full appearance-none rounded-lg border bg-white',
              'text-[#1c1917]',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-[#1e3a5f] focus:border-[#1e3a5f]',
              'disabled:bg-[#f5f5f4] disabled:cursor-not-allowed',
              error
                ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                : 'border-[#d6d3d1] hover:border-[#a8a29e]',
              'h-11 px-4 pr-10 text-sm',
              className
            )}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#a8a29e]">
            <ChevronDown className="h-4 w-4" />
          </div>
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

Select.displayName = 'Select';

export { Select, type SelectOption };
