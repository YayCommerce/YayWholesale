import { Suspense, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FieldErrors, useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { __ } from '@wordpress/i18n';

import { getErrorMsg } from '@/lib/helpers/response.helper';
import { useIsMutatingSettings, useSaveSettingsMutation, useSettingsQuery } from '@/lib/queries/settings.queries';
import { Settings, settingsFormSchema } from '@/lib/schema/settings.schema';
import { cn } from '@/lib/utils';
import { useRouteLeaveGuard } from '@/hooks/useRouteLeaveGuard';
import { Card, CardContent } from '@/components/ui/card';
import { FormProvider } from '@/components/ui/form';
import { UnsavedChangeDialog } from '@/components/ui/unsaved-changed-dialog';

import { Button } from '@/components/ui/button';
import { createPortal } from 'react-dom';
import { CircleNotchIcon } from '@phosphor-icons/react';
import { useSettingsTab } from './hooks';
import { usePortal } from './hooks';
import { useErrorRedirect } from './hooks';
import { SETTINGS_TABS } from './constants';
export default function SettingsPage() {
  const activeTab = useSettingsTab();
  const headerActionPortal = usePortal('yay-wholesale-b2b-header-actions');
  const onError = useErrorRedirect();

  const { data: settings } = useSettingsQuery();
  const saveMutation = useSaveSettingsMutation();
  const isMutating = useIsMutatingSettings();
  const isSavingSettings = isMutating > 0;
  const form = useForm<Settings>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: settings,
  });

  const { handleSubmit, formState: { isDirty, isSubmitting, errors } } = form;

  async function onSubmit(data: Settings) {
    if (isMutating > 0) return;

    try {
      await saveMutation.mutateAsync(data);
      form.reset(data);
      toast.success(__('Settings saved!', 'yay-wholesale-b2b'));
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  }

  const { showDialog, confirmLeave, cancelLeave } = useRouteLeaveGuard(isDirty, ['/settings/*']);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  const hasTabError = (tab: typeof SETTINGS_TABS[number]) => {
    return !!errors?.[tab.errorKey as keyof FieldErrors<Settings>];
  };

  return (
    <>
      {headerActionPortal &&
        createPortal(
          <Button type="submit" form="settings-form" data-submitting={isSubmitting} disabled={isSavingSettings} className="relative ms-4">
            <span className={isSavingSettings ? 'opacity-0' : 'opacity-100'}>
              <span className="max-sm:hidden">{__('Save Changes', 'yay-wholesale-b2b')}</span>
              <span className="sm:hidden">{__('Save', 'yay-wholesale-b2b')}</span>
            </span>
            {isSavingSettings && (
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <CircleNotchIcon className="animate-spin" />
              </span>
            )}
          </Button>,
          headerActionPortal
        )}
      <FormProvider {...form}>

        <form id="settings-form" onSubmit={handleSubmit(onSubmit, onError)}>
          <div className="mx-auto flex max-w-7xl flex-col gap-6 px-6">
            <div className="flex w-full flex-col gap-4 sm:flex-row 2xl:gap-8">
              {/* Left Sidebar - Tab List */}
              <div className="shrink-0 sm:w-[176px]">
                <Card className="border-none bg-transparent p-0 shadow-none">
                  <CardContent className="w-full overflow-x-auto px-0 [scrollbar-width:thin]">
                    <div className="flex h-fit w-full items-center gap-1 bg-transparent pb-2.5 sm:flex-col sm:items-stretch md:p-0">
                      {SETTINGS_TABS.map((tab) => {
                        const isActive = tab.path === activeTab.path;
                        const hasError = hasTabError(tab);

                        return (
                          <Link
                            key={tab.path}
                            to={`/settings/${tab.path}`}
                            className={cn(
                              'flex items-center gap-2 rounded-none border-none p-4 py-2.5 text-left text-sm font-normal text-nowrap outline-none ring-0 transition-all',
                              'hover:text-primary hover:rounded-md hover:bg-white',
                              'focus:outline-none focus:ring-0',
                              'sm:text-wrap',
                              isActive &&
                              'text-primary rounded-md bg-white font-medium shadow-none',
                            )}
                          >
                            <div>{tab.label}</div>
                            {hasError && (
                              <span className="bg-destructive size-1.25 rounded-full"></span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Right Content Area - Tab Contents */}
              <div className="flex-1">
                <Card className="p-4 md:p-5 2xl:p-6">
                  <CardContent className="w-full overflow-x-visible px-0">
                    {SETTINGS_TABS.map((tab) => (
                      <div key={tab.path} className="mt-0 px-0">
                        {activeTab.path === tab.path && <tab.component />}
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
              handleSubmit(onSubmit)();
            }}
            onOpenChange={(open) => {
              if (!open) {
                cancelLeave();
              }
            }}
          />
        </form>
      </FormProvider>
    </>
  );
}
