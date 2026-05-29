import { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { cn } from '@/lib/utils';
import { HeaderMenu } from './HeaderMenu';

export default function Header() {
  const scrolled = useScrolled();
  return (
    <header
      className={cn(
        'bg-background relative flex h-13.5 items-center justify-between gap-0 py-0 pr-3 lg:pr-6',
        scrolled ? 'top-0 shadow-[0_8px_8px_0_rgba(85,93,102,0.3)]' : 'top-11.5 shadow-none',
        'sm:top-11.5 md:top-8',
        'z-10 md:pr-3',
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
        <div id="yay-wholesale-b2b-header-actions" />
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
