import { ComponentProps } from 'react';
import { NavLink } from 'react-router';
import { __, _n, sprintf } from '@wordpress/i18n';

import { useCountByStatusQuery } from '@/lib/queries/requests.queries';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { HeaderNavMenuItem, HeaderNavMenuList } from '@/components/ui/navmenu-header';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import DashboardIcon from '@/components/icons/DashboardIcon';
import RequestIcon from '@/components/icons/RequestIcon';
import RolesIcon from '@/components/icons/RolesIcon';
import SettingsIcon from '@/components/icons/SettingsIcon';
import WholesalersIcon from '@/components/icons/WholesalersIcon';

export function HeaderMenu() {
  return (
    <HeaderNavMenuList className="*:data-[slot=header-navigation-menu-indicator]:bg-primary">
      <CustomMenuItem asChild key="dashboard">
        <NavLink to="/dashboard">
          <DashboardIcon className="stroke-2" />
          <span>{__('Dashboard', 'yay-wholesale-b2b')}</span>
        </NavLink>
      </CustomMenuItem>
      <CustomMenuItem asChild key="requests">
        <NavLink to="/requests">
          <RequestIcon className="stroke-2" />
          <span>
            {__('Requests', 'yay-wholesale-b2b')} <PendingRequestCount />
          </span>
        </NavLink>
      </CustomMenuItem>
      <CustomMenuItem asChild key="wholesalers">
        <NavLink to="/wholesalers">
          <WholesalersIcon className="stroke-2" />
          <span>{__('Wholesalers', 'yay-wholesale-b2b')}</span>
        </NavLink>
      </CustomMenuItem>
      <CustomMenuItem asChild key="roles">
        <NavLink to="/roles">
          <RolesIcon className="stroke-2" />
          <span>{__('Roles', 'yay-wholesale-b2b')}</span>
        </NavLink>
      </CustomMenuItem>
      <CustomMenuItem asChild key="settings">
        <NavLink to="/settings">
          <SettingsIcon className="stroke-2" />
          <span>{__('Settings', 'yay-wholesale-b2b')}</span>
        </NavLink>
      </CustomMenuItem>
    </HeaderNavMenuList>
  );
}

function CustomMenuItem({ className, ...props }: ComponentProps<typeof HeaderNavMenuItem>) {
  return (
    <HeaderNavMenuItem
      className={cn(
        'max-md:flex-col sm:max-md:px-3',
        'sm:max-md:pt-2',
        '*:[svg]:size-4 sm:*:[svg]:size-3.5 md:*:[svg]:size-4',
        'max-md:text-xs max-sm:*:[span]:hidden',
        'aria-[current=page]:text-primary',
        className,
      )}
      {...props}
    />
  );
}

function PendingRequestCount({ className }: ComponentProps<typeof Badge>) {
  const { data: requestsCount } = useCountByStatusQuery();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Badge
          variant="destructive"
          className={cn('h-5 min-w-5 px-1 leading-0 tabular-nums', requestsCount?.pending ? '' : 'hidden', className)}
        >
          {requestsCount?.pending}
        </Badge>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {sprintf(
          _n('%d request is pending', '%d requests are pending', requestsCount?.pending ?? 0, 'yay-wholesale-b2b'),
          requestsCount?.pending ?? 0,
        )}
      </TooltipContent>
    </Tooltip>
  );
}
