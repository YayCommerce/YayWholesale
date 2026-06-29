import { useEffect, useState } from 'react';
import { Trash } from 'lucide-react';
import { __ } from '@wordpress/i18n';

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

type FieldEditorFormProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'add' | 'edit';
  initialField: RegistrationField;
  onSave: (field: RegistrationField) => void;
  onDraftChange?: (field: RegistrationField) => void;
  onDelete?: () => void;
};

type FieldErrors = Partial<Record<keyof RegistrationField, string>>;

export function FieldEditorForm({
  open,
  onOpenChange,
  mode,
  initialField,
  onSave,
  onDraftChange,
  onDelete,
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

  const updateDraft = <K extends keyof RegistrationField>(key: K, value: RegistrationField[K]) => {
    setDraft((prev: RegistrationField) => ({ ...prev, [key]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleTypeChange = (type: RegistrationField['type']) => {
    setDraft((prev: RegistrationField) => normalizeFieldForType(prev, type));
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

  const showPlaceholder = fieldTypeHasPlaceholder(draft.type);
  const showChoices = isChoiceFieldType(draft.type);

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
          <Field>
            <FieldLabel>{__('Label', 'yay-wholesale-b2b')}</FieldLabel>
            <FieldContent>
              <Input
                value={draft.label}
                onChange={(e) => updateDraft('label', e.target.value)}
                placeholder={__('Business Name', 'yay-wholesale-b2b')}
                aria-invalid={!!errors.label}
              />
            </FieldContent>
            {errors.label && <FieldError errors={[{ message: errors.label }]} />}
          </Field>

          <Field>
            <FieldLabel className="flex items-center gap-2">{__('Type', 'yay-wholesale-b2b')}</FieldLabel>
            <FieldContent>
              <Select
                value={draft.type}
                onValueChange={(value) => handleTypeChange(value as RegistrationField['type'])}
                // disabled={draft.isDefault}
              >
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
                  value={draft.placeholder}
                  onChange={(e) => updateDraft('placeholder', e.target.value)}
                  placeholder={
                    draft.type === 'checkbox'
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
                  value={draft.choices ?? []}
                  onValueChange={(choices) => updateDraft('choices', choices)}
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
                value={draft.columnWidth}
                onValueChange={(value) => {
                  if (value) updateDraft('columnWidth', value as RegistrationField['columnWidth']);
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
              <Switch
                size="sm"
                checked={!draft.isHidden}
                onCheckedChange={(checked) => updateDraft('isHidden', !checked)}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">{__('Set as required', 'yay-wholesale-b2b')}</span>
              <Switch
                size="sm"
                checked={draft.isRequired}
                onCheckedChange={(checked) => updateDraft('isRequired', checked)}
              />
            </div>
          </div>
        </div>

        <SheetFooter className="shrink-0 border-t px-5 py-4">
          <div className="flex w-full items-center justify-between gap-3">
            {mode === 'edit' && onDelete ? (
              <Button type="button" variant="outline" size="icon" onClick={onDelete} className="shrink-0">
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
