import type { ComponentType } from 'react';

import type { RegistrationField } from '../registration-fields-types';
import { CheckboxInputPreview } from './preview-inputs/CheckboxInputPreview';
import { RadioInputPreview } from './preview-inputs/RadioInputPreview';
import { SelectInputPreview } from './preview-inputs/SelectInputPreview';
import { TextareaInputPreview } from './preview-inputs/TextareaInputPreview';
import { TextInputPreview } from './preview-inputs/TextInputPreview';

interface PreviewFieldInputProps {
  field: RegistrationField;
}

const PREVIEW_INPUT_BY_TYPE: Partial<Record<RegistrationField['type'], ComponentType<{ field: RegistrationField }>>> = {
  textarea: TextareaInputPreview,
  select: SelectInputPreview,
  radio: RadioInputPreview,
  checkbox: CheckboxInputPreview,
};

export function PreviewFieldInput({ field }: PreviewFieldInputProps) {
  const PreviewInput = PREVIEW_INPUT_BY_TYPE[field.type];
  if (PreviewInput) {
    return <PreviewInput field={field} />;
  }

  return <TextInputPreview field={field} />;
}
