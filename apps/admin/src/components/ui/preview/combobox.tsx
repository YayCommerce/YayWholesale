import { cn } from '@/lib/utils';

import { Button } from '../button';
import { PopoverTrigger } from '../popover';

function ComboboxTrigger({
  className,
  children,
  disabled,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}) {
  return (
    <PopoverTrigger asChild>
      <Button
        variant="outline"
        role="combobox"
        disabled={disabled}
        className={cn(
          'hover:border-foreground focus-visible:border-foreground focus-visible:hover:border-accent-foreground data-[state=open]:border-foreground data-[state=open]:[&_svg:not([class*="text-"])]:text-foreground [&_svg:not([class*="text-"])]:text-muted-foreground hover:[&_svg:not([class*="text-"])]:text-foreground w-fit justify-between font-normal shadow-none hover:bg-transparent [&_svg:not([class*="text-"])]:transition-colors',
          className,
        )}
        {...props}
      >
        {children}
      </Button>
    </PopoverTrigger>
  );
}

function ComboboxCheckbox({
  className,
  children,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        'border-input data-[selected=true]:border-primary data-[selected=true]:bg-primary data-[selected=true]:text-primary-foreground pointer-events-none size-4 shrink-0 rounded-[4px] border transition-all select-none *:[svg]:opacity-0 data-[selected=true]:*:[svg]:opacity-100',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export { ComboboxTrigger, ComboboxCheckbox };
