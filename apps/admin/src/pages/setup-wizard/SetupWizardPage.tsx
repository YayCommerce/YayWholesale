import { useCallback, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { __ } from '@wordpress/i18n';

import { getErrorMsg } from '@/lib/helpers/response.helper';
import { useDefaultRole } from '@/lib/queries/roles.queries';
import {
  useIsMutatingSetup,
  useSaveSetupWizardMutation,
  useSettingsQuery,
  useSkipSetupWizardMutation,
} from '@/lib/queries/settings.queries';
import { setupRegistration, setupRoleSchema, SetupWizardForm, setupWizardFormSchema } from '@/lib/schema/wizard.schema';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Toaster } from '@/components/ui/sonner';
import DefaultRole from '@/pages/setup-wizard/steps/DefaultRole';
import Registration from '@/pages/setup-wizard/steps/Registration';
import Welcome from '@/pages/setup-wizard/steps/Welcome';

export function SetupWizardPage() {
  const [step, setStep] = useState(0);
  const [openSkip, setOpenSkip] = useState(false);
  const navigate = useNavigate();
  const role = useDefaultRole();
  const { data: settings } = useSettingsQuery();
  const saveMutation = useSaveSetupWizardMutation();
  const skipMutation = useSkipSetupWizardMutation();
  const isMutatingSetup = useIsMutatingSetup();

  const defaultFormData = useMemo<SetupWizardForm>(
    () => ({
      defaultRole: setupRoleSchema.parse(role),
      registration: setupRegistration.parse(settings.registration),
    }),
    [role, settings],
  );

  const form = useForm<SetupWizardForm>({
    resolver: zodResolver(setupWizardFormSchema),
    mode: 'onChange',
    defaultValues: defaultFormData,
  });

  const onSubmit = async (values: SetupWizardForm) => {
    if (isMutatingSetup) return;

    try {
      await saveMutation.mutateAsync(values);
      toast.success(__('Redirecting to roles page...', 'yay-wholesale-b2b'));
      setTimeout(() => navigate('/roles'), 500);
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  };

  const skipSetupWizard = async () => {
    if (skipMutation.isPending) return;
    try {
      toast.success(__('Redirecting to roles page...', 'yay-wholesale-b2b'));
      setOpenSkip(false);
      await skipMutation.mutateAsync();
      setTimeout(() => navigate('/roles'), 500);
    } catch (error) {
      console.warn('Skip failed:', error);
      toast.error(__('An Unexpected error occured', 'yay-wholesale-b2b'));
    }
  };

  const updateStep = useCallback(
    (newStep: number) => {
      if (newStep < 0) navigate('/roles');
      if (step > 2) return;
      setStep(newStep);
    },
    [setStep],
  );

  return (
    <main className="bg-background h-svh w-full grow rounded-lg px-4 2xl:mx-auto">
      <Toaster />
      <div>
        <Button variant="ghost" onClick={() => setOpenSkip(true)} disabled={skipMutation.isPending}>
          Skip the wizard
        </Button>
      </div>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, (err) => console.log(err))}>
          <div className="flex items-center justify-center">
            {step === 0 && <Welcome setStep={updateStep} />}
            {step === 1 && <DefaultRole setStep={updateStep} />}
            {step === 2 && <Registration setStep={updateStep} />}
          </div>
        </form>
      </FormProvider>
      <Dialog open={openSkip} onOpenChange={setOpenSkip}>
        <DialogContent className="bw:max-w-md">
          <DialogHeader className="bw:border-b-0">
            <DialogTitle>{__('Are you sure you want to skip the setup wizard ?', 'yay-wholesale-b2b')}</DialogTitle>
            <DialogDescription>
              {__(
                'This will skip the setup wizard and use default settings. You can always run this again later.',
                'yay-wholesale-b2b',
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">{__('Cancel', 'yay-wholesale-b2b')}</Button>
            </DialogClose>
            <Button variant="primary" onClick={() => skipSetupWizard()}>
              {__('Skip', 'yay-wholesale-b2b')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
