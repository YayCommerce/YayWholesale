import { Upload } from 'lucide-react';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import type { Field } from '@/lib/schema/settingsRegistration.schema';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { NumberInput } from '@/components/ui/number-input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface PreviewFieldInputProps {
  field: Field;
}

export function PreviewFieldInput({ field }: PreviewFieldInputProps) {
  switch (field.type) {
    case 'textarea':
      return <Textarea placeholder={field.placeholder} className="min-h-20 resize-none" />;
    case 'select':
      return (
        <Select>
          <SelectTrigger className="w-full">
            <SelectValue placeholder={__('Select an option', 'yay-wholesale-b2b')} />
          </SelectTrigger>
          <SelectContent>
            {field.choices.map((choice) => (
              <SelectItem key={choice} value={choice}>
                {choice}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case 'radio':
      return (
        field.choices && (
          <RadioGroup defaultValue={field.choices[0]} className="flex flex-wrap gap-4">
            {field.choices.map((choice) => (
              <div key={choice} className="flex items-center gap-2">
                <RadioGroupItem value={choice} id={`${field.inputName}-${choice}`} />
                <Label htmlFor={`${field.inputName}-${choice}`} className="text-sm font-normal">
                  {choice}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )
      );
    case 'checkbox':
      return (
        field.choices && (
          <div className="flex flex-wrap gap-4">
            {field.choices.map((choice, choiceIndex) => (
              <div key={choice} className="flex items-center gap-2">
                <Checkbox id={`${field.inputName}-${choice}`} defaultChecked={choiceIndex === 0} />
                <Label htmlFor={`${field.inputName}-${choice}`} className="text-sm font-normal">
                  {choice}
                </Label>
              </div>
            ))}
          </div>
        )
      );
    case 'number':
      return <NumberInput placeholder={field.placeholder} />;
    case 'attachment':
      return (
        <div className="relative flex flex-col items-start gap-1">
          <div className="flex w-full flex-1 items-center">
            <label
              className={cn(
                'border-muted-foreground-400 text-muted-foreground flex w-full items-center justify-center gap-2 rounded-md border border-dashed px-6 py-4',
                field.columnWidth === '50%' ? 'items-start' : 'items-center',
              )}
            >
              <Upload className={cn('size-4', field.columnWidth === '50%' && 'mt-1')} />
              <span className="text-sm/6">
                {createInterpolateElement(__('Drop file here, or <click/> to upload'), {
                  click: <span className="text-foreground underline">{__('click', 'yay-wholesale-b2b')}</span>,
                })}
              </span>

              <input className="hidden" type="file" />
            </label>
          </div>
          <p className="text-muted-foreground pl-2 text-sm">
            {__('Allowed extensions:', 'yay-wholesale-b2b')} {field.allowedExtensions?.join(', ')}
          </p>
        </div>
      );
    default:
      return <Input type={field.type === 'phone' ? 'tel' : field.type} placeholder={field.placeholder} />;
  }
}
