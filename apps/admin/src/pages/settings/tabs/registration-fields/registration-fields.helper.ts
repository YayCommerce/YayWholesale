import { __ } from '@wordpress/i18n';

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

export function getBillingMappingLabel(value: string) {
  return BILLING_MAPPING_OPTIONS.find((option) => option.value === value)?.label;
}

export const FIELD_TYPE_OPTIONS: { value: string; label: string }[] = [
  { value: 'text', label: __('Input', 'yay-wholesale-b2b') },
  { value: 'email', label: __('Email', 'yay-wholesale-b2b') },
  { value: 'number', label: __('Number', 'yay-wholesale-b2b') },
  { value: 'phone', label: __('Phone', 'yay-wholesale-b2b') },
  { value: 'date', label: __('Date', 'yay-wholesale-b2b') },
  { value: 'textarea', label: __('Textarea', 'yay-wholesale-b2b') },
  { value: 'select', label: __('Select', 'yay-wholesale-b2b') },
  { value: 'radio', label: __('Radio', 'yay-wholesale-b2b') },
  { value: 'checkbox', label: __('Checkbox', 'yay-wholesale-b2b') },
  { value: 'attachment', label: __('Attachment', 'yay-wholesale-b2b') },
];

export const BILLING_MAPPING_OPTIONS: { value: string; label: string }[] = [
  { value: 'none', label: __('None', 'yay-wholesale-b2b') },
  { value: 'billing_first_name', label: __('First Name', 'yay-wholesale-b2b') },
  { value: 'billing_last_name', label: __('Last Name', 'yay-wholesale-b2b') },
  { value: 'billing_company', label: __('Company', 'yay-wholesale-b2b') },
  {
    value: 'billing_country_state',
    label: __('Country + State (Recommended)', 'yay-wholesale-b2b'),
  },
  { value: 'billing_country', label: __('Country / Region', 'yay-wholesale-b2b') },
  { value: 'billing_state', label: __('State / County', 'yay-wholesale-b2b') },
  { value: 'billing_address_1', label: __('Street Address', 'yay-wholesale-b2b') },
  { value: 'billing_address_2', label: __('Address Line 2', 'yay-wholesale-b2b') },
  { value: 'billing_city', label: __('Town / City', 'yay-wholesale-b2b') },
  { value: 'billing_postcode', label: __('Postcode / ZIP', 'yay-wholesale-b2b') },
  { value: 'billing_phone', label: __('Phone Number', 'yay-wholesale-b2b') },
  { value: 'billing_vat', label: __('VAT ID', 'yay-wholesale-b2b') },
  { value: 'custom', label: __('Custom User Meta Key Mapping', 'yay-wholesale-b2b') },
];
