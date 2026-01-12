import * as React from 'react';

import { cn } from '@/lib/utils';

import { focusVariants } from './variants/focus.variants';

// using react forward ref and using function, not component
const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, readOnly, type, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          'file:text-foreground focus-visible:border-foreground focus-visible:hover:border-accent-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input hover:border-foreground flex h-9 w-full min-w-0 rounded-sm border bg-transparent p-2 pl-3 text-sm shadow-xs transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
          readOnly && 'border-border bg-muted-400 hover:border-border cursor-default shadow-xs',
          className,
        )}
        {...props}
        ref={ref}
      />
    );
  },
);

function InputPrefix({
  children,
  className,
  variant = 'transparent',
  ...props
}: React.ComponentProps<'div'> & {
  variant?: 'transparent' | 'muted';
}) {
  return (
    <div
      data-slot="input-prefix"
      className={cn(
        'text-muted-foreground absolute inset-y-px start-px flex items-center rounded-s-sm px-2.5',
        variant === 'transparent' && 'bg-transparent',
        variant === 'muted' && 'bg-muted border-border border-e',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function InputSuffix({
  children,
  className,
  variant = 'transparent',
  ...props
}: React.ComponentProps<'div'> & {
  variant?: 'transparent' | 'muted';
}) {
  return (
    <div
      data-slot="input-suffix"
      className={cn(
        'text-muted-foreground absolute inset-y-px end-px flex items-center rounded-e-sm px-2.5',
        variant === 'transparent' && 'bg-transparent',
        variant === 'muted' && 'bg-muted border-border border-s',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { Input, InputPrefix, InputSuffix };
