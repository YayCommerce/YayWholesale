import { __ } from '@wordpress/i18n';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { RegistrationField } from './registration-fields-types';
import { PreviewFieldInput } from './RegistrationFieldsPreview/PreviewFieldInput';
import { PreviewFieldLabel } from './RegistrationFieldsPreview/PreviewFieldLabel';

export interface RegistrationFieldsPreviewProps {
  fields: RegistrationField[];
  submitLabel?: string;
}

export function RegistrationFieldsPreview({ fields, submitLabel }: RegistrationFieldsPreviewProps) {
  const visibleFields = fields.filter((field) => !field.isHidden);
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="flex min-h-9 items-center gap-4">
        <h2 className="text-lg leading-none font-bold tracking-tight lg:text-2xl">
          {__('Preview', 'yay-wholesale-b2b')}
        </h2>
      </div>

      <div className="bg-background flex h-full flex-col gap-2 rounded-lg border">
        <div className="flex flex-1 flex-col gap-7.5 p-5">
          {visibleFields.length === 0 ? (
            <p className="text-muted-foreground py-8 text-center text-sm">
              {__('No visible fields to preview', 'yay-wholesale-b2b')}
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-6">
              {visibleFields.map((field) => (
                <div
                  key={field.id}
                  className={cn('flex flex-col gap-2', field.columnWidth === '100%' ? 'col-span-2' : 'col-span-1')}
                >
                  <PreviewFieldLabel field={field} />
                  <PreviewFieldInput field={field} />
                </div>
              ))}
            </div>
          )}

          <Button type="button" className="mt-auto w-full">
            {submitLabel || __('Register now', 'yay-wholesale-b2b')}
          </Button>
        </div>
      </div>
    </div>
  );
}
