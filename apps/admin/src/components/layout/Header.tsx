import { useEffect, useState } from 'react';
import { CircleNotchIcon } from '@phosphor-icons/react';
import { useMatch } from 'react-router-dom';
import { __ } from '@wordpress/i18n';

import { useIsMutatingSettings } from '@/lib/queries/settings.queries';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { HeaderMenu } from './HeaderMenu';

export default function Header() {
  const scrolled = useScrolled();
  const isSettingRoute = useMatch({ path: '/settings/*' });
  const isSavingSettings = useIsMutatingSettings() > 0;

  return (
    <header
      className={cn(
        'bg-background relative flex h-13.5 items-center justify-between gap-0 py-0 pr-3 lg:pr-6',
        scrolled ? 'top-0 shadow-[0_8px_8px_0_rgba(85,93,102,0.3)]' : 'top-11.5 shadow-none',
        'sm:top-11.5 md:top-8',
        'md:pr-3',
      )}
    >
      {/* Logo */}
      <div className="border-border flex h-full bg-[#FFF5DB] px-[3px] pt-[3px]">
        <img
          src={`${window.yayWholesaleB2BMeta.wholesaleMeta.assetsUrl}/images/favicon.svg`}
          alt="YayWholesale"
          className="h-[50px] w-[50px]"
        />
      </div>

      <HeaderMenu />

      <div className="flex items-center">
        {/* Save button (Settings only) */}
        {isSettingRoute && (
          <Button type="submit" form="settings-form" disabled={isSavingSettings} className="relative ms-4">
            <span className={isSavingSettings ? 'opacity-0' : 'opacity-100'}>
              <span className="max-sm:hidden">{__('Save Changes', 'yay-wholesale-b2b')}</span>
              <span className="sm:hidden">{__('Save', 'yay-wholesale-b2b')}</span>
            </span>
            {isSavingSettings && (
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <CircleNotchIcon className="animate-spin" />
              </span>
            )}
          </Button>
        )}
      </div>
    </header>
  );
}

function useScrolled(threshold = 0) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold]);
  return scrolled;
}
