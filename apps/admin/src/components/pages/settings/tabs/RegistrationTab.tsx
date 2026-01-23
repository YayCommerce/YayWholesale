import { __ } from '@wordpress/i18n';
import { Controller, useFormContext } from 'react-hook-form';

import { SettingsFormData } from '@/lib/schema/settings';
import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export default function RegistrationTab() {
  const { control } = useFormContext<SettingsFormData>();

  return (
    <div className="flex flex-col gap-6">
      {/* Moderate new registrations */}
      <Controller
        control={control}
        name={`registration.moderate`}
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <h2 className="text-foreground-400 text-sm leading-3.5 font-medium">
                {__('Moderate new registrations', 'yay-wholesale-b2b')}
              </h2>
              <p className="text-muted-foreground mt-2 text-xs font-normal">
                {__(
                  'Hold new wholesale registrations for moderation by an administrator.',
                  'yay-wholesale-b2b',
                )}
              </p>
            </div>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />

      {/* Two column layout */}
      {/* <div className="grid grid-cols-2 gap-6">
        // Wholesale registration page 
        <Controller
          control={control}
          name={`registration.wholesale_registration_page`}
          render={({ field }) => (
            <Field className="w-full flex flex-col gap-2.5">
              <FieldLabel className="text-foreground-400 text-xs font-medium">
                {__('Wholesale registration page', 'yay-wholesale-b2b')}
              </FieldLabel>
              <FieldContent>
                <Select defaultValue={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full font-normal focus-visible:border-none focus-visible:ring-0 focus-visible:ring-offset-0">
                    <SelectValue placeholder={__('Select a option', 'yay-wholesale-b2b')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wholesale-registration">
                      {__('Wholesale Registration', 'yay-wholesale-b2b')}
                    </SelectItem>
                    <SelectItem value="b2b-registration">{__('B2B Registration', 'yay-wholesale-b2b')}</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
          )}
        />
      </div> */}

      {/* Successful registration message */}
      <div className="flex flex-col gap-5">
        <Controller
          control={control}
          name={`registration.successful_registration_message`}
          render={({ field }) => (
            <Field className="flex w-full flex-col gap-2.5">
              <FieldLabel className="text-foreground-400 text-xs font-medium">
                {__('Successful registration message', 'yay-wholesale-b2b')}
              </FieldLabel>
              <FieldContent>
                <Textarea
                  id="successful-registration-message"
                  rows={4}
                  defaultValue={field.value}
                  onChange={field.onChange}
                  placeholder={__(
                    'Thank you for registering. Your account begin reviewing. Please wait to be approved.',
                    'yay-wholesale-b2b',
                  )}
                  className="min-h-25 w-full resize-none font-normal"
                />
              </FieldContent>
            </Field>
          )}
        />

        {/* Submit button label */}
        <Controller
          control={control}
          name={`registration.submit_button_label`}
          render={({ field }) => (
            <Field className="flex w-62.5 flex-col gap-2.5">
              <FieldLabel className="text-foreground-400 text-xs font-medium">
                {__('Submit button label', 'yay-wholesale-b2b')}
              </FieldLabel>
              <FieldContent>
                <Input
                  id="submit-label"
                  defaultValue={field.value}
                  placeholder={__('Register now', 'yay-wholesale-b2b')}
                  className="h-9 w-full font-normal"
                  onChange={field.onChange}
                />
              </FieldContent>
            </Field>
          )}
        />
      </div>
    </div>
  );
}
