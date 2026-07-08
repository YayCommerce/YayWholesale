import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { createFieldFormSchema, FieldFormValues } from '@/lib/schema/settingsRegistration.schema';
import { Button } from '@/components/ui/button';
import { SheetClose, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toFieldFormValues } from '../registration-fields.helper';
import { DeleteFieldDialog } from './DeleteFieldDialog';
import FieldFormContent from './FieldFormContent';

interface EditFieldFormProps {
  field: FieldFormValues;
  editingIndex: number;
  siblingFields: FieldFormValues[];
  onSave: (data: FieldFormValues) => void;
  onDelete: () => void;
}

export default function EditFieldForm({ field, editingIndex, siblingFields, onSave, onDelete }: EditFieldFormProps) {
  const form = useForm<FieldFormValues>({
    resolver: zodResolver(createFieldFormSchema(siblingFields, editingIndex)),
    mode: 'onChange',
    defaultValues: toFieldFormValues(field),
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const onSubmit = (field: FieldFormValues) => {
    onSave(field);
  };

  useEffect(() => {
    form.reset(toFieldFormValues(field));
  }, [field, form]);

  return (
    <FormProvider {...form}>
      <SheetHeader>
        <div className="flex items-start justify-between">
          <SheetTitle>{__('Edit Field', 'yay-wholesale-b2b')}</SheetTitle>
        </div>
      </SheetHeader>
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
        <FieldFormContent />
      </div>
      <SheetFooter className="shrink-0 border-t px-5 py-4">
        <div className="flex w-full items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setDeleteDialogOpen(true)}
            className="shrink-0"
          >
            <Trash className="size-4" />
          </Button>
          <div className="ms-auto flex gap-4">
            <SheetClose asChild>
              <Button variant="outline">{__('Cancel', 'yay-wholesale-b2b')}</Button>
            </SheetClose>
            <Button type="button" onClick={form.handleSubmit(onSubmit)}>
              {__('Apply', 'yay-wholesale-b2b')}
            </Button>
          </div>
        </div>
      </SheetFooter>
      {/* Delete Field Dialog */}
      <DeleteFieldDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirmDelete={() => {
          onDelete();
          setDeleteDialogOpen(false);
        }}
      />
      {/* Delete Field Dialog */}
    </FormProvider>
  );
}
