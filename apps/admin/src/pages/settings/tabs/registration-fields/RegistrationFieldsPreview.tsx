import { useMemo } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import type { Settings } from '@/lib/schema/settings.schema';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { RegistrationField } from './registration-fields.helpers';

type PreviewOverride = { mode: 'add'; field: RegistrationField };

function PreviewFieldLabel({ field }: { field: RegistrationField }) {
  return (
    <Label className="text-foreground gap-0 text-[13px] font-medium">
      {field.label}
      {field.isRequired && <span className="text-destructive ms-0.5">*</span>}
    </Label>
  );
}

function PreviewFieldInput({ field }: { field: RegistrationField }) {
  switch (field.type) {
    case 'textarea':
      return <Textarea placeholder={field.placeholder} disabled className="min-h-20 resize-none" />;
    case 'select':
      return (
        <Select disabled>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={field.placeholder || __('Select an option', 'yay-wholesale-b2b')} />
          </SelectTrigger>
          <SelectContent>
            {(field.choices ?? []).map((choice) => (
              <SelectItem key={choice} value={choice}>
                {choice}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case 'radio':
      return (
        <RadioGroup defaultValue={field.choices?.[0]} disabled className="flex gap-4">
          {(field.choices ?? []).map((choice) => (
            <div key={choice} className="flex items-center gap-2">
              <RadioGroupItem value={choice} id={`${field.id}-${choice}`} />
              <Label htmlFor={`${field.id}-${choice}`} className="text-sm font-normal">
                {choice}
              </Label>
            </div>
          ))}
        </RadioGroup>
      );
    case 'checkbox':
      return (
        <div className="flex flex-wrap gap-4">
          {(field.choices ?? []).map((choice, choiceIndex) => (
            <div key={choice} className="flex items-center gap-2">
              <Checkbox id={`${field.id}-${choice}`} defaultChecked={choiceIndex === 0} disabled />
              <Label htmlFor={`${field.id}-${choice}`} className="text-sm font-normal">
                {choice}
              </Label>
            </div>
          ))}
        </div>
      );
    default:
      return <Input type={field.type === 'phone' ? 'tel' : field.type} placeholder={field.placeholder} disabled />;
  }
}

export function RegistrationFieldsPreview({ previewOverride }: { previewOverride?: PreviewOverride | null }) {
  const { control } = useFormContext<Settings>();
  const fields = useWatch({ control, name: 'registration_fields.fields' }) ?? [];
  const submitLabel = useWatch({ control, name: 'registration.submit_button_label' });

  const displayFields = useMemo(() => {
    if (!previewOverride) return fields;
    return [...fields, previewOverride.field];
  }, [fields, previewOverride]);

  const visibleFields = useMemo(() => displayFields.filter((field) => !field.isHidden), [displayFields]);

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
            {submitLabel || __('Submit', 'yay-wholesale-b2b')}
          </Button>
        </div>
      </div>
    </div>
  );
}
