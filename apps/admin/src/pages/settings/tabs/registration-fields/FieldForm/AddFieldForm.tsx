import { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';

import { registrationFieldSchema } from '@/lib/schema/settings.schema';
import { Button } from '@/components/ui/button';
import { SheetClose, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import type { FieldEditorErrors, RegistrationField } from '../registration-fields-types';
import { normalizeFieldForType } from '../registration-fields.helpers';
import FieldFormContent from './FieldFormContent';

interface AddFieldFormProps {
  initialField: RegistrationField;
  open: boolean;
  onSave: (field: RegistrationField) => void;
  onBeforeClose: (restoreSnapshot: boolean) => void;
  onOpenChange: (open: boolean) => void;
  onDraftChange?: (field: RegistrationField) => void;
}

export default function AddFieldForm({
  initialField,
  open,
  onSave,
  onBeforeClose,
  onOpenChange,
  onDraftChange,
}: AddFieldFormProps) {
  const [draft, setDraft] = useState<RegistrationField>(initialField);
  const [errors, setErrors] = useState<FieldEditorErrors>({});

  useEffect(() => {
    if (open) {
      setDraft(initialField);
      setErrors({});
    }
  }, [open, initialField]);

  useEffect(() => {
    if (open) {
      onDraftChange?.(draft);
    }
  }, [draft, open, onDraftChange]);

  const clearError = (key: keyof RegistrationField) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const updateDraft = <K extends keyof RegistrationField>(key: K, value: RegistrationField[K]) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
    clearError(key);
  };

  const handleTypeChange = (type: RegistrationField['type']) => {
    setDraft((prev) => normalizeFieldForType(prev, type));
    setErrors({});
  };

  const handleSave = () => {
    const result = registrationFieldSchema.safeParse(draft);
    if (!result.success) {
      const nextErrors: FieldEditorErrors = {};
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

  return (
    <>
      <SheetHeader>
        <div className="flex items-start justify-between">
          <SheetTitle>{__('Create New Field', 'yay-wholesale-b2b')}</SheetTitle>
        </div>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
        <FieldFormContent field={draft} errors={errors} onUpdate={updateDraft} onTypeChange={handleTypeChange} />
      </div>

      <SheetFooter className="shrink-0 border-t px-5 py-4">
        <div className="flex w-full items-center justify-between gap-3">
          <span className="hidden sm:block" />
          <div className="ms-auto flex gap-4">
            <SheetClose asChild>
              <Button variant="outline">{__('Cancel', 'yay-wholesale-b2b')}</Button>
            </SheetClose>
            <Button type="button" onClick={handleSave}>
              {__('Create New', 'yay-wholesale-b2b')}
            </Button>
          </div>
        </div>
      </SheetFooter>
    </>
  );
}
