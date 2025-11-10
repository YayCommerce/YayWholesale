import { RadioGroupItem } from '@radix-ui/react-radio-group';
import { __ } from '@wordpress/i18n';
import { useFormContext } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radio-group';

import { statusMap } from '../StatusBadge';

export default function StatusRadioField() {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name="status"
      render={({ field, fieldState: { error } }) => {
        return (
          <FormItem className="w-full gap-2.5">
            <FormLabel className="text-base-secondary text-xs font-medium">
              {__('Status', 'yay-wholesale')}
            </FormLabel>
            <RadioGroup
              className="bg-muted flex w-fit gap-0 rounded-full p-1"
              defaultValue={field.value}
              onValueChange={(e) => field.onChange(e)}
            >
              {Object.entries(statusMap).map((status) => {
                const { icon, text } = status[1];
                return (
                  <Label
                    htmlFor={text}
                    key={text}
                    className={cn(
                      'bg-muted text-base-muted-foreground inline-flex h-[26px] items-center gap-2 rounded-full p-2 py-4 text-sm font-semibold',
                      'has-data-[state=checked]:border has-data-[state=checked]:bg-white has-data-[state=checked]:text-black has-data-[state=checked]:shadow-sm',
                    )}
                  >
                    <RadioGroupItem
                      id={`${text}`}
                      value={status[0]}
                      className="sr-only after:absolute after:inset-0"
                      aria-label={`size-radio-${text}`}
                    />
                    {icon(true)}
                    <span className="text-blue-900">{text}</span>
                  </Label>
                );
              })}
            </RadioGroup>
          </FormItem>
        );
      }}
    />
  );
}
