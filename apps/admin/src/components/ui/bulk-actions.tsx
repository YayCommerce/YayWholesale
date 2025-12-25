import { createContext, Dispatch, FC, SetStateAction, useContext, useState } from 'react';
import { ChevronRight } from 'lucide-react';

import { cn } from '@/lib/utils';

import { Button } from './button';
import { ButtonGroup } from './button-group';
import { Popover, PopoverContent, PopoverTrigger } from './popover';

type BulkActionMenuContextType = {
  setOpen: Dispatch<SetStateAction<boolean>>;
};

const BulkActionMenuContext = createContext<BulkActionMenuContextType | null>(null);

export const BulkActionMenu = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = useState(false);

  return (
    <BulkActionMenuContext.Provider value={{ setOpen }}>
      <Popover open={open} onOpenChange={setOpen}>
        {children}
      </Popover>
    </BulkActionMenuContext.Provider>
  );
};

interface BulkActionButtonProps {
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  onClick?: () => void;
}

export const BulkActionButton: FC<BulkActionButtonProps> = ({
  children,
  className,
  disabled,
  onClick,
}) => {
  const context = useContext(BulkActionMenuContext);

  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => {
        onClick?.();
        if (context) context.setOpen(false);
      }}
      className={cn(
        'flex w-full cursor-pointer items-center justify-start gap-2 rounded-sm px-2.5 py-2 text-sm hover:bg-[#F4F4F5]',
        className,
      )}
      disabled={disabled}
    >
      {children}
    </Button>
  );
};

export const BulkMenuButtonAndTrigger: FC<BulkActionButtonProps> = ({
  children,
  className,
  disabled,
  onClick,
}) => {
  const context = useContext(BulkActionMenuContext);
  return (
    <div className="relative flex">
      <Button
        variant="ghost"
        className={cn(
          'flex w-35 cursor-pointer items-center justify-between gap-10 rounded-sm px-2.5 py-2 text-sm hover:bg-[#F4F4F5]',
          className,
        )}
        disabled={disabled}
        onClick={() => {
          onClick?.();
          if (context) context.setOpen(false);
        }}
      >
        <div className="flex gap-2">{children}</div>
      </Button>
      <PopoverTrigger
        className="text-muted-foreground absolute top-1/2 right-1 -translate-y-1/2"
        onMouseOver={() => {
          if (context) context.setOpen(true);
        }}
      >
        <ChevronRight className="h-4 w-4" />
      </PopoverTrigger>
    </div>
  );
};

export const BulkActionMenuContent = ({ children }: { children: React.ReactNode }) => {
  const context = useContext(BulkActionMenuContext);

  return (
    <PopoverContent
      side="right"
      align="start"
      alignOffset={-15}
      className="w-fit translate-x-3 p-1"
    >
      {children}
    </PopoverContent>
  );
};
