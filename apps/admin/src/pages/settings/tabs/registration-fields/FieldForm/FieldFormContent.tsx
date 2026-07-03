import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { FieldFormValues, FieldType } from '@/lib/schema/settingsRegistration.schema';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Segmented, SegmentedItem } from '@/components/ui/segmented';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { TagsInput } from '@/components/ui/tags-input';

const FIELD_TYPE_OPTIONS: { value: FieldType; label: string }[] = [
  { value: 'text', label: __('Input', 'yay-wholesale-b2b') },
  { value: 'email', label: __('Email', 'yay-wholesale-b2b') },
  { value: 'number', label: __('Number', 'yay-wholesale-b2b') },
  { value: 'phone', label: __('Phone', 'yay-wholesale-b2b') },
  { value: 'date', label: __('Date', 'yay-wholesale-b2b') },
  { value: 'textarea', label: __('Textarea', 'yay-wholesale-b2b') },
  { value: 'select', label: __('Select', 'yay-wholesale-b2b') },
  { value: 'radio', label: __('Radio', 'yay-wholesale-b2b') },
  { value: 'checkbox', label: __('Checkbox', 'yay-wholesale-b2b') },
  { value: 'attachment', label: __('Attachment', 'yay-wholesale-b2b') },
];

export default function FieldFormContent() {
  const { control } = useFormContext<FieldFormValues>();
  const type = useWatch({ control, name: 'type' });
  const isChoiceType = ['radio', 'select', 'checkbox'].includes(type);

  return (
    <>
      <Controller
        control={control}
        name="label"
        render={({ field: { ref, ...field }, fieldState: { error, invalid } }) => (
          <Field>
            <FieldLabel>{__('Label', 'yay-wholesale-b2b')}</FieldLabel>
            <FieldContent>
              <Input {...field} placeholder={__('Enter a field label', 'yay-wholesale-b2b')} aria-invalid={invalid} />
            </FieldContent>
            {error && (
              <FieldError
                errors={[
                  {
                    message: error.message,
                  },
                ]}
              />
            )}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="type"
        render={({ field: { ref, ...field }, fieldState: { error, invalid } }) => (
          <Field>
            <FieldLabel>{__('Type', 'yay-wholesale-b2b')}</FieldLabel>
            <FieldContent>
              <Select {...field} onValueChange={(value) => field.onChange(value)} aria-invalid={invalid}>
                <SelectTrigger className="hover:bg-accent w-full">
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
            {error && (
              <FieldError
                errors={[
                  {
                    message: error.message,
                  },
                ]}
              />
            )}
          </Field>
        )}
      />

      {!isChoiceType && (
        <Controller
          control={control}
          name="placeholder"
          render={({ field: { ref, ...field }, fieldState: { error, invalid } }) => (
            <Field>
              <FieldLabel>{__('Placeholder', 'yay-wholesale-b2b')}</FieldLabel>
              <FieldContent>
                <Input {...field} placeholder={__('Enter a placeholder', 'yay-wholesale-b2b')} aria-invalid={invalid} />
              </FieldContent>
              {error && (
                <FieldError
                  errors={[
                    {
                      message: error.message,
                    },
                  ]}
                />
              )}
            </Field>
          )}
        />
      )}

      {isChoiceType && (
        <Controller
          control={control}
          name="choices"
          render={({ field: { ref, ...field }, fieldState: { error, invalid } }) => (
            <Field>
              <FieldLabel>{__('Add options', 'yay-wholesale-b2b')}</FieldLabel>
              <FieldContent>
                <TagsInput
                  {...ref}
                  value={field.value ?? []}
                  onValueChange={(choices) => field.onChange(choices as string[])}
                  placeholder={__('Add option and press Enter', 'yay-wholesale-b2b')}
                  aria-invalid={invalid}
                />
              </FieldContent>
              {error && (
                <FieldError
                  errors={[
                    {
                      message: error.message,
                    },
                  ]}
                />
              )}
            </Field>
          )}
        />
      )}

      <Controller
        control={control}
        name="columnWidth"
        render={({ field: { ref, ...field }, fieldState: { error, invalid } }) => (
          <Field>
            <FieldLabel>{__('Column width', 'yay-wholesale-b2b')}</FieldLabel>
            <FieldContent>
              <Segmented
                className="w-full"
                shape="square"
                value={field.value}
                onValueChange={(value) => field.onChange(value as FieldFormValues['columnWidth'])}
                aria-invalid={invalid}
              >
                <SegmentedItem value="50%" className="flex-1">
                  50%
                </SegmentedItem>
                <SegmentedItem value="100%" className="flex-1">
                  100%
                </SegmentedItem>
              </Segmented>
            </FieldContent>
            {error && (
              <FieldError
                errors={[
                  {
                    message: error.message,
                  },
                ]}
              />
            )}
          </Field>
        )}
      />

      <div className="border-border flex flex-col gap-4 rounded-md border px-5 py-4">
        <div className="flex items-center justify-between rounded-md">
          <span className="text-sm font-medium">{__('Enabled status', 'yay-wholesale-b2b')}</span>
          <Controller
            control={control}
            name="isHidden"
            render={({ field }) => (
              <Switch size="sm" checked={!field.value} onCheckedChange={(checked) => field.onChange(!checked)} />
            )}
          />
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">{__('Set as required', 'yay-wholesale-b2b')}</span>
          <Controller
            control={control}
            name="isRequired"
            render={({ field }) => (
              <Switch size="sm" checked={field.value} onCheckedChange={(checked) => field.onChange(checked)} />
            )}
          />
        </div>
      </div>
    </>
  );
}
