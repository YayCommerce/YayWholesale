import { RadioGroupItem } from '@radix-ui/react-radio-group';
import { __ } from '@wordpress/i18n';
import { useFormContext } from 'react-hook-form';

import { cn } from '@/lib/utils';
import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Label } from '@/components/ui/label';
import { RadioGroup } from '@/components/ui/radio-group';
import { Segmented, SegmentedItem } from '@/components/ui/segmented';

import { statusMap } from '../StatusBadge';

export default function StatusSegmentedField() {
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
            <Segmented
              className="bg-muted flex w-fit gap-0 rounded-full p-1"
              defaultValue={field.value}
              onValueChange={(e) => field.onChange(e)}
            >
              {Object.entries(statusMap).map((status) => {
                const { icon, text } = status[1];
                return (
                  <SegmentedItem key={text} value={status[0]} className="rounded-full">
                    {icon(true)}
                    <span>{text}</span>
                  </SegmentedItem>
                );
              })}
            </Segmented>
          </FormItem>
        );
      }}
    />
  );
}
