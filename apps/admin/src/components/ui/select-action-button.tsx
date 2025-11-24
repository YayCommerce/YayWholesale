import * as React from 'react';
import { EllipsisVertical } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

interface SelectActionButtonProps {
  title?: string;
  icon?: React.ReactNode;
  children?: React.ReactNode;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  disabled?: boolean;
}

interface SelectActionContextProps {
  setOpenActions: React.Dispatch<React.SetStateAction<boolean>>;
}

const selectActionContext = React.createContext<SelectActionContextProps>({
  setOpenActions: () => {},
});

export const SelectActionButton: React.FC<SelectActionButtonProps> = ({
  title,
  icon,
  children,
  size = 'default',
  className,
  disabled = false,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size={size}
          disabled={disabled}
          className={cn(
            'hover:text-primary hover:bg-primary/6 group flex cursor-pointer items-center gap-1.5 px-2.5',
            !title && 'px-2',
            className,
          )}
        >
          {title && <span className="text-sm font-normal">{title}</span>}
          {icon && (
            <span className="group-hover:text-primary text-icon flex items-center">{icon}</span>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent align="start" sideOffset={9} className="w-fit min-w-[20px] p-1">
        <div className="flex flex-col">
          <selectActionContext.Provider value={{ setOpenActions: setOpen }}>
            {children}
          </selectActionContext.Provider>
        </div>
      </PopoverContent>
    </Popover>
  );
};

interface ActionButtonProps {
  icon?: React.ReactNode;
  title?: string;
  className?: string;
  disabled?: boolean;
  onClick?: () => {};
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  title,
  className,
  disabled,
  onClick,
}) => {
  const { setOpenActions: setOpen } = React.useContext(selectActionContext);
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={() => {
        onClick?.();
        setOpen(false);
      }}
      className={cn(
        'flex w-full cursor-pointer items-center justify-start gap-2 rounded-sm px-2.5 py-2 text-sm',
        className,
      )}
      disabled={disabled}
    >
      {icon && <span className="flex items-center justify-center">{icon}</span>}
      {title && <span>{title}</span>}
    </Button>
  );
};

interface ActionMenuButtonProps extends ActionButtonProps {
  children?: React.ReactNode;
}

export const ActionMenuButton: React.FC<ActionMenuButtonProps> = ({
  icon,
  title,
  className,
  disabled,
  onClick,
  children,
}) => {
  const { setOpenActions: setOpen } = React.useContext(selectActionContext);
  return (
    <Button
      type="button"
      variant="ghost"
      className={cn(
        'flex w-full cursor-pointer items-center justify-between gap-10 rounded-sm px-2.5 py-2 text-sm',
        className,
      )}
      disabled={disabled}
    >
      <div
        className="flex gap-2"
        onClick={() => {
          onClick?.();
          setOpen(false);
        }}
      >
        {icon && <span className="flex items-center justify-center">{icon}</span>}
        {title && <span>{title}</span>}
      </div>
      <Popover>
        <PopoverTrigger className="text-muted-foreground">
          <EllipsisVertical />
        </PopoverTrigger>
        <PopoverContent
          side="right"
          align="start"
          alignOffset={-15}
          className="w-fit translate-x-3 p-1"
        >
          {children}
        </PopoverContent>
      </Popover>
    </Button>
  );
};
