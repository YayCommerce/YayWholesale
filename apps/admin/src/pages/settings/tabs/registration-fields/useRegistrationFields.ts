import { useRef, useState } from 'react';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import type { Settings } from '@/lib/schema/settings.schema';
import type { FieldEditorState, RegistrationField } from './registration-fields-types';
import { createDefaultField } from './registration-fields.helpers';

export function useRegistrationFields() {
  const { control, getValues } = useFormContext<Settings>();
  const [fieldEditor, setFieldEditor] = useState<FieldEditorState | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [previewDraft, setPreviewDraft] = useState<RegistrationField | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const restoreOnCloseRef = useRef(true);

  const { fields, append, remove, move, update } = useFieldArray({
    control,
    name: 'registration_fields.fields',
  });

  const formFields = useWatch({ control, name: 'registration_fields.fields' }) ?? [];
  const submitLabel = useWatch({ control, name: 'registration.submit_button_label' });

  const previewFields = fieldEditor?.mode === 'add' && previewDraft ? [...formFields, previewDraft] : formFields;

  const openAddDialog = () => {
    const newField = createDefaultField(fields.length);
    setPreviewDraft(newField);
    setFieldEditor({
      mode: 'add',
      field: newField,
    });
    setSheetOpen(true);
  };

  const openEditDialog = (index: number) => {
    const field = getValues(`registration_fields.fields.${index}`);
    setFieldEditor({
      mode: 'edit',
      index,
      field: { ...field },
    });
    setSheetOpen(true);
  };

  const handleSave = (field: RegistrationField) => {
    if (fieldEditor?.mode === 'add') {
      append(field);
      return;
    }

    if (fieldEditor?.mode === 'edit') {
      update(fieldEditor.index, field);
    }
  };

  const handleRequestDelete = () => {
    if (fieldEditor?.mode !== 'edit') return;
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (fieldEditor?.mode !== 'edit') return;
    remove(fieldEditor.index);
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
      if (restoreOnCloseRef.current && fieldEditor?.mode === 'edit') {
        update(fieldEditor.index, fieldEditor.field);
      }
      setFieldEditor(null);
      setPreviewDraft(null);
      restoreOnCloseRef.current = true;
    }
  };

  return {
    fields,
    previewFields,
    submitLabel,
    fieldEditor,
    sheetOpen,
    deleteDialogOpen,
    openAddDialog,
    openEditDialog,
    handleSave,
    handleRequestDelete,
    handleConfirmDelete,
    handleBeforeClose,
    handleSheetOpenChange,
    setDeleteDialogOpen,
    move,
    onDraftChange: fieldEditor?.mode === 'add' ? setPreviewDraft : undefined,
  };
}
