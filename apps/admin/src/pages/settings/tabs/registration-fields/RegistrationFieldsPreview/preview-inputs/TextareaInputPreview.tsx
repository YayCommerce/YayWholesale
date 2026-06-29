import { Textarea } from '@/components/ui/textarea';
import type { RegistrationField } from '../../registration-fields.helpers';

interface TextareaInputPreviewProps {
  field: RegistrationField;
}

export function TextareaInputPreview({ field }: TextareaInputPreviewProps) {
  return <Textarea placeholder={field.placeholder} className="min-h-20 resize-none" />;
}
