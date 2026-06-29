import { useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { Trash } from 'lucide-react';
import { __ } from '@wordpress/i18n';

import type { Settings } from '@/lib/schema/settings.schema';
import { registrationFieldSchema } from '@/lib/schema/settings.schema';
import { Button } from '@/components/ui/button';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Segmented, SegmentedItem } from '@/components/ui/segmented';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { TagsInput } from '@/components/ui/tags-input';
import {
  FIELD_TYPE_OPTIONS,
  fieldTypeHasPlaceholder,
  isChoiceFieldType,
  normalizeFieldForType,
  type RegistrationField,
} from './registration-fields.helpers';

type FieldErrors = Partial<Record<keyof RegistrationField, string>>;

type FieldEditorFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  fieldIndex?: number;
  initialField: RegistrationField;
  onSave: (field: RegistrationField) => void;
  onDraftChange?: (field: RegistrationField) => void;
  onRequestDelete?: () => void;
};

type FieldEditorFieldsProps = {
  field: RegistrationField;
  errors: FieldErrors;
  onUpdate: <K extends keyof RegistrationField>(key: K, value: RegistrationField[K]) => void;
  onTypeChange: (type: RegistrationField['type']) => void;
};

function FieldEditorFields({ field, errors, onUpdate, onTypeChange }: FieldEditorFieldsProps) {
  const showPlaceholder = fieldTypeHasPlaceholder(field.type);
  const showChoices = isChoiceFieldType(field.type);

  return (
    <>
      <Field>
        <FieldLabel>{__('Label', 'yay-wholesale-b2b')}</FieldLabel>
        <FieldContent>
          <Input
            value={field.label}
            onChange={(e) => onUpdate('label', e.target.value)}
            placeholder={__('Business Name', 'yay-wholesale-b2b')}
            aria-invalid={!!errors.label}
          />
        </FieldContent>
        {errors.label && <FieldError errors={[{ message: errors.label }]} />}
      </Field>

      <Field>
        <FieldLabel className="flex items-center gap-2">{__('Type', 'yay-wholesale-b2b')}</FieldLabel>
        <FieldContent>
          <Select value={field.type} onValueChange={(value) => onTypeChange(value as RegistrationField['type'])}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {FIELD_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FieldContent>
      </Field>

      {showPlaceholder && (
        <Field>
          <FieldLabel>{__('Placeholder', 'yay-wholesale-b2b')}</FieldLabel>
          <FieldContent>
            <Input
              value={field.placeholder}
              onChange={(e) => onUpdate('placeholder', e.target.value)}
              placeholder={
                field.type === 'checkbox'
                  ? __('Please select multiple items', 'yay-wholesale-b2b')
                  : __('Business name', 'yay-wholesale-b2b')
              }
            />
          </FieldContent>
        </Field>
      )}

      {showChoices && (
        <Field>
          <FieldLabel>{__('Add options', 'yay-wholesale-b2b')}</FieldLabel>
          <FieldContent>
            <TagsInput
              value={field.choices ?? []}
              onValueChange={(choices) => onUpdate('choices', choices)}
              placeholder={__('Add option and press Enter', 'yay-wholesale-b2b')}
              splitChars={[',']}
              aria-invalid={!!errors.choices}
            />
          </FieldContent>
          {errors.choices && <FieldError errors={[{ message: errors.choices }]} />}
        </Field>
      )}

      <Field>
        <FieldLabel>{__('Column width', 'yay-wholesale-b2b')}</FieldLabel>
        <FieldContent>
          <Segmented
            className="w-full"
            shape="square"
            value={field.columnWidth}
            onValueChange={(value) => {
              if (value) onUpdate('columnWidth', value as RegistrationField['columnWidth']);
            }}
          >
            <SegmentedItem value="50%" className="flex-1">
              50%
            </SegmentedItem>
            <SegmentedItem value="100%" className="flex-1">
              100%
            </SegmentedItem>
          </Segmented>
        </FieldContent>
      </Field>

      <div className="border-border flex flex-col gap-4 rounded-md border px-5 py-4">
        <div className="flex items-center justify-between rounded-md">
          <span className="text-sm font-medium">{__('Enabled status', 'yay-wholesale-b2b')}</span>
          <Switch size="sm" checked={!field.isHidden} onCheckedChange={(checked) => onUpdate('isHidden', !checked)} />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{__('Set as required', 'yay-wholesale-b2b')}</span>
          <Switch size="sm" checked={field.isRequired} onCheckedChange={(checked) => onUpdate('isRequired', checked)} />
        </div>
      </div>
    </>
  );
}

function AddFieldEditorForm({
  open,
  onOpenChange,
  mode,
  initialField,
  onSave,
  onDraftChange,
  onRequestDelete,
}: FieldEditorFormProps) {
  const [draft, setDraft] = useState<RegistrationField>(initialField);
  const [errors, setErrors] = useState<FieldErrors>({});

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
    onOpenChange(false);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent hasMargin>
        <SheetHeader>
          <div className="flex items-start justify-between">
            <SheetTitle>
              {mode === 'add' ? __('Create New Field', 'yay-wholesale-b2b') : __('Edit Field', 'yay-wholesale-b2b')}
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
          <FieldEditorFields field={draft} errors={errors} onUpdate={updateDraft} onTypeChange={handleTypeChange} />
        </div>

        <SheetFooter className="shrink-0 border-t px-5 py-4">
          <div className="flex w-full items-center justify-between gap-3">
            {mode === 'edit' && onRequestDelete ? (
              <Button type="button" variant="outline" size="icon" onClick={onRequestDelete} className="shrink-0">
                <Trash className="size-4" />
              </Button>
            ) : (
              <span className="hidden sm:block" />
            )}
            <div className="ms-auto flex gap-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {__('Cancel', 'yay-wholesale-b2b')}
              </Button>
              <Button type="button" onClick={handleSave}>
                {mode === 'add' ? __('Create New', 'yay-wholesale-b2b') : __('Apply', 'yay-wholesale-b2b')}
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

function EditFieldEditorForm({
  open,
  onOpenChange,
  fieldIndex,
  onSave,
  onRequestDelete,
}: Omit<FieldEditorFormProps, 'mode' | 'initialField' | 'onDraftChange'> & { fieldIndex: number }) {
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
    onOpenChange(false);
  };

  if (!field) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent hasMargin>
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
            {onRequestDelete ? (
              <Button type="button" variant="outline" size="icon" onClick={onRequestDelete} className="shrink-0">
                <Trash className="size-4" />
              </Button>
            ) : (
              <span className="hidden sm:block" />
            )}
            <div className="ms-auto flex gap-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                {__('Cancel', 'yay-wholesale-b2b')}
              </Button>
              <Button type="button" onClick={handleSave}>
                {__('Apply', 'yay-wholesale-b2b')}
              </Button>
            </div>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}

export function FieldEditorForm(props: FieldEditorFormProps) {
  if (props.mode === 'edit' && props.fieldIndex !== undefined) {
    return <EditFieldEditorForm {...props} fieldIndex={props.fieldIndex} />;
  }

  return <AddFieldEditorForm {...props} />;
}
