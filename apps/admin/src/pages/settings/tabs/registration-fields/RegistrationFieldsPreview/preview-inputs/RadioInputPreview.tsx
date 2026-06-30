import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import type { RegistrationField } from '../../registration-fields-types';

interface RadioInputPreviewProps {
  field: RegistrationField;
}

export function RadioInputPreview({ field }: RadioInputPreviewProps) {
  return (
    <RadioGroup defaultValue={field.choices?.[0]} className="flex gap-4">
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
}
