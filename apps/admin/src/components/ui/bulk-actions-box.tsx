import { useState } from 'react';
import { __, sprintf } from '@wordpress/i18n';
import { XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

import { Button } from './button';
import { TableToast, TableToastClose, TableToaster, TableToastTitle } from './table-toast';

type BulkActionBoxProps = {
  selected: number;
  onClose: () => void;
  children?: React.ReactNode;
  className?: string;
};

const BulkActionBox = ({ selected, onClose, children, className }: BulkActionBoxProps) => {
  return (
    <>
      <div
        className={cn(
          'border-input items-center gap-2 rounded-md border px-1.5 py-1 shadow-sm',
          selected > 1 ? 'flex' : 'hidden',
          className,
        )}
      >
        <Button
          variant="ghost"
          size="icon"
          className="hover:text-foreground text-muted-foreground h-6 w-6 shrink-0 hover:bg-transparent"
          onClick={() => {
            onClose();
          }}
        >
          <XIcon className="size-4" />
        </Button>
        {children}
      </div>
    </>
  );
};

export default BulkActionBox;
