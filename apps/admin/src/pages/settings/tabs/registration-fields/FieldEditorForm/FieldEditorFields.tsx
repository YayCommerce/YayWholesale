import { __ } from '@wordpress/i18n';

import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Segmented, SegmentedItem } from '@/components/ui/segmented';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { TagsInput } from '@/components/ui/tags-input';
import {
  FIELD_TYPE_OPTIONS,
  fieldTypeHasPlaceholder,
  isChoiceFieldType,
  type RegistrationField,
} from '../registration-fields.helpers';

export type FieldErrors = Partial<Record<keyof RegistrationField, string>>;

interface FieldEditorFieldsProps {
  field: RegistrationField;
  errors: FieldErrors;
  onUpdate: <K extends keyof RegistrationField>(key: K, value: RegistrationField[K]) => void;
  onTypeChange: (type: RegistrationField['type']) => void;
}

export default function FieldEditorFields({ field, errors, onUpdate, onTypeChange }: FieldEditorFieldsProps) {
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
