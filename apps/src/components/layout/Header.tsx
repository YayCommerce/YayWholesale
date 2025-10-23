import { useCallback, useEffect, useState } from 'react';
import { CircleNotchIcon } from '@phosphor-icons/react';
import { useMatch, useNavigate } from 'react-router-dom';

import { __, cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import DashboardIcon from '@/components/icons/DashboardIcon';
import RequestIcon from '@/components/icons/RequestIcon';
import RolesIcon from '@/components/icons/RolesIcon';
import SettingsIcon from '@/components/icons/SettingsIcon';

import { HeaderNavMenuItem, HeaderNavMenuList } from '../ui/navmenu-header';

const NAV_ITEMS = [
  { path: '/dashboard/*', to: '/dashboard', icon: DashboardIcon, label: 'Dashboard' },
  { path: '/request/*', to: '/request', icon: RequestIcon, label: 'Request' },
  { path: '/roles/*', to: '/roles', icon: RolesIcon, label: 'Roles' },
  { path: '/settings/*', to: '/settings', icon: SettingsIcon, label: 'Settings' },
];

function useScrolled(threshold = 0) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}

export default function Header() {
  const navigate = useNavigate();
  const scrolled = useScrolled();
  const isSettingRoute = useMatch({ path: '/settings/*' });
  const [isLoading, setIsLoading] = useState(false);

  const handleNavClick = useCallback((to: string) => navigate(to), [navigate]);

  const baseItemClass =
    'flex cursor-pointer flex-row items-center gap-1.5 sm:flex-col sm:pt-1.5 md:flex-col md:pt-1.5 lg:flex-row';
  const activeItemClass =
    'text-primary border-primary hover:text-primary-accent hover:border-primary-accent focus-visible:text-primary-accent focus-visible:border-primary-accent';

  return (
    <header
      className={cn(
        'bg-background fixed z-50 flex h-[56px] w-full items-center justify-between gap-[5px] pt-0 transition-shadow duration-300',
        scrolled ? 'top-0 shadow-[0_8px_8px_0_rgba(85,93,102,0.3)]' : 'top-[45px] shadow-none',
        'sm:top-[45px]',
        'md:top-8 md:gap-5 md:pr-3',
        'lg:left-40 lg:w-[calc(100%-160px)]',
      )}
    >
      {/* Logo */}
      <div className="border-input flex h-full bg-[#FFF5DB] px-[3px] pt-[3px]">
        <img
          src={`${window.yayWholesale.plugin_url}/assets/images/favicon.svg`}
          alt="YayWholesale"
          className="h-[50px] w-[50px]"
        />
      </div>

      {/* Navigation */}
      <HeaderNavMenuList className="h-[54px] justify-start gap-7.5">
        {NAV_ITEMS.map(({ path, to, icon: Icon, label }) => {
          const isActive = !!useMatch({ path });
          return (
            <HeaderNavMenuItem
              key={to}
              onClick={() => handleNavClick(to)}
              className={cn(baseItemClass, isActive && activeItemClass)}
            >
              <Icon />
              <span className="hidden sm:inline">{__(label)}</span>
            </HeaderNavMenuItem>
          );
        })}
      </HeaderNavMenuList>

      {/* Save button (Settings only) */}
      {isSettingRoute && (
        <Button type="submit" disabled={isLoading} className="relative cursor-pointer">
          {!isLoading ? (
            <span>{__('Save Changes')}</span>
          ) : (
            <span className="absolute inset-0 flex items-center justify-center">
              <CircleNotchIcon className="animate-spin" />
            </span>
          )}
        </Button>
      )}
    </header>
  );
}
