import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import type { RegistrationField } from '../../registration-fields-types';

interface CheckboxInputPreviewProps {
  field: RegistrationField;
}

export function CheckboxInputPreview({ field }: CheckboxInputPreviewProps) {
  return (
    <div className="flex flex-wrap gap-4">
      {(field.choices ?? []).map((choice, choiceIndex) => (
        <div key={choice} className="flex items-center gap-2">
          <Checkbox id={`${field.id}-${choice}`} defaultChecked={choiceIndex === 0} />
          <Label htmlFor={`${field.id}-${choice}`} className="text-sm font-normal">
            {choice}
          </Label>
        </div>
      ))}
    </div>
  );
}
