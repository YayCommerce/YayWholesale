import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';

import { cn } from '@/lib/utils';

interface HeaderNavMenuListProps extends React.ComponentProps<'ul'> {
  asChild?: boolean;
}

const HeaderNavMenuList = React.forwardRef<HTMLUListElement, HeaderNavMenuListProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'ul';
    return (
      <Comp
        data-slot="header-navigation-menu-list"
        className={cn('flex h-9 flex-1 list-none items-stretch justify-center gap-8', className)}
        {...props}
        ref={ref}
      />
    );
  },
);

interface HeaderNavMenuItemProps extends React.ComponentProps<'li'> {
  asChild?: boolean;
}

const HeaderNavMenuItem = React.forwardRef<HTMLLIElement, HeaderNavMenuItemProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'li';
    return (
      <Comp
        data-slot="header-navigation-menu-item"
        className={cn(
          'text-foreground hover:text-primary transition-border-color flex cursor-default items-center gap-1.5 border-b-3 border-solid border-transparent text-sm ring-offset-2 transition-colors outline-none hover:cursor-pointer focus-visible:ring-[1.5px]',
          'data-[state=active]:text-primary data-[state=active]:hover:text-primary-accent data-[state=active]:border-primary data-[state=active]:hover:border-primary-accent data-[state=active]:focus-visible:text-primary-accent data-[state=active]:focus-visible:border-primary-accent',
          'data-[active=true]:text-primary data-[active=true]:hover:text-primary-accent data-[active=true]:border-primary data-[active=true]:hover:border-primary-accent data-[active=true]:focus-visible:text-primary-accent data-[active=true]:focus-visible:border-primary-accent',
          className,
        )}
        {...props}
        ref={ref}
      />
    );
  },
);

export { HeaderNavMenuList, HeaderNavMenuItem };
