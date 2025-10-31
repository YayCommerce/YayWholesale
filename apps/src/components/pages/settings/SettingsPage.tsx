import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { __ } from '@wordpress/i18n';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';

import { useSaveSettingsMutation } from '@/lib/queries/settings';
import { SettingsFormData, settingsFormSchema } from '@/lib/schema/settings';
import { cn, getSettings } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import { FormProvider } from '@/components/ui/form';
import { Toaster } from '@/components/ui/sonner';

import DesignTab from './tabs/DesignTab';
import DisplayTab from './tabs/DisplayTab';
import EmailsTab from './tabs/EmailsTab';
import GeneralTab from './tabs/GeneralTab';
import RegistrationFieldsTab from './tabs/registration-fields/RegistrationFieldsTab';
import RegistrationTab from './tabs/RegistrationTab';

const tabs = [
  { path: 'general', label: 'General', component: <GeneralTab /> },
  { path: 'display', label: 'Display', component: <DisplayTab /> },
  { path: 'registration', label: 'Registration', component: <RegistrationTab /> },
  {
    path: 'registration-fields',
    label: 'Registration Fields',
    component: <RegistrationFieldsTab />,
  },
  { path: 'emails', label: 'Emails', component: <EmailsTab /> },
  { path: 'design', label: 'Design', component: <DesignTab /> },
];

export default function SettingsPage() {
  const { subMenu } = useParams();

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: getSettings(),
  });

  const saveMutation = useSaveSettingsMutation();

  async function onSubmit(data: SettingsFormData) {
    await saveMutation.mutateAsync(data);
    window.yayWholesale.settings = data;
  }

  return (
    <FormProvider {...form}>
      <Toaster />
      <form id="settings-form" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mx-auto mt-[84px] max-w-7xl space-y-6 px-6">
          <div className="flex w-full gap-8">
            {/* Left Sidebar - Tab List */}
            <div className="w-[176px] shrink-0">
              <Card className="m-0 rounded-lg border-none bg-transparent p-0 shadow-none">
                <CardContent className="w-full overflow-x-auto px-0">
                  <div className="flex h-fit w-full flex-col items-stretch gap-1 bg-transparent p-0">
                    {tabs.map((tab) => (
                      <Link
                        key={tab.path}
                        to={`/settings/${tab.path}`}
                        className={cn(
                          'justify-start rounded-none border-none p-4 py-2.5 text-left text-sm font-normal text-[#333333] ring-0 outline-none focus:ring-0 focus:outline-none',
                          tab.path === subMenu &&
                            'text-primary rounded-md bg-white font-medium shadow-none',
                        )}
                      >
                        {tab.label}
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Content Area - Tab Contents */}
            <div className="flex-1">
              <Card className="rounded-lg p-6 shadow-none">
                <CardContent className="w-full overflow-x-auto px-0">
                  {/* Other Tab Contents */}
                  {tabs.map((tab) => (
                    <div key={tab.path} className="mt-0 px-0">
                      {subMenu === tab.path && tab.component}
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </form>
    </FormProvider>
  );
}
