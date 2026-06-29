import { Sheet, SheetContent } from '@/components/ui/sheet';
import { RegistrationField } from '../registration-fields.helpers';
import AddFieldForm from './AddFieldForm';
import EditFieldForm from './EditFieldForm';
import type { EditorState } from './field-editor-types';

interface FieldEditorFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onBeforeClose: (restoreSnapshot: boolean) => void;
  editorState: EditorState | null;
  onSave: (field: RegistrationField) => void;
  onDraftChange?: (field: RegistrationField) => void;
  onRequestDelete?: () => void;
}

export function FieldEditorForm({
  open,
  onOpenChange,
  onBeforeClose,
  editorState,
  onSave,
  onDraftChange,
  onRequestDelete,
}: FieldEditorFormProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent hasMargin>
        {editorState?.mode === 'add' && (
          <AddFieldForm
            initialField={editorState.field}
            open={open}
            onSave={onSave}
            onBeforeClose={onBeforeClose}
            onOpenChange={onOpenChange}
            onDraftChange={onDraftChange}
          />
        )}
        {editorState?.mode === 'edit' && (
          <EditFieldForm
            fieldIndex={editorState.index}
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
