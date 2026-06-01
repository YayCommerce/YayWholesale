import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { RoleFormValues } from '@/lib/schema/roles.schema';
import { isPro } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  NumberInput,
  NumberInputChevrons,
  NumberInputInput,
  NumberInputRoot,
  NumberInputUnit,
} from '@/components/ui/number-input';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export default function RoleFormContent() {
  const { control } = useFormContext<RoleFormValues>();

  return (
    <div className="grid gap-5 overflow-auto p-5">
      <Controller
        control={control}
        name="name"
        render={({ field: { ref, ...field }, fieldState: { error, invalid } }) => (
          <Field>
            <FieldLabel>{__('Role Name', 'yay-wholesale-b2b')}</FieldLabel>
            <FieldContent>
              <Input
                {...field}
                value={field.value ?? ''}
                placeholder={__('Enter a wholesale role name', 'yay-wholesale-b2b')}
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

      <Controller
        control={control}
        name="description"
        render={({ field: { ref, ...field }, fieldState: { error, invalid } }) => (
          <Field>
            <FieldLabel>{__('Role description', 'yay-wholesale-b2b')}</FieldLabel>
            <FieldContent>
              <Textarea
                {...field}
                placeholder={__('This is role description', 'yay-wholesale-b2b')}
                className="h-24"
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

      <Controller
        control={control}
        name="discount"
        render={({ field: { ref, ...field }, fieldState: { error, invalid } }) => (
          <Field>
            <FieldLabel>{__('Discount', 'yay-wholesale-b2b')}</FieldLabel>
            <FieldContent>
              <NumberInput
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
                min={0}
                max={100}
                step={1}
                placeholder={__('Enter a percentage discount', 'yay-wholesale-b2b')}
                decimalSeparator={decimal_sep ?? '.'}
                decimalScale={2}
                aria-invalid={invalid}
                suffix="%"
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

      <Controller
        control={control}
        name="minOrderQuantity"
        render={({ field: { ref, ...field }, fieldState: { error, invalid } }) =>
          isPro ? (
            <Field>
              <FieldLabel>{__('Min Order Quantity', 'yay-wholesale-b2b')}</FieldLabel>
              <FieldContent>
                <NumberInput
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                  min={0}
                  step={1}
                  placeholder={__('e.g. 10 (min number of items required per order)', 'yay-wholesale-b2b')}
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
          ) : (
            <Field>
              <FieldLabel>
                {__('Min Order Quantity', 'yay-wholesale-b2b')}
                <Badge variant="warning" className="text-white">
                  {__('Pro', 'yay-wholesale-b2b')}
                </Badge>
              </FieldLabel>
              <FieldContent>
                <Input
                  value={__('Upgrade to PRO to unlock this feature.', 'yay-wholesale-b2b')}
                  // value={0}
                  min={0}
                  disabled
                />
              </FieldContent>
            </Field>
          )
        }
      />

      <Controller
        control={control}
        name="minOrderAmount"
        render={({ field: { ref, ...field }, fieldState: { error, invalid } }) => (
          <Field>
            <FieldLabel>{__('Min Order Amount', 'yay-wholesale-b2b')}</FieldLabel>
            <FieldContent>
              <NumberInputRoot
                value={field.value}
                onValueChange={(value) => field.onChange(value)}
                min={0}
                fixedDecimalScale={true}
                decimalScale={num_decimals ?? 2}
                decimalSeparator={decimal_sep ?? '.'}
                thousandSeparator={thousand_sep ?? ','}
                step={1}
              >
                <NumberInputInput
                  placeholder={__('e.g. 200.00 (min total value required per order)', 'yay-wholesale-b2b')}
                  aria-invalid={invalid}
                />
                <div className="absolute inset-y-0 inset-e-0 flex">
                  <NumberInputChevrons hasUnit />
                  <NumberInputUnit unit={symbol ?? '$'} />
                </div>
              </NumberInputRoot>
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
        name="applyToSalePrice"
        render={({ field: { ref, ...field }, fieldState: { error } }) => (
          <Field>
            <FieldContent>
              <div className="border-border flex items-center justify-between rounded-md border p-3">
                <span className="text-sm font-medium">
                  {__('Apply wholesale discounts to sale prices', 'yay-wholesale-b2b')}
                </span>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </div>
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
    </div>
  );
}

const { num_decimals, decimal_sep, thousand_sep, symbol } = window.yayWholesaleB2BMeta.wcMeta.currency_data;
