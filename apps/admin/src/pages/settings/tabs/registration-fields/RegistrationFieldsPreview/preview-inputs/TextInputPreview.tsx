import { Input } from '@/components/ui/input';
import type { RegistrationField } from '../../registration-fields.helpers';

interface TextInputPreviewProps {
  field: RegistrationField;
}

export function TextInputPreview({ field }: TextInputPreviewProps) {
  return <Input type={field.type === 'phone' ? 'tel' : field.type} placeholder={field.placeholder} />;
}
