import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { SetupWizardForm } from '@/lib/schema/wizard.schema';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';

type DefaultRoleProps = {
  setStep: (step: number) => void;
};

export default function DefaultRole({ setStep }: DefaultRoleProps) {
  const { control } = useFormContext<SetupWizardForm>();

  return (
    <div className="flex items-center justify-center pt-30">
      <Card className="w-120 p-0 shadow-sm">
        <div className="border-b p-4">
          <p className="text-sm font-semibold">{__('Set up your first wholesale role', 'yay-wholesale-b2b')}</p>
        </div>

        <div className="px-4">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Controller
                control={control}
                name="defaultRole.name"
                render={({ field, fieldState: { error, invalid } }) => (
                  <Field>
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
            </div>
            <div className="flex flex-col gap-1.5">
              <Controller
                control={control}
                name="defaultRole.discount"
                render={({ field, fieldState: { error, invalid } }) => (
                  <Field>
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
          </div>
        </div>

        <div className="flex items-center justify-between border-t px-6 py-4">
          <Button variant="ghost" size="sm" className="text-muted-foreground font-normal">
            {__('Skip for now', 'yay-wholesale-b2b')}
          </Button>
          <Button size="sm" onClick={() => setStep(2)}>
            {__('Next', 'yay-whoelsale-b2b')}
          </Button>
        </div>
        {/* </div> */}
      </Card>
    </div>
  );
}

const { decimal_sep } = window.yayWholesaleB2BMeta.wcMeta.currency_data;
