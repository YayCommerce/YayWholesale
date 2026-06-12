import { Label } from '@radix-ui/react-label';
import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { RoleFormValues } from '@/lib/schema/roles.schema';
import { isPro } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  NumberInput,
  NumberInputChevrons,
  NumberInputInput,
  NumberInputRoot,
  NumberInputUnit,
} from '@/components/ui/number-input';
import { Segmented, SegmentedItem } from '@/components/ui/segmented';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export default function RoleFormContent() {
  const { control } = useFormContext<RoleFormValues>();

  return (
    <div className="grid gap-5 overflow-auto p-5">
      <Controller
        control={control}
        name="role.name"
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
        name="role.description"
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
        name="role.discount"
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

      <div className="grid grid-cols-2 gap-5">
        <Controller
          control={control}
          name="role.minOrderQuantity"
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
          name="role.minOrderAmount"
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
      </div>

      <div className="border-border flex flex-col gap-4 rounded-md border p-5">
        <Controller
          control={control}
          name="paymentMethods"
          render={({ field: { ref, ...field }, fieldState: { error } }) => (
            <Field>
              <FieldLabel>{__('Payment methods', 'yay-wholesale-b2b')}</FieldLabel>
              <FieldContent>
                <Segmented
                  className="w-full rounded-md"
                  value={field.value?.enabled}
                  onValueChange={(value) => {
                    if (value && value.length > 0) {
                      field.onChange({ ...field.value, enabled: value });
                    }
                  }}
                >
                  <SegmentedItem value="enable-all" className="w-1/2 rounded-md!">
                    {__('Enable All', 'yay-wholesale-b2b')}
                  </SegmentedItem>
                  <SegmentedItem value="enable-selected-methods" className="w-1/2 rounded-md!">
                    {__('Enable Selected', 'yay-wholesale-b2b')}
                  </SegmentedItem>
                </Segmented>
                {field.value?.enabled && field.value.enabled === 'enable-selected-methods' && (
                  <div className="grid grid-cols-2">
                    {wooPaymentMethods.map((method) => (
                      <div className="my-4 flex items-center gap-2.5">
                        <Checkbox
                          id={method.method_id}
                          checked={field.value && field.value.selected_methods.includes(method.method_id)}
                          onCheckedChange={(checked) => {
                            if (!field.value?.selected_methods) return;
                            if (checked) {
                              field.onChange({
                                ...field.value,
                                selected_methods: [...field.value.selected_methods, method.method_id],
                              });
                            } else {
                              field.onChange({
                                ...field.value,
                                selected_methods: field.value.selected_methods.filter((m) => m != method.method_id),
                              });
                            }
                          }}
                        />
                        <Label htmlFor={method.method_id}>{method.method_title}</Label>
                      </div>
                    ))}
                  </div>
                )}
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
          name="shippingMethods"
          render={({ field: { ref, ...field }, fieldState: { error } }) => (
            <Field>
              <FieldLabel>{__('Shipping methods', 'yay-wholesale-b2b')}</FieldLabel>
              <FieldContent>
                <Segmented
                  className="w-full rounded-md"
                  value={field.value?.enabled}
                  onValueChange={(value) => {
                    if (value && value.length > 0) {
                      field.onChange({ ...field.value, enabled: value });
                    }
                  }}
                >
                  <SegmentedItem value="enable-all" className="w-1/2 rounded-md!">
                    {__('Enable All', 'yay-wholesale-b2b')}
                  </SegmentedItem>
                  <SegmentedItem value="enable-selected-methods" className="w-1/2 rounded-md!">
                    {__('Enable Selected', 'yay-wholesale-b2b')}
                  </SegmentedItem>
                </Segmented>
                {field.value?.enabled && field.value.enabled === 'enable-selected-methods' && (
                  <div className="grid grid-cols-2">
                    {wooShippingMethods.map((method) => (
                      <div className="my-4 flex items-center gap-2.5">
                        <Checkbox
                          id={method.instance_id.toString()}
                          checked={field.value && field.value.selected_methods.includes(method.instance_id)}
                          onCheckedChange={(checked) => {
                            if (!field.value?.selected_methods) return;
                            if (checked) {
                              field.onChange({
                                ...field.value,
                                selected_methods: [...field.value.selected_methods, method.instance_id],
                              });
                            } else {
                              field.onChange({
                                ...field.value,
                                selected_methods: field.value.selected_methods.filter((m) => m != method.instance_id),
                              });
                            }
                          }}
                        />
                        <Label htmlFor={method.instance_id.toString()} className="hover:cursor-pointer">
                          {method.instance_name}
                          <div className="text-muted-foreground text-xs">
                            {method.zone_id > 0 ? method.zone_name : __('Rest of the World', 'yay-wholesale-b2b')}
                          </div>
                        </Label>
                      </div>
                    ))}
                  </div>
                )}
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

      <div className="border-border flex flex-col gap-4 rounded-md border px-5 py-4">
        <Controller
          control={control}
          name="role.applyToSalePrice"
          render={({ field: { ref, ...field }, fieldState: { error } }) => (
            <Field>
              <FieldContent>
                <div className="flex items-center justify-between rounded-md">
                  <span className="text-sm font-medium">
                    {__('Apply wholesale discounts to sale prices', 'yay-wholesale-b2b')}
                  </span>
                  <Switch size="sm" checked={field.value} onCheckedChange={field.onChange} />
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
        <Separator />
        <Controller
          control={control}
          name="role.status"
          render={({ field: { ref, ...field }, fieldState: { error } }) => (
            <Field>
              <FieldContent>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{__('Enable Status', 'yay-wholesale-b2b')}</span>
                  <Switch size="sm" checked={field.value} onCheckedChange={field.onChange} />
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
    </div>
  );
}

const { num_decimals, decimal_sep, thousand_sep, symbol } = window.yayWholesaleB2BMeta.wcMeta.currency_data;
const wooPaymentMethods = window.yayWholesaleB2BMeta.wcMeta.payment_methods_info;
const wooShippingMethods = window.yayWholesaleB2BMeta.wcMeta.shipping_methods_info;
