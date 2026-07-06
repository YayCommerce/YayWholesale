import {
  attachmentFieldTypes,
  choiceFieldTypes,
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

export const FIELD_DEFAULTS = {
  text: {
    placeholder: '',
  },
  email: {
    placeholder: '',
  },
  number: {
    placeholder: '',
  },
  phone: {
    placeholder: '',
  },
  date: {
    placeholder: '',
  },
  textarea: {
    placeholder: '',
  },
  select: {
    choices: [],
  },
  radio: {
    choices: [],
  },
  checkbox: {
    choices: [],
  },
  attachment: {
    allowedExtensions: ['jpg', 'jpeg', 'png'],
    maxFileSize: 1,
  },
};
