import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Link, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { __ } from '@wordpress/i18n';

import { getErrorMsg } from '@/lib/helpers/response.helper';
import { useIsMutatingSettings, useSaveSettingsMutation, useSettings } from '@/lib/queries/settings.queries';
import { Settings, settingsFormSchema } from '@/lib/schema/settings.schema';
import { cn } from '@/lib/utils';
import { useRouteLeaveGuard } from '@/hooks/useRouteLeaveGuard';
import { Card, CardContent } from '@/components/ui/card';
import { FormProvider } from '@/components/ui/form';
import { UnsavedChangeDialog } from '@/components/ui/unsaved-changed-dialog';
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
];

export default function SettingsPage() {
  const { subMenu } = useParams();

  const { data: settings } = useSettings();
  const saveMutation = useSaveSettingsMutation();
  const isMutating = useIsMutatingSettings();

  const form = useForm<Settings>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: settings,
  });

  async function onSubmit(data: Settings) {
    if (isMutating > 0) return;

    try {
      await saveMutation.mutateAsync(data);
      toast.success(__('Settings saved!', 'yay-wholesale-b2b'));
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  }

  const { showDialog, confirmLeave, cancelLeave } = useRouteLeaveGuard(form.formState.isDirty, ['/settings/*']);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!form.formState.isDirty) return;
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [form.formState.isDirty]);

  return (
    <FormProvider {...form}>
      <form id="settings-form" onSubmit={form.handleSubmit(onSubmit, (err) => console.log(err))}>
        <div className="mx-auto mt-[84px] flex max-w-7xl flex-col gap-6 px-6">
          <div className="flex w-full flex-col gap-8 sm:flex-row">
            {/* Left Sidebar - Tab List */}
            <div className="shrink-0 sm:w-[176px]">
              <Card className="m-0 rounded-lg border-none bg-transparent p-0 shadow-none">
                <CardContent className="w-full overflow-x-auto px-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                  <div className="flex h-fit w-full items-center gap-1 bg-transparent p-0 sm:flex-col sm:items-stretch">
                    {tabs.map((tab) => (
                      <Link
                        key={tab.path}
                        to={`/settings/${tab.path}`}
                        className={cn(
                          'text-foreground-400 justify-start rounded-none border-none p-4 py-2.5 text-left text-sm font-normal text-nowrap ring-0 outline-none focus:ring-0 focus:outline-none sm:text-wrap',
                          'hover:text-primary hover:rounded-md hover:bg-white',
                          tab.path === subMenu && 'text-primary rounded-md bg-white font-medium shadow-none',
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
              <Card>
                <CardContent className="w-full overflow-x-visible px-0">
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

        <UnsavedChangeDialog
          open={showDialog}
          onDiscard={confirmLeave}
          onSave={() => {
            cancelLeave();
            form.handleSubmit(onSubmit)();
          }}
          onOpenChange={(open) => {
            if (!open) {
              cancelLeave();
            }
          }}
        />
      </form>
    </FormProvider>
  );
}
