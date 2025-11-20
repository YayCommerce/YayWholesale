import * as React from 'react';
import { Check, ChevronDown, ChevronLeft, ChevronRight, EllipsisVertical } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { ButtonGroup } from './button-group';

interface ChildrenActionItem {
  icon?: React.ReactNode;
  title?: string;
  onClick?: () => void;
}

export interface ActionItem {
  icon?: React.ReactNode;
  title?: string;
  type: 'button' | 'menu';
  children?: ChildrenActionItem[];
  onClick?: () => void;
}

interface SelectActionButtonProps {
  title?: string;
  icon?: React.ReactNode;
  items: ActionItem[];
  size?: 'sm' | 'default' | 'lg';
  className?: string;
  disabled?: boolean;
}

export const SelectActionButton: React.FC<SelectActionButtonProps> = ({
  title,
  icon,
  items,
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
          {items.map((item, index) => {
            switch (item.type) {
              case 'button':
                return (
                  <Button
                    key={index}
                    type="button"
                    variant="ghost"
                    onClick={() => {
                      item.onClick?.();
                      setOpen(false);
                    }}
                    className={cn(
                      'flex w-full cursor-pointer items-center justify-start gap-2 rounded-sm px-2.5 py-2 text-sm',
                    )}
                  >
                    {item.icon && (
                      <span className="flex items-center justify-center">{item.icon}</span>
                    )}
                    {item.title && <span>{item.title}</span>}
                  </Button>
                );
              case 'menu':
                return (
                  <Button
                    key={index}
                    type="button"
                    variant="ghost"
                    className={cn(
                      'flex w-full cursor-pointer items-center justify-between gap-10 rounded-sm px-2.5 py-2 text-sm',
                    )}
                  >
                    <div
                      className="flex gap-2"
                      onClick={() => {
                        item.onClick?.();
                        setOpen(false);
                      }}
                    >
                      {item.icon && (
                        <span className="flex items-center justify-center">{item.icon}</span>
                      )}
                      {item.title && <span>{item.title}</span>}
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
                        {item.children?.map((childrenItem, childrenIndex) => (
                          <Button
                            key={childrenIndex}
                            type="button"
                            variant="ghost"
                            onClick={() => {
                              childrenItem.onClick?.();
                              setOpen(false);
                            }}
                            className={cn(
                              'flex w-full cursor-pointer items-center justify-start gap-2 rounded-sm px-2.5 py-2 text-sm',
                            )}
                          >
                            {childrenItem.icon && (
                              <span className="flex items-center justify-center">
                                {childrenItem.icon}
                              </span>
                            )}
                            {childrenItem.title && <span>{childrenItem.title}</span>}
                          </Button>
                        ))}
                      </PopoverContent>
                    </Popover>
                  </Button>
                );
            }
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};
