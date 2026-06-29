import type { Settings } from '@/lib/schema/settings.schema';

export type RegistrationField = Settings['registration_fields']['fields'][number];

export interface AddFieldEditor {
  mode: 'add';
  field: RegistrationField;
}

export interface EditFieldEditor {
  mode: 'edit';
  index: number;
  field: RegistrationField;
}

export type FieldEditorState = AddFieldEditor | EditFieldEditor;

export type FieldEditorErrors = Partial<Record<keyof RegistrationField, string>>;
