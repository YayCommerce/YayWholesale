import { Controller, useFormContext, useWatch } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { FieldFormValues, FieldType } from '@/lib/schema/settingsRegistration.schema';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NumberInputChevrons, NumberInputInput, NumberInputRoot, NumberInputUnit } from '@/components/ui/number-input';
import { Segmented, SegmentedItem } from '@/components/ui/segmented';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { TagsInput } from '@/components/ui/tags-input';
import { FIELD_DEFAULTS, hasAllowedExtensions, hasChoices, hasPlaceholder } from '../registration-fields.helper';
import { FileExtensionsCombobox } from './FileExtensionsCombobox';

const FIELD_TYPE_OPTIONS: { value: string; label: string }[] = [
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

const BILLING_MAPPING_OPTIONS: { value: string; label: string }[] = [
  { value: 'none', label: __('None', 'yay-wholesale-b2b') },
  { value: 'billing_first_name', label: __('Billing First Name', 'yay-wholesale-b2b') },
  { value: 'billing_last_name', label: __('Billing Last Name', 'yay-wholesale-b2b') },
  { value: 'billing_company', label: __('Billing Company', 'yay-wholesale-b2b') },
  {
    value: 'billing_country_state',
    label: __('Billing Country + State (Recommended)', 'yay-wholesale-b2b'),
  },
  { value: 'billing_country', label: __('Billing Country / Region', 'yay-wholesale-b2b') },
  { value: 'billing_state', label: __('Billing State / County', 'yay-wholesale-b2b') },
  { value: 'billing_address_1', label: __('Billing Street Address', 'yay-wholesale-b2b') },
  { value: 'billing_address_2', label: __('Billing Address Line 2', 'yay-wholesale-b2b') },
  { value: 'billing_city', label: __('Billing Town / City', 'yay-wholesale-b2b') },
  { value: 'billing_postcode', label: __('Billing Postcode / ZIP', 'yay-wholesale-b2b') },
  { value: 'billing_phone', label: __('Billing Phone Number', 'yay-wholesale-b2b') },
  { value: 'billing_vat', label: __('Billing VAT ID', 'yay-wholesale-b2b') },
  { value: 'custom', label: __('Custom User Meta Key Mapping', 'yay-wholesale-b2b') },
];

export default function FieldFormContent() {
  const { control, getValues, reset } = useFormContext<FieldFormValues>();
  const type = useWatch({ control, name: 'type' });
  const billingMapping = useWatch({ control, name: 'billingMapping' });
  const handleTypeChange = (nextType: FieldType) => {
    reset({
      ...getValues(),
      type: nextType,
      ...FIELD_DEFAULTS[nextType],
    } as FieldFormValues);
  };

  return (
    <>
      <Controller
        control={control}
        name="label"
        render={({ field: { ...field }, fieldState: { error, invalid } }) => (
          <Field>
            <FieldLabel>{__('Label', 'yay-wholesale-b2b')}</FieldLabel>
            <FieldContent>
              <Input {...field} placeholder={__('Enter a field label', 'yay-wholesale-b2b')} aria-invalid={invalid} />
            </FieldContent>
            {error && <FieldError errors={[{ message: error.message }]} />}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="type"
        render={({ field, fieldState: { error, invalid } }) => (
          <Field>
            <FieldLabel>{__('Type', 'yay-wholesale-b2b')}</FieldLabel>
            <FieldContent>
              <Select
                value={field.value}
                onValueChange={(value) => handleTypeChange(value as FieldType)}
                aria-invalid={invalid}
              >
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
            {error && <FieldError errors={[{ message: error.message }]} />}
          </Field>
        )}
      />

      {hasPlaceholder(type) && (
        <Controller
          control={control}
          name="placeholder"
          render={({ field: { ...field }, fieldState: { error, invalid } }) => (
            <Field>
              <FieldLabel>{__('Placeholder', 'yay-wholesale-b2b')}</FieldLabel>
              <FieldContent>
                <Input {...field} placeholder={__('Enter a placeholder', 'yay-wholesale-b2b')} aria-invalid={invalid} />
              </FieldContent>
              {error && <FieldError errors={[{ message: error.message }]} />}
            </Field>
          )}
        />
      )}

      {hasChoices(type) && (
        <Controller
          control={control}
          name="choices"
          render={({ field, fieldState: { error, invalid } }) => (
            <Field>
              <FieldLabel>{__('Add options', 'yay-wholesale-b2b')}</FieldLabel>
              <FieldContent>
                <TagsInput
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={__('Add option and press Enter', 'yay-wholesale-b2b')}
                  aria-invalid={invalid}
                />
              </FieldContent>
              {error && <FieldError errors={[{ message: error.message }]} />}
            </Field>
          )}
        />
      )}

      {hasAllowedExtensions(type) && (
        <>
          <Controller
            control={control}
            name="allowedExtensions"
            render={({ field, fieldState: { error, invalid } }) => (
              <Field>
                <FieldLabel>{__('Allowed extensions', 'yay-wholesale-b2b')}</FieldLabel>
                <FieldContent>
                  <FileExtensionsCombobox
                    value={field.value}
                    onValueChange={(extensions) => field.onChange(extensions)}
                    aria-invalid={invalid}
                    className="w-full"
                  />
                </FieldContent>
                {error && <FieldError errors={[{ message: error.message }]} />}
              </Field>
            )}
          />
          <Controller
            control={control}
            name="maxFileSize"
            render={({ field, fieldState: { error, invalid } }) => (
              <Field>
                <FieldLabel>{__('Max file size', 'yay-wholesale-b2b')}</FieldLabel>
                <FieldContent>
                  <NumberInputRoot
                    value={field.value}
                    onValueChange={(value) => field.onChange(value)}
                    step={1}
                    min={1}
                    max={100}
                    aria-invalid={invalid}
                  >
                    <NumberInputInput />
                    <div className="absolute inset-y-0 inset-e-0 flex">
                      <NumberInputChevrons hasUnit />
                      <NumberInputUnit unit="MB" />
                    </div>
                  </NumberInputRoot>
                </FieldContent>
                {error && <FieldError errors={[{ message: error.message }]} />}
              </Field>
            )}
          />
        </>
      )}

      <Controller
        control={control}
        name="billingMapping"
        render={({ field, fieldState: { error, invalid } }) => (
          <Field>
            <FieldLabel>{__('WooCommerce Billing Field Connection', 'yay-wholesale-b2b')}</FieldLabel>
            <FieldContent>
              <Select
                value={field.value || 'none'}
                onValueChange={(value) => field.onChange(value || 'none')}
                aria-invalid={invalid}
              >
                <SelectTrigger className="hover:bg-accent w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BILLING_MAPPING_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
            {error && <FieldError errors={[{ message: error.message }]} />}
          </Field>
        )}
      />

      {billingMapping === 'custom' && (
        <Controller
          control={control}
          name="customBillingMetaKey"
          render={({ field: { ...field }, fieldState: { error, invalid } }) => (
            <Field>
              <FieldLabel>{__('User Meta Key', 'yay-wholesale-b2b')}</FieldLabel>
              <FieldContent>
                <Input {...field} placeholder={__('Enter user meta key', 'yay-wholesale-b2b')} aria-invalid={invalid} />
              </FieldContent>
              {error && <FieldError errors={[{ message: error.message }]} />}
            </Field>
          )}
        />
      )}

      <Controller
        control={control}
        name="columnWidth"
        render={({ field: { ...field }, fieldState: { error, invalid } }) => (
          <Field>
            <FieldLabel>{__('Column width', 'yay-wholesale-b2b')}</FieldLabel>
            <FieldContent>
              <Segmented
                className="w-full"
                shape="square"
                value={field.value}
                onValueChange={field.onChange}
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
            {error && <FieldError errors={[{ message: error.message }]} />}
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
