import { useRef, useState } from 'react';
import { Plus } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import type { Settings } from '@/lib/schema/settings.schema';
import { Button } from '@/components/ui/button';
import { DeleteFieldDialog } from './DeleteFieldDialog';
import { FieldEditorForm } from './FieldEditorForm';
import type { EditorState } from './FieldEditorForm/field-editor-types';
import { createDefaultField, type RegistrationField } from './registration-fields.helpers';
import { RegistrationFieldsList } from './RegistrationFieldsList';
import { RegistrationFieldsPreview } from './RegistrationFieldsPreview';

export default function RegistrationFieldsTab() {
  const { control, getValues } = useFormContext<Settings>();
  const [editorState, setEditorState] = useState<EditorState | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [previewDraft, setPreviewDraft] = useState<RegistrationField | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const restoreOnCloseRef = useRef(true);

  const { fields, append, remove, move, update } = useFieldArray({
    control,
    name: 'registration_fields.fields',
  });

  const openAddDialog = () => {
    const field = createDefaultField(fields.length);
    setPreviewDraft(field);
    setEditorState({
      mode: 'add',
      field,
    });
    setSheetOpen(true);
  };

  const openEditDialog = (index: number) => {
    const field = getValues(`registration_fields.fields.${index}`);
    setEditorState({
      mode: 'edit',
      index,
      field: { ...field },
    });
    setSheetOpen(true);
  };

  const handleSave = (field: RegistrationField) => {
    if (editorState?.mode === 'add') {
      append(field);
      return;
    }

    if (editorState?.mode === 'edit') {
      update(editorState.index, field);
    }
  };

  const handleRequestDelete = () => {
    if (editorState?.mode !== 'edit') return;
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (editorState?.mode !== 'edit') return;
    remove(editorState.index);
    setDeleteDialogOpen(false);
    restoreOnCloseRef.current = false;
    handleSheetOpenChange(false);
  };

  const handleBeforeClose = (restoreSnapshot: boolean) => {
    restoreOnCloseRef.current = restoreSnapshot;
  };

  const handleSheetOpenChange = (open: boolean) => {
    setSheetOpen(open);
    if (!open) {
      if (restoreOnCloseRef.current && editorState?.mode === 'edit') {
        update(editorState.index, editorState.field);
      }
      setEditorState(null);
      setPreviewDraft(null);
      restoreOnCloseRef.current = true;
    }
  };

  const previewOverride =
    editorState?.mode === 'add' && previewDraft ? { mode: 'add' as const, field: previewDraft } : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto w-full max-w-360">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,424px)]">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg leading-none font-bold tracking-tight lg:text-2xl">
                {__('Registration Fields', 'yay-wholesale-b2b')}
              </h2>
              <Button variant="outline" onClick={openAddDialog}>
                <Plus className="size-4" />
                <span>{__('Add New Field', 'yay-wholesale-b2b')}</span>
              </Button>
            </div>
            <RegistrationFieldsList fields={fields} onEdit={openEditDialog} onMove={move} />
          </div>

          <div className="border-divider xl:sticky xl:top-4 xl:self-start xl:border-l xl:pl-6">
            <RegistrationFieldsPreview previewOverride={previewOverride} />
          </div>
        </div>
      </div>

      <FieldEditorForm
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        onBeforeClose={handleBeforeClose}
        editorState={editorState}
        onSave={handleSave}
        onDraftChange={editorState?.mode === 'add' ? setPreviewDraft : undefined}
        onRequestDelete={handleRequestDelete}
      />

      <DeleteFieldDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirmDelete={handleConfirmDelete}
      />
    </div>
  );
}
