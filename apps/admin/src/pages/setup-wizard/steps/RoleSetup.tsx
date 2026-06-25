import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { SetupWizardForm } from '@/lib/schema/wizard.schema';
import { Button, LoadingButton } from '@/components/ui/button';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import { Switch } from '@/components/ui/switch';

export type SingleSetupStepProps = {
  setStep: (step: number) => void;
  skip: () => void;
  isPendingSkip: boolean;
  isPendingSave: boolean;
};

export default function RoleSetup({ setStep, skip, isPendingSkip, isPendingSave }: SingleSetupStepProps) {
  const { control } = useFormContext<SetupWizardForm>();

  return (
    <div className="flex w-full flex-col items-center justify-center gap-10">
      <div className="flex w-full flex-col gap-6">
        <span className="text-3xl font-bold">{__('Configure your wholesale role', 'yay-wholesale-b2b')}</span>
        <span className="text-muted-foreground text-base/4">
          {__('Create rules and discounts for your first wholesale customer group', 'yay-wholesale-b2b')}
        </span>
      </div>

      <div className="flex w-full flex-col gap-6">
        <div className="flex gap-6">
          <Controller
            control={control}
            name="defaultRole.name"
            render={({ field, fieldState: { error, invalid } }) => (
              <Field className="flex-1">
                <FieldLabel>{__('Role name', 'yay-wholesale')}</FieldLabel>
                <FieldContent>
                  <Input
                    id="setup-role-name"
                    defaultValue={field.value}
                    onChange={field.onChange}
                    placeholder={__('Wholesale role name')}
                    aria-invalid={invalid}
                  />
                </FieldContent>
                {error && (
                  <FieldError
                    errors={[
                      {
                        message: error.message,
                      },
                    ]}
                  />
                )}
              </Field>
            )}
          />
          <Controller
            control={control}
            name="defaultRole.discount"
            render={({ field, fieldState: { error, invalid } }) => (
              <Field className="flex-1">
                <FieldLabel>{__('Discount rate', 'yay-wholesale')}</FieldLabel>
                <FieldContent>
                  <NumberInput
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                    min={0}
                    max={100}
                    step={1}
                    placeholder={__('Enter a percentage discount', 'yay-wholesale-b2b')}
                    decimalSeparator={decimal_sep ?? '.'}
                    decimalScale={2}
                    aria-invalid={invalid}
                    suffix="%"
                  />
                </FieldContent>
                {error && (
                  <FieldError
                    errors={[
                      {
                        message: error.message,
                      },
                    ]}
                  />
                )}
              </Field>
            )}
          />
        </div>

        <Controller
          control={control}
          name="registration.moderate"
          render={({ field }) => (
            <div className="flex items-center justify-between gap-4 rounded-md border p-4">
              <div>
                <span className="flex flex-wrap items-center gap-2">
                  <h2 className="leading-3.5 font-medium">{__('Moderate new registrations', 'yay-wholesale-b2b')}</h2>
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

      <div className="flex w-full items-center justify-between">
        <Button variant="secondary" size="sm" onClick={() => setStep(0)}>
          {__('Go Back', 'yay-wholesale-b2b')}
        </Button>
        <div className="flex gap-3">
          <LoadingButton
            size="lg"
            className="text-muted-foreground hover:text-foreground font-semibold"
            variant="ghost"
            loading={isPendingSkip}
            onClick={skip}
          >
            {__('Skip for Now', 'yay-wholesale')}
          </LoadingButton>

          <LoadingButton size="lg" loading={isPendingSave} type="submit">
            {__('Next', 'yay-wholesale')}
          </LoadingButton>
        </div>
      </div>
    </div>
  );
}

const { decimal_sep } = window.yayWholesaleB2BMeta.wcMeta.currency_data;
