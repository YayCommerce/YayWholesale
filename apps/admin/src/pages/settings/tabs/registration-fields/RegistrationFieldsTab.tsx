import { Plus } from 'lucide-react';
import { __ } from '@wordpress/i18n';

import { Button } from '@/components/ui/button';
import { DeleteFieldDialog } from './DeleteFieldDialog';
import { FieldForm } from './FieldForm';
import { RegistrationFieldsList } from './RegistrationFieldsList';
import { RegistrationFieldsPreview } from './RegistrationFieldsPreview';
import { useRegistrationFields } from './useRegistrationFields';

export default function RegistrationFieldsTab() {
  const {
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
    onDraftChange,
  } = useRegistrationFields();

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
            <RegistrationFieldsPreview fields={previewFields} submitLabel={submitLabel} />
          </div>
        </div>
      </div>

      <FieldForm
        open={sheetOpen}
        onOpenChange={handleSheetOpenChange}
        onBeforeClose={handleBeforeClose}
        fieldEditor={fieldEditor}
        onSave={handleSave}
        onDraftChange={onDraftChange}
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
