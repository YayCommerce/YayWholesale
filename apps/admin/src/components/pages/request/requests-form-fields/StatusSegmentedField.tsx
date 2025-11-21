import { __ } from '@wordpress/i18n';
import { useFormContext } from 'react-hook-form';

import { FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Segmented, SegmentedItem } from '@/components/ui/segmented';
import RequestsStatusIcon from '@/components/icons/RequestStatusIcon';

import requestsStatusMap from '../requests-table/RequestsStatusMap';

export default function StatusSegmentedField() {
  const form = useFormContext();

  return (
    <FormField
      control={form.control}
      name="status"
      render={({ field, fieldState: { error } }) => {
        const handleSegmentChange = (val: string) => {
          if (val !== '') field.onChange(val);
        };
        return (
          <FormItem className="w-full gap-2.5">
            <FormLabel className="text-base-secondary text-xs font-medium">
              {__('Status', 'yay-wholesale')}
            </FormLabel>
            <Segmented
              className="bg-muted flex w-fit gap-0 rounded-full p-1"
              value={field.value}
              onValueChange={(e) => handleSegmentChange(e)}
            >
              {Object.entries(requestsStatusMap).map((status) => {
                const { text } = status[1];
                return (
                  <SegmentedItem key={text} value={status[0]} className="rounded-full">
                    <RequestsStatusIcon status={status[0]} className="h-4 w-4" strokeWidth={2} />
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
