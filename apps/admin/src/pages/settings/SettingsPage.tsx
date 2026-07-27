import { useEffect, useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import * as TabsPrimitive from '@radix-ui/react-tabs';
import { Loader2 } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useForm, useFormContext } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router';
import { toast } from 'sonner';
import { __ } from '@wordpress/i18n';

import { getErrorMsg } from '@/lib/helpers/response.helper';
import { useIsMutatingSettings, useSaveSettingsMutation, useSettingsQuery } from '@/lib/queries/settings.queries';
import { Settings, settingsFormSchema } from '@/lib/schema/settings.schema';
import { useRouteLeaveGuard } from '@/hooks/useRouteLeaveGuard';
import { Button } from '@/components/ui/button';
import { FormProvider } from '@/components/ui/form';
import { SideNavMenuItem, SideNavMenuList } from '@/components/ui/navmenu-side';
import { UnsavedChangeDialog } from '@/components/ui/unsaved-changed-dialog';
import { getFirstErrorSection, makeDefaultSettings } from './settings.helper';
import DisplayTab from './tabs/DisplayTab';
import EmailsTab from './tabs/EmailsTab';
import GeneralTab from './tabs/GeneralTab';
import PaymentRolesTab from './tabs/PaymentRolesTabs';
import RegistrationFieldsTab from './tabs/registration-fields/RegistrationFieldsTab';
import RegistrationTab from './tabs/RegistrationTab';
import ShippingRolesTab from './tabs/ShippingRolesTabs';

export default function SettingsPage() {
  const { subMenu } = useParams();
  const tabs = [
    'general',
    'display',
    'registration',
    'registration-fields',
    'payment-roles',
    'shipping-roles',
    'emails',
  ];
  const activeTab = tabs.find((tab) => tab === subMenu) ?? tabs[0];
  const headerActionPortal = document.getElementById('yay-wholesale-b2b-header-actions');

  const navigate = useNavigate();
  const { data: settings } = useSettingsQuery();
  const saveMutation = useSaveSettingsMutation();
  const isMutating = useIsMutatingSettings();

  const defaultValues = useMemo(() => {
    return makeDefaultSettings(settings);
  }, [settings]);

  const form = useForm<Settings>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: defaultValues,
  });

  const setActiveTab = (tab: (typeof tabs)[number]) => {
    navigate(`/settings/${tab}`);
  };

  const {
    handleSubmit,
    formState: { isDirty },
  } = form;

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

  const onError = getFirstErrorSection();

  const { showDialog, confirmLeave, cancelLeave } = useRouteLeaveGuard(isDirty, ['/settings/*']);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!isDirty) return;
      e.preventDefault();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);

  return (
    <>
      {headerActionPortal &&
        createPortal(
          <Button
            type="submit"
            form="settings-form"
            className="relative ms-4"
            disabled={saveMutation.isPending}
            data-submitting={saveMutation.isPending}
          >
            <span className={saveMutation.isPending ? 'opacity-0' : 'opacity-100'}>
              <span className="max-sm:hidden">{__('Save Changes', 'yay-wholesale-b2b')}</span>
              <span className="sm:hidden">{__('Save', 'yay-wholesale-b2b')}</span>
            </span>
            {saveMutation.isPending && (
              <span className="absolute top-1/2 left-1/2 -translate-1/2 transition-opacity group-data-[submitting=false]:opacity-0">
                <Loader2 className="text-primary-foreground animate-spin stroke-3" />
              </span>
            )}
          </Button>,
          headerActionPortal,
        )}
      <FormProvider {...form}>
        <form id="settings-form" onSubmit={handleSubmit(onSubmit, onError)}>
          <div className="xs:p-6 mx-auto max-w-7xl px-6 pt-8 pb-4">
            <TabsPrimitive.Root value={activeTab} onValueChange={(value) => navigate(`/settings/${value}`)}>
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="w-full sm:w-37.5">
                  <TabsPrimitive.List asChild>
                    <SideNavMenuList mode="tabs" className="flex w-full items-start justify-start sm:flex-col">
                      <TabsPrimitive.Trigger value="general" asChild>
                        <SideNavMenuItem>
                          <span>General</span>
                          <SettingsErrorIndicator tab="general" />
                        </SideNavMenuItem>
                      </TabsPrimitive.Trigger>
                      <TabsPrimitive.Trigger value="display" asChild>
                        <SideNavMenuItem>
                          <span>Display</span>
                          <SettingsErrorIndicator tab="display" />
                        </SideNavMenuItem>
                      </TabsPrimitive.Trigger>
                      <TabsPrimitive.Trigger value="registration" asChild>
                        <SideNavMenuItem>
                          <span>Registration</span>
                          <SettingsErrorIndicator tab="registration" />
                        </SideNavMenuItem>
                      </TabsPrimitive.Trigger>

                      <TabsPrimitive.Trigger value="registration-fields" asChild>
                        <SideNavMenuItem>
                          <span>Registration Fields</span>
                          <SettingsErrorIndicator tab="registration_fields" />
                        </SideNavMenuItem>
                      </TabsPrimitive.Trigger>
                      <TabsPrimitive.Trigger value="emails" asChild>
                        <SideNavMenuItem>
                          <span>Emails</span>
                        </SideNavMenuItem>
                      </TabsPrimitive.Trigger>
                      <TabsPrimitive.Trigger value="payment-roles" asChild>
                        <SideNavMenuItem>
                          <span>Payment Roles</span>
                          <SettingsErrorIndicator tab="payment_roles" />
                        </SideNavMenuItem>
                      </TabsPrimitive.Trigger>
                      <TabsPrimitive.Trigger value="shipping-roles" asChild>
                        <SideNavMenuItem>
                          <span>Shipping Roles</span>
                          <SettingsErrorIndicator tab="shipping_roles" />
                        </SideNavMenuItem>
                      </TabsPrimitive.Trigger>
                    </SideNavMenuList>
                  </TabsPrimitive.List>
                </div>
                <div className="bg-muted flex flex-1 flex-col overflow-hidden">
                  <TabsPrimitive.Content value="general" style={{ height: '100%' }}>
                    <div className="bg-card h-full rounded-md border p-6 sm:w-full">
                      <GeneralTab />
                    </div>
                  </TabsPrimitive.Content>

                  <TabsPrimitive.Content value="display" style={{ height: '100%' }}>
                    <div className="bg-card h-full rounded-md border p-6 sm:w-full">
                      <DisplayTab />
                    </div>
                  </TabsPrimitive.Content>
                  <TabsPrimitive.Content value="registration" style={{ height: '100%' }}>
                    <div className="bg-card h-full rounded-md border p-6 sm:w-full">
                      <RegistrationTab />
                    </div>
                  </TabsPrimitive.Content>
                  <TabsPrimitive.Content value="registration-fields" style={{ height: '100%' }}>
                    <div className="bg-card h-full rounded-md border p-6 sm:w-full">
                      <RegistrationFieldsTab />
                    </div>
                  </TabsPrimitive.Content>
                  <TabsPrimitive.Content value="payment-roles" style={{ height: '100%' }}>
                    <div className="bg-card h-full rounded-md border p-6 sm:w-full">
                      <PaymentRolesTab />
                    </div>
                  </TabsPrimitive.Content>
                  <TabsPrimitive.Content value="shipping-roles" style={{ height: '100%' }}>
                    <div className="bg-card h-full rounded-md border p-6 sm:w-full">
                      <ShippingRolesTab />
                    </div>
                  </TabsPrimitive.Content>
                  <TabsPrimitive.Content value="emails" style={{ height: '100%' }}>
                    <div className="bg-card h-full rounded-md border p-6 sm:w-full">
                      <EmailsTab />
                    </div>
                  </TabsPrimitive.Content>
                </div>
              </div>
            </TabsPrimitive.Root>
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

function SettingsErrorIndicator({ tab }: { tab: keyof Settings }) {
  const { formState } = useFormContext<Settings>();
  const hasErrors = !!formState.errors?.[tab];
  if (!hasErrors) return null;
  return <span className="bg-destructive size-1.25 rounded-full"></span>;
}
