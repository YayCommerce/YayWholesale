import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CircleNotchIcon,
  GearIcon,
  HouseIcon,
  ReceiptIcon,
  UserGearIcon,
} from '@phosphor-icons/react';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { __ } from '@wordpress/i18n';
import { useForm } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FormProvider } from '@/components/ui/form';
import { HeaderNavMenuItem, HeaderNavMenuList } from '@/components/ui/navmenu-header';
import { Toaster } from '@/components/ui/sonner';
import { showToast } from '@/components/custom/showToast';
import { Footer } from '@/components/layout/Footer';
import DashboardTab from '@/components/tabs/dashboard/DashboardTab';
import RequestTab from '@/components/tabs/request/RequestTab';
import RolesTab from '@/components/tabs/roles/RolesTab';
import SettingsTab from '@/components/tabs/settings/SettingsTab';

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState('dashboard');

  const form = useForm<any>({
    // resolver: zodResolver({} as any),
    // defaultValues: {},
  });

  async function onSubmit(data: any) {
    // try {
    //   // show loading
    //   setIsLoading(true);
    //   showToast.success(__('Settings saved!'));
    // } catch (error) {
    //   showToast.error(__('Oops! Something went wrong!'));
    // } finally {
    //   // close loading
    //   setIsLoading(false);
    // }
  }

  const onError = (error: any, event: any) => {
    console.log('error:', error);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      // cleanup
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <div className="relative">
      <FormProvider {...form}>
        <TabsPrimitive.Tabs value={tab} onValueChange={(value) => setTab(value)}>
          <Toaster />
          <form onSubmit={form.handleSubmit(onSubmit, onError)}>
            <div
              className={cn(
                'bg-background fixed z-50 flex h-[56px] w-full items-center justify-between gap-[5px] pt-0 transition-shadow duration-300',
                scrolled
                  ? 'top-0 shadow-[0_8px_8px_0_rgba(85,93,102,0.3)]'
                  : 'top-[45px] shadow-none',
                'sm:top-[45px]',
                'md:top-8 md:gap-5 md:pr-3',
                'lg:left-40 lg:w-[calc(100%-160px)]',
              )}
            >
              <div className="border-input flex h-full bg-[#FFF5DB] px-[3px] pt-[3px]">
                <img
                  src={`${window.yayWholesale.plugin_url}/assets/images/favicon.svg`}
                  alt="YayWholesale"
                  className="h-[50px] w-[50px]"
                />
              </div>
              <TabsPrimitive.List asChild>
                <HeaderNavMenuList className="h-[54px] justify-start gap-5">
                  <TabsPrimitive.Trigger value="dashboard" asChild>
                    <HeaderNavMenuItem className="flex cursor-pointer flex-row items-center gap-1.5 sm:flex-col sm:pt-1.5 md:flex-col md:pt-1.5 lg:flex-row">
                      <HouseIcon
                        className="block size-[24px] sm:inline-block sm:size-[20px]"
                        weight="regular"
                      />
                      <span className="hidden sm:inline"> {__('Dashboard', 'yay-wholesale')}</span>
                    </HeaderNavMenuItem>
                  </TabsPrimitive.Trigger>
                  <TabsPrimitive.Trigger value="request" asChild>
                    <HeaderNavMenuItem className="flex cursor-pointer flex-row items-center gap-1.5 sm:flex-col sm:pt-1.5 md:flex-col md:pt-1.5 lg:flex-row">
                      <ReceiptIcon
                        className="block size-[24px] sm:inline-block sm:size-[20px]"
                        weight="regular"
                      />

                      <span className="hidden sm:inline"> {__('Request', 'yay-wholesale')}</span>
                    </HeaderNavMenuItem>
                  </TabsPrimitive.Trigger>
                  <TabsPrimitive.Trigger value="roles" asChild>
                    <HeaderNavMenuItem className="flex cursor-pointer flex-row items-center gap-1.5 sm:flex-col sm:pt-1.5 md:flex-col md:pt-1.5 lg:flex-row">
                      <UserGearIcon
                        className="block size-[24px] sm:inline-block sm:size-[20px]"
                        weight="regular"
                      />

                      <span className="hidden sm:inline"> {__('Roles', 'yay-wholesale')}</span>
                    </HeaderNavMenuItem>
                  </TabsPrimitive.Trigger>

                  <TabsPrimitive.Trigger value="settings" asChild>
                    <HeaderNavMenuItem className="flex cursor-pointer flex-row items-center gap-1.5 sm:flex-col sm:pt-1.5 md:flex-col md:pt-1.5 lg:flex-row">
                      <GearIcon
                        className="block size-[24px] sm:inline-block sm:size-[20px]"
                        weight="regular"
                      />
                      <span className="hidden sm:inline"> {__('Settings', 'yay-wholesale')}</span>
                    </HeaderNavMenuItem>
                  </TabsPrimitive.Trigger>
                </HeaderNavMenuList>
              </TabsPrimitive.List>
              <Button type="submit" disabled={isLoading} className="relative cursor-pointer">
                <span className={isLoading ? 'invisible' : ''}>
                  {__('Save Changes', 'yay-wholesale')}
                </span>
                {isLoading && (
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <CircleNotchIcon className="animate-spin" />
                  </span>
                )}
              </Button>
            </div>
            <div className="mx-auto mt-6 w-full max-w-7xl px-2.5">
              <TabsPrimitive.Content value="dashboard">
                <DashboardTab />
              </TabsPrimitive.Content>
              <TabsPrimitive.Content value="request">
                <RequestTab />
              </TabsPrimitive.Content>
              <TabsPrimitive.Content value="roles">
                <RolesTab />
              </TabsPrimitive.Content>
              <TabsPrimitive.Content value="settings">
                <SettingsTab />
              </TabsPrimitive.Content>
            </div>
          </form>
        </TabsPrimitive.Tabs>
      </FormProvider>
      <Footer currentMenu={tab} onBackToDefault={() => setTab('dashboard')} />
    </div>
  );
}
