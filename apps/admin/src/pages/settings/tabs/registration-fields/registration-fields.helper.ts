import {
  attachmentFieldTypes,
  choiceFieldTypes,
  FieldFormValues,
  FieldType,
  textFieldTypes,
} from '@/lib/schema/settingsRegistration.schema';

function isFieldType<T extends readonly FieldType[]>(type: FieldType, types: T): type is T[number] {
  return types.includes(type as T[number]);
}

export function hasPlaceholder(type: FieldType) {
  return isFieldType(type, textFieldTypes);
}

export function hasChoices(type: FieldType) {
  return isFieldType(type, choiceFieldTypes);
}

export function hasAllowedExtensions(type: FieldType) {
  return isFieldType(type, attachmentFieldTypes);
}

export const EMPTY_FORM_VALUES = {
  placeholder: '',
  choices: [],
  allowedExtensions: ['jpg', 'jpeg', 'png'],
  maxFileSize: 1,
} as const;

export function toFieldFormValues(field: FieldFormValues): FieldFormValues {
  return {
    ...EMPTY_FORM_VALUES,
    ...field,
  };
}
