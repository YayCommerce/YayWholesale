import { useEffect, useState } from 'react';
import { Trash } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import type { Settings } from '@/lib/schema/settings.schema';
import { registrationFieldSchema } from '@/lib/schema/settings.schema';
import { Button } from '@/components/ui/button';
import { SheetClose, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { normalizeFieldForType, type RegistrationField } from '../registration-fields.helpers';
import type { FieldErrors } from './field-editor-types';
import FieldEditorFields from './FieldEditorFields';

interface EditFieldFormProps {
  fieldIndex: number;
  open: boolean;
  onSave: (field: RegistrationField) => void;
  onBeforeClose: (restoreSnapshot: boolean) => void;
  onOpenChange: (open: boolean) => void;
  onRequestDelete?: () => void;
}

export default function EditFieldForm({
  fieldIndex,
  open,
  onSave,
  onBeforeClose,
  onOpenChange,
  onRequestDelete,
}: EditFieldFormProps) {
  const { control, getValues, setValue } = useFormContext<Settings>();
  const [errors, setErrors] = useState<FieldErrors>({});

  const fieldPath = `registration_fields.fields.${fieldIndex}` as const;
  const field = useWatch({ control, name: fieldPath });

  useEffect(() => {
    if (open) {
      setErrors({});
    }
  }, [open, fieldIndex]);

  const clearError = (key: keyof RegistrationField) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const updateField = <K extends keyof RegistrationField>(key: K, value: RegistrationField[K]) => {
    const current = getValues(fieldPath);
    setValue(fieldPath, { ...current, [key]: value }, { shouldDirty: true });
    clearError(key);
  };

  const handleTypeChange = (type: RegistrationField['type']) => {
    const current = getValues(fieldPath);
    setValue(fieldPath, normalizeFieldForType(current, type), { shouldDirty: true });
    setErrors({});
  };

  const handleSave = () => {
    const result = registrationFieldSchema.safeParse(getValues(fieldPath));
    if (!result.success) {
      const nextErrors: FieldErrors = {};
      result.error.issues.forEach((issue) => {
        const key = issue.path[0];
        if (typeof key === 'string') {
          nextErrors[key as keyof RegistrationField] = issue.message;
        }
      });
      setErrors(nextErrors);
      return;
    }

    onSave(result.data);
    onBeforeClose(false);
    onOpenChange(false);
  };

  if (!field) {
    return null;
  }

  return (
    <>
      <SheetHeader>
        <div className="flex items-start justify-between">
          <SheetTitle>{__('Edit Field', 'yay-wholesale-b2b')}</SheetTitle>
        </div>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
        <FieldEditorFields field={field} errors={errors} onUpdate={updateField} onTypeChange={handleTypeChange} />
      </div>

      <SheetFooter className="shrink-0 border-t px-5 py-4">
        <div className="flex w-full items-center justify-between gap-3">
          {onRequestDelete && (
            <Button type="button" variant="outline" size="icon" onClick={onRequestDelete} className="shrink-0">
              <Trash className="size-4" />
            </Button>
          )}
          <div className="ms-auto flex gap-4">
            <SheetClose asChild>
              <Button variant="outline">{__('Cancel', 'yay-wholesale-b2b')}</Button>
            </SheetClose>
            <Button type="button" onClick={handleSave}>
              {__('Apply', 'yay-wholesale-b2b')}
            </Button>
          </div>
        </div>
      </SheetFooter>
    </>
  );
}
