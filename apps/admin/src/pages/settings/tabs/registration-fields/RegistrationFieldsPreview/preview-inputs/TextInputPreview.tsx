import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import type { RegistrationField } from '../../registration-fields-types';

interface TextInputPreviewProps {
  field: RegistrationField;
}

export function TextInputPreview({ field }: TextInputPreviewProps) {
  if (field.type === 'number') {
    return <NumberInput placeholder={field.placeholder} />;
  }
  return <Input type={field.type === 'phone' ? 'tel' : field.type} placeholder={field.placeholder} />;
}
