import { Loader2 } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { useIsMutatingSetup } from '@/lib/queries/wizard.queries';
import { SetupWizardForm } from '@/lib/schema/wizard.schema';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { SingleSetupStepProps } from '@/pages/setup-wizard/steps.type';

export default function Registration({ setStep }: SingleSetupStepProps) {
  const { control } = useFormContext<SetupWizardForm>();
  const isMutatingSetup = useIsMutatingSetup();

  return (
    <div className="flex items-center justify-center pt-30">
      <div>
        <span className="text-3xl font-bold">{__('Configure your wholesale role', 'yay-wholesale-b2b')}</span>
        <span className="text-muted-foreground text-base/6.5">
          {__('Create rules and discounts for your first wholesale customer group', 'yay-wholesale-b2b')}
        </span>
      </div>
      <Card className="w-120 p-0 shadow-sm">
        <div className="border-b px-6 py-4">
          <p className="text-sm font-semibold">{__('Registration settings', 'yay-wholesale-b2b')}</p>
        </div>

        <div className="px-4">
          <div className="flex flex-col gap-0.5">
            <Controller
              control={control}
              name="registration.moderate"
              render={({ field }) => (
                <div className="flex items-center justify-between gap-4 rounded-md border p-4">
                  <div>
                    <span className="flex flex-wrap items-center gap-2">
                      <h2 className="leading-3.5 font-medium">
                        {__('Moderate new registrations', 'yay-wholesale-b2b')}
                      </h2>
                    </span>
                    <p className="text-muted-foreground mt-2 text-xs font-normal">
                      {__('Hold new wholesale registrations for moderation by an administrator.', 'yay-wholesale-b2b')}
                    </p>
                  </div>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />
          </div>
        </div>

        <div className="flex items-center justify-between border-t px-6 py-4">
          <Button variant="ghost" size="sm" className="text-muted-foreground font-normal">
            {__('Skip for now', 'yay-wholesale-b2b')}
          </Button>

          <Button size="sm" type="submit" className="w-20">
            {!isMutatingSetup ? (
              __('Done', 'yay-wholesale-b2b')
            ) : (
              <Loader2 className="text-primary-foreground animate-spin stroke-3" />
            )}
          </Button>
        </div>
      </Card>
    </div>
  );
}
