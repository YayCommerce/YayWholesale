import { __ } from '@wordpress/i18n';
import { useFormContext } from 'react-hook-form';

import { SettingsFormData } from '@/lib/schema';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export default function RegistrationTab() {
  const { control } = useFormContext<SettingsFormData>();

  return (
    <div className="space-y-6">
      {/* Moderate new registrations */}
      <FormField
        control={control}
        name={`registration.moderate`}
        render={({ field }) => (
          <div className="base-base-border flex items-center justify-between rounded-md border p-4">
            <div>
              <h2 className="text-base-secondary text-sm font-normal">
                {__('Moderate new registrations')}
              </h2>
              <p className="text-base-muted-foreground mt-1 text-xs font-normal">
                {__('Hold new wholesale registrations for moderation by an administrator.')}
              </p>
            </div>
            <Switch size="md" checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />

      {/* Two column layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Wholesale registration page */}
        <FormField
          control={control}
          name={`registration.wholesale_registration_page`}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-base-secondary space-y-2.5 text-xs font-medium">
                {__('Wholesale registration page')}
              </FormLabel>
              <FormControl>
                <Select defaultValue={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full font-normal focus-visible:border-none focus-visible:ring-0 focus-visible:ring-offset-0">
                    <SelectValue placeholder={__('Select a option')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="wholesale-registration">
                      {__('Wholesale Registration')}
                    </SelectItem>
                    <SelectItem value="b2b-registration">{__('B2B Registration')}</SelectItem>
                  </SelectContent>
                </Select>
              </FormControl>
            </FormItem>
          )}
        />

        {/* Submit button label */}
        <FormField
          control={control}
          name={`registration.submit_button_label`}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-base-secondary space-y-2.5 text-xs font-medium">
                {__('Submit button label')}
              </FormLabel>
              <FormControl>
                <Input
                  id="submit-label"
                  defaultValue={field.value}
                  placeholder={__('Register now')}
                  className="w-full font-normal"
                  onChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Successful registration message */}
      {/* <div className="space-y-2.5">
        <Label htmlFor="success-message" className="text-base-secondary text-xs font-medium">
          Successful registration message
        </Label>
        <Textarea
          id="success-message"
          rows={4}
          defaultValue="Thank you for registering. Your account begin reviewing. Please wait to be approved."
          className="w-full resize-none font-normal"
        />
      </div> */}
      <FormField
        control={control}
        name={`registration.successful_registration_message`}
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className="text-base-secondary space-y-2.5 text-xs font-medium">
              {__('Successful registration message')}
            </FormLabel>
            <FormControl>
              <Textarea
                id="successful-registration-message"
                rows={4}
                defaultValue={field.value}
                onChange={field.onChange}
                placeholder={__('Enter your message here...')}
                className="w-full resize-none font-normal"
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
