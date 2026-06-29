import { Sheet, SheetContent } from '@/components/ui/sheet';
import AddFieldForm from './FieldForm/AddFieldForm';
import EditFieldForm from './FieldForm/EditFieldForm';
import type { FieldEditorState, RegistrationField } from './registration-fields-types';

interface FieldFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBeforeClose: (restoreSnapshot: boolean) => void;
  fieldEditor: FieldEditorState | null;
  onSave: (field: RegistrationField) => void;
  onDraftChange?: (field: RegistrationField) => void;
  onRequestDelete?: () => void;
}

export function FieldForm({
  open,
  onOpenChange,
  onBeforeClose,
  fieldEditor,
  onSave,
  onDraftChange,
  onRequestDelete,
}: FieldFormProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent hasMargin>
        {fieldEditor?.mode === 'add' && (
          <AddFieldForm
            initialField={fieldEditor.field}
            open={open}
            onSave={onSave}
            onBeforeClose={onBeforeClose}
            onOpenChange={onOpenChange}
            onDraftChange={onDraftChange}
          />
        )}
        {fieldEditor?.mode === 'edit' && (
          <EditFieldForm
            fieldIndex={fieldEditor.index}
            open={open}
            onSave={onSave}
            onBeforeClose={onBeforeClose}
            onOpenChange={onOpenChange}
            onRequestDelete={onRequestDelete}
          />
        )}
      </SheetContent>
    </Sheet>
  );
}
