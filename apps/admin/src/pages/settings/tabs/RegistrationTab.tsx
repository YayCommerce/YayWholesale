import { useRef } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import type { Settings } from '@/lib/schema/settings.schema';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/ui/copy-button';
import { WholeSaleToolTip } from '@/components/ui/custom/WholeSaleToolTip';
import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export default function RegistrationTab() {
  const { control } = useFormContext<Settings>();

  return (
    <div className="flex flex-col gap-6">
      {/* Moderate new registrations */}
      <Controller
        control={control}
        name="registration.moderate"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <span className="flex flex-wrap items-center gap-2">
                <h2 className="leading-3.5 font-medium">{__('Moderate new registrations', 'yay-wholesale-b2b')}</h2>
                <WholeSaleToolTip
                  trigger={
                    <Badge className="flex cursor-default items-center py-2.5" variant="primary-soft">
                      <p className="text-xs">{'[ywhs_request_form]'}</p>
                      <CopyButton
                        variant="primary-soft"
                        content="[ywhs_request_form title='(optional)']"
                        className="h-4 w-6 scale-80 bg-transparent"
                      />
                    </Badge>
                  }
                  content={__(
                    "Add the form with this shortcode or 'Request Registration Form' block.",
                    'yay-wholesale-b2b',
                  )}
                />
              </span>
              <p className="text-muted-foreground mt-2 text-xs font-normal">
                {__('Hold new wholesale registrations for moderation by an administrator.', 'yay-wholesale-b2b')}
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
          name="registration.wholesale_registration_page"
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
          name="registration.successful_registration_message"
          render={({ field }) => (
            <Field>
              <FieldLabel>{__('Successful registration message', 'yay-wholesale-b2b')}</FieldLabel>
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
          name="registration.submit_button_label"
          render={({ field }) => (
            <Field className="w-62.5">
              <FieldLabel>{__('Submit button label', 'yay-wholesale-b2b')}</FieldLabel>
              <FieldContent>
                <Input
                  id="submit-label"
                  defaultValue={field.value}
                  placeholder={__('Register now', 'yay-wholesale-b2b')}
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
