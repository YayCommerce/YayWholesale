import { __ } from '@wordpress/i18n';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { RegistrationField } from '../../registration-fields.helpers';

interface SelectInputPreviewProps {
  field: RegistrationField;
}

export function SelectInputPreview({ field }: SelectInputPreviewProps) {
  return (
    <Select>
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
}
