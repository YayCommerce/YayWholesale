import { ReactNode } from 'react';
import { XIcon } from '@phosphor-icons/react';

import { cn } from '@/lib/utils';

interface TableToasterProps {
  className?: string;
  children: ReactNode;
}

function TableToaster({ className, children }: TableToasterProps) {
  return (
    <div
      className={cn(
        'pointer-events-none fixed bottom-10 left-1/2 z-[9999] w-full max-w-md -translate-x-1/2 transform px-4 sm:left-3/5',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface TableToastProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}

function TableToast({ open, onOpenChange, children, className }: TableToastProps) {
  if (!open) return null;

  return (
    <div
      className={cn(
        'animate-in slide-in-from-bottom-full pointer-events-auto relative flex h-11.5 w-fit items-center justify-between gap-x-2 gap-y-1 overflow-hidden rounded-md border bg-white px-1.5 shadow transition-all',
        className,
      )}
    >
      {children}
    </div>
  );
}

interface TableToastCloseProps {
  onClick?: () => void;
  className?: string;
}

function TableToastClose({ onClick, className }: TableToastCloseProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn('flex cursor-pointer items-center justify-center px-1', className)}
    >
      <XIcon weight="bold" strokeWidth="2" className="hover:text-foreground text-icon h-3 w-3" />
    </button>
  );
}

interface TableToastTitleProps {
  children: ReactNode;
  className?: string;
}

function TableToastTitle({ children, className }: TableToastTitleProps) {
  return (
    <div
      className={cn('inline-flex items-center gap-2 text-center text-sm leading-none', className)}
    >
      {children}
    </div>
  );
}

export { TableToast, TableToastClose, TableToaster, TableToastTitle };
