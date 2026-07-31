import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { Settings } from '@/lib/schema/settings.schema';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { PreviewFieldInput } from './PreviewFieldInput';

export function RegistrationFieldsPreview() {
  const { control } = useFormContext<Settings>();
  const fields = useWatch({ control, name: 'registration_fields.fields' });
  const submitLabel = useWatch({ control, name: 'registration.submit_button_label' });

  const visibleFields = useMemo(() => {
    return fields.filter((field) => !field.isHidden);
  }, [fields]);

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex min-h-9 items-center gap-4">
        <h2 className="text-lg leading-none font-bold tracking-tight lg:text-2xl">
          {__('Preview', 'yay-wholesale-b2b')}
        </h2>
      </div>

      <div className="bg-background flex h-full flex-col gap-2 rounded-lg border">
        <div className="flex flex-1 flex-col gap-7.5 p-5">
          <div className="grid grid-cols-2 gap-6">
            <div className={cn('col-span-2 flex flex-col gap-2')}>
              <Label className="text-foreground gap-0 text-[13px] font-medium">
                {__('Email Address', 'yay-wholesale-b2b')}
                {<span className="text-destructive ms-0.5">*</span>}
              </Label>
              <PreviewFieldInput
                field={{
                  type: 'email',
                  inputName: 'email_address',
                  label: __('Email Address', 'yay-wholesale-b2b'),
                  columnWidth: '100%',
                  isRequired: true,
                  isHidden: false,
                  placeholder: __('Enter Email Address', 'yay-wholesale-b2b'),
                }}
              />
            </div>
            {visibleFields.length > 0 &&
              visibleFields.map((field, index) => (
                <div
                  key={index}
                  className={cn('flex flex-col gap-2', field.columnWidth === '100%' ? 'col-span-2' : 'col-span-1')}
                >
                  <Label className="text-foreground gap-0 text-[13px] font-medium">
                    {field.label}
                    {field.isRequired && <span className="text-destructive ms-0.5">*</span>}
                  </Label>
                  <PreviewFieldInput field={field} />
                </div>
              ))}
          </div>

          <Button type="button" className="mt-auto w-full">
            {submitLabel || __('Register now', 'yay-wholesale-b2b')}
          </Button>
        </div>
      </div>
    </div>
  );
}
