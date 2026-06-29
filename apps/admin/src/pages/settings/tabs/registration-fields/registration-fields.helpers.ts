import { v4 as uuidv4 } from 'uuid';
import { __ } from '@wordpress/i18n';

import type { RegistrationField } from './registration-fields-types';

export const CHOICE_FIELD_TYPES = ['radio', 'select', 'checkbox'] as const;
export type ChoiceFieldType = (typeof CHOICE_FIELD_TYPES)[number];

export function isChoiceFieldType(type: RegistrationField['type']): type is ChoiceFieldType {
  return CHOICE_FIELD_TYPES.includes(type as ChoiceFieldType);
}

export function fieldTypeHasPlaceholder(type: RegistrationField['type']): boolean {
  return type !== 'radio';
}

export const FIELD_TYPE_OPTIONS: { value: RegistrationField['type']; label: string }[] = [
  { value: 'text', label: __('Input', 'yay-wholesale-b2b') },
  { value: 'email', label: __('Email', 'yay-wholesale-b2b') },
  { value: 'number', label: __('Number', 'yay-wholesale-b2b') },
  { value: 'phone', label: __('Phone', 'yay-wholesale-b2b') },
  { value: 'date', label: __('Date', 'yay-wholesale-b2b') },
  { value: 'textarea', label: __('Textarea', 'yay-wholesale-b2b') },
  { value: 'select', label: __('Select', 'yay-wholesale-b2b') },
  { value: 'radio', label: __('Radio', 'yay-wholesale-b2b') },
  { value: 'checkbox', label: __('Checkbox', 'yay-wholesale-b2b') },
];

export function getFieldTypeLabel(type: RegistrationField['type']): string {
  return FIELD_TYPE_OPTIONS.find((option) => option.value === type)?.label ?? type;
}

export function createDefaultField(fieldsCount: number): RegistrationField {
  return {
    id: uuidv4(),
    label: '',
    inputName: `custom_field_${fieldsCount}`,
    type: 'text',
    placeholder: '',
    columnWidth: '50%',
    deletable: true,
    isDefault: false,
    isRequired: false,
    isHidden: false,
  };
}

export function normalizeFieldForType(field: RegistrationField, type: RegistrationField['type']): RegistrationField {
  const next: RegistrationField = { ...field, type };

  if (isChoiceFieldType(type)) {
    return {
      ...next,
      choices: field.choices?.length ? field.choices : [],
    };
  }

  const { choices: _choices, ...rest } = next;
  return rest;
}
