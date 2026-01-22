import * as React from 'react';
import { InputHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

import { focusVariants } from './variants/focus.variants';
import { InputVariantProps, inputVariants } from './variants/input.variants';

type InputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> & InputVariantProps;
// using react forward ref and using function, not component
const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, variant, readOnly, ...props }, ref) => {
    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-sm border bg-transparent p-2 pl-3 text-base shadow-xs transition-all outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium focus:shadow-none focus-visible:shadow-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          focusVariants(),
          inputVariants({ variant }),
          readOnly && 'border-border bg-muted-400 hover:border-border cursor-default shadow-xs',
          className,
        )}
        {...props}
        ref={ref}
      />
    );
  },
);

export { Input };
export type { InputProps };
