import { Label } from '@/components/ui/label';
import type { RegistrationField } from '../registration-fields-types';

interface PreviewFieldLabelProps {
  field: RegistrationField;
}

export function PreviewFieldLabel({ field }: PreviewFieldLabelProps) {
  return (
    <Label className="text-foreground gap-0 text-[13px] font-medium">
      {field.label}
      {field.isRequired && <span className="text-destructive ms-0.5">*</span>}
    </Label>
  );
}
