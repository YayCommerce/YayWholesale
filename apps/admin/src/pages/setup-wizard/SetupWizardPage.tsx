import { useCallback, useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { X } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import { __, sprintf } from '@wordpress/i18n';

import { skipSetup } from '@/lib/api/wizard.api';
import { getErrorMsg } from '@/lib/helpers/response.helper';
import { useDefaultRole } from '@/lib/queries/roles.queries';
import { useSettingsQuery } from '@/lib/queries/settings.queries';
import { useIsMutatingSetup, useSaveSetupWizardMutation } from '@/lib/queries/wizard.queries';
import { setupRegistration, setupRoleSchema, SetupWizardForm, setupWizardFormSchema } from '@/lib/schema/wizard.schema';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { Toaster } from '@/components/ui/sonner';
import SetupStepsDisplay from '@/pages/setup-wizard/SetupStepsDisplay';
import SetupWizardHelpful from '@/pages/setup-wizard/SetupWizardHelpful';
import ReadyToGo from '@/pages/setup-wizard/steps/ReadyToGo';
import RoleSetup from '@/pages/setup-wizard/steps/RoleSetup';
import Welcome from '@/pages/setup-wizard/steps/Welcome';

const steps = [
  __('1. Welcome to Yay Wholesale B2B', 'yay-wholesale-b2b'),
  __('2. Setup First Role', 'yay-wholesale-b2b'),
  __('3. Ready To Go', 'yay-wholesale-b2b'),
];

const { version } = window.yayWholesaleB2BMeta.wholesaleMeta;

export function SetupWizardPage() {
  const [step, setStep] = useState(0);
  const [openSkip, setOpenSkip] = useState(false);
  const [isPendingSkip, setIsPendingSkip] = useState(false);
  const navigate = useNavigate();
  const role = useDefaultRole();
  const { data: settings } = useSettingsQuery();
  const saveMutation = useSaveSetupWizardMutation();
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
    } catch (error) {
      toast.error(await getErrorMsg(error));
    } finally {
      setStep(steps.length - 1);
      window.yayWholesaleB2BAdmin.setup_wizard.status = 'completed';
    }
  };

  const skipSetupWizard = async () => {
    if (isPendingSkip) return;
    try {
      setIsPendingSkip(true);

      toast.success(__('Redirecting to Dashboard...', 'yay-wholesale-b2b'));
      setOpenSkip(false);
      await skipSetup();

      setTimeout(() => {
        setIsPendingSkip(false);
        navigate('/');
      }, 500);
    } catch (error) {
      console.warn('Skip failed:', error);
      toast.error(__('An Unexpected error occured', 'yay-wholesale-b2b'));
    } finally {
      window.yayWholesaleB2BAdmin.setup_wizard.status = 'skipped';
    }
  };

  const skipBtnHandle = useCallback(() => {
    setOpenSkip(true);
  }, []);

  const updateStep = useCallback(
    (newStep: number) => {
      if (newStep < 0) navigate('/roles');
      if (step > 2) return;
      setStep(newStep);
    },
    [setStep],
  );

  return (
    <div className="relative flex h-svh w-full grow justify-center rounded-lg px-4 2xl:mx-auto">
      <div className="text-muted-foreground absolute top-5 right-10 flex items-center gap-4">
        <span>{sprintf(__('Version %s', 'yay-wholesale-b2b'), version)}</span>
        <Separator orientation="vertical" className="h-4.5! w-px bg-[#E4E4E7]" />
        <Button variant="outline" size="icon-sm" className="rounded-full border-none" onClick={skipBtnHandle}>
          <X />
        </Button>
      </div>
      <div className="mt-20 flex flex-col gap-12.5 lg:mt-30">
        <div className="flex flex-col items-center justify-center gap-4">
          <div>
            <img
              src={`${window.yayWholesaleB2BMeta.wholesaleMeta.assetsUrl}/images/logo/yaywholesale_full.svg`}
              alt="YayWholesale"
              width="100%"
            />
          </div>
          <span className="text-center text-lg text-[#5A6D80]">
            {__('Sell to retail and wholesale customers from one Woocommerce store.', 'yay-wholesale-b2b')}
          </span>
        </div>

        <Card className="flex w-full gap-10 rounded-[20px] border-none lg:w-215 lg:p-10">
          <SetupStepsDisplay step={step} stepTitles={steps} />
          <FormProvider {...form}>
            <form onSubmit={form.handleSubmit(onSubmit, (err) => console.log(err))}>
              <div className="flex items-center justify-center">
                {step === 0 && <Welcome setStep={updateStep} skip={skipBtnHandle} isPendingSkip={isPendingSkip} />}
                {step === 1 && (
                  <RoleSetup
                    setStep={updateStep}
                    skip={skipBtnHandle}
                    isPendingSkip={isPendingSkip}
                    isPendingSave={saveMutation.isPending}
                  />
                )}
                {step === 2 && <ReadyToGo />}
              </div>
            </form>
          </FormProvider>
        </Card>

        <SetupWizardHelpful step={step} maxSteps={steps.length - 1} />
      </div>
      <Dialog open={openSkip} onOpenChange={setOpenSkip}>
        <DialogContent className="bw:max-w-md">
          <DialogHeader className="bw:border-b-0">
            <DialogTitle>{__('Are you sure you want to skip the setup wizard ?', 'yay-wholesale-b2b')}</DialogTitle>
            <DialogDescription>
              {__('This will skip the setup wizard and use default settings.', 'yay-wholesale-b2b')}
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
      <Toaster />
    </div>
  );
}
