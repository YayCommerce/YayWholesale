import type { RegistrationField } from '../registration-fields.helpers';

export type EditorState =
  | { mode: 'add'; field: RegistrationField }
  | { mode: 'edit'; index: number; field: RegistrationField };

export type FieldErrors = Partial<Record<keyof RegistrationField, string>>;

export type FieldEditorFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBeforeClose: (restoreSnapshot: boolean) => void;
  editorState: EditorState | null;
  onSave: (field: RegistrationField) => void;
  onDraftChange?: (field: RegistrationField) => void;
  onRequestDelete?: () => void;
};

export type FieldEditorFieldsProps = {
  field: RegistrationField;
  errors: FieldErrors;
  onUpdate: <K extends keyof RegistrationField>(key: K, value: RegistrationField[K]) => void;
  onTypeChange: (type: RegistrationField['type']) => void;
};

export type AddFieldEditorContentProps = {
  initialField: RegistrationField;
  open: boolean;
  onSave: (field: RegistrationField) => void;
  onBeforeClose: (restoreSnapshot: boolean) => void;
  onOpenChange: (open: boolean) => void;
  onDraftChange?: (field: RegistrationField) => void;
};

export type EditFieldEditorContentProps = {
  fieldIndex: number;
  open: boolean;
  onSave: (field: RegistrationField) => void;
  onBeforeClose: (restoreSnapshot: boolean) => void;
  onOpenChange: (open: boolean) => void;
  onRequestDelete?: () => void;
};
