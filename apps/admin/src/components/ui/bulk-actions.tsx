import { useEffect, useState } from 'react';
import { XIcon } from 'lucide-react';
import { useUpdateEffect } from 'react-use';

import { cn } from '@/lib/utils';

import { Button } from './button';

type BulkActionBoxProps = {
  visible: boolean;
  children?: React.ReactNode;
  className?: string;
};

const BulkActionBox = ({ visible, children, className }: BulkActionBoxProps) => {
  return (
    <>
      <div
        className={cn(
          'border-input -my-1.5 items-center gap-2 rounded-lg border p-1 shadow-xs',
          visible ? 'flex' : 'hidden',
          className,
        )}
      >
        {children}
      </div>
    </>
  );
};

type BulkActionCloseButtonProps = {
  onClick: () => void;
  children?: React.ReactNode;
};
const BulkActionCloseButton = ({ onClick, children }: BulkActionCloseButtonProps) => {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="hover:text-foreground text-muted-foreground ms-1 size-6 shrink-0 hover:bg-transparent"
      onClick={() => {
        onClick?.();
      }}
    >
      {children ?? <XIcon className="size-4 stroke-[2.5px]" />}
    </Button>
  );
};

export { BulkActionBox, BulkActionCloseButton };
