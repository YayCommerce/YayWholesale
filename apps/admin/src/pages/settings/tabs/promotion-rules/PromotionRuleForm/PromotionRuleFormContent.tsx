import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { useActiveRolesQuery } from '@/lib/queries/roles.queries';
import type { PromotionRuleFormValues } from '@/lib/schema/promotion.schema';
import { EnableByRoleCombobox } from '@/components/ui/enable-role-picker/EnableByRoleCombobox';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { NumberInput } from '@/components/ui/number-input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { PROMOTION_CONDITIONS } from '../promotion-rule.helper';

export default function PromotionRuleFormContent() {
  const { control } = useFormContext<PromotionRuleFormValues>();
  const { data: activeRoles } = useActiveRolesQuery();

  return (
    <>
      <Controller
        control={control}
        name="title"
        render={({ field: { ...field }, fieldState: { error, invalid } }) => (
          <Field>
            <FieldLabel>{__('Title', 'yay-wholesale-b2b')}</FieldLabel>
            <FieldContent>
              <Input {...field} placeholder={__('Enter a title', 'yay-wholesale-b2b')} aria-invalid={invalid} />
            </FieldContent>
            {error && <FieldError errors={[{ message: error.message }]} />}
          </Field>
        )}
      />

      <Controller
        control={control}
        name="condition"
        render={({ field: { ...field }, fieldState: { error, invalid } }) => {
          return (
            <Field className="flex w-full flex-col gap-1.5">
              <FieldLabel>{__('Condition', 'yay-wholesale-b2b')}</FieldLabel>

              <FieldContent>
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger className="w-full" aria-invalid={invalid}>
                    <SelectValue placeholder={__('Select a condition', 'yay-wholesale-b2b')} />
                  </SelectTrigger>

                  <SelectContent>
                    {PROMOTION_CONDITIONS.map((condition) => (
                      <SelectItem key={condition.value} value={condition.value}>
                        {condition.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FieldContent>

              {error && <FieldError errors={[{ message: error.message }]} />}
            </Field>
          );
        }}
      />

      <Controller
        control={control}
        name="conditionAmount"
        render={({ field: { ...field }, fieldState: { error, invalid } }) => {
          return (
            <Field className="flex w-full flex-col gap-1.5">
              <FieldLabel>{__('Condition Amount', 'yay-wholesale-b2b')}</FieldLabel>
              <FieldContent>
                <NumberInput
                  value={field.value}
                  onValueChange={(value) => field.onChange(value)}
                  min={0}
                  placeholder={__('Enter a condition amount', 'yay-wholesale-b2b')}
                  aria-invalid={invalid}
                />
              </FieldContent>

              {error && <FieldError errors={[{ message: error.message }]} />}
            </Field>
          );
        }}
      />

      <Controller
        control={control}
        name="fromRoles"
        render={({ field }) => {
          return (
            <Field>
              <FieldLabel>{__('From Roles', 'yay-wholesale-b2b')}</FieldLabel>
              <FieldContent className="-my-3">
                <EnableByRoleCombobox
                  value={field.value}
                  onValueChange={(v) => {
                    field.onChange(v);
                  }}
                />
              </FieldContent>
            </Field>
          );
        }}
      />

      <Controller
        control={control}
        name="newRole"
        render={({ field, fieldState: { error, invalid } }) => {
          const selectedRole = field.value?.[0] === 'retailers' ? 'retailers' : (field.value?.[1] ?? 'none');

          return (
            <Field className="flex w-full flex-col gap-1.5">
              <FieldLabel>{__('New Role', 'yay-wholesale-b2b')}</FieldLabel>

              <FieldContent>
                <Select
                  value={selectedRole}
                  onValueChange={(value) => {
                    if (value === 'retailers') {
                      field.onChange(['retailers', '']);
                      return;
                    }

                    field.onChange(['wholesalers', value]);
                  }}
                >
                  <SelectTrigger className="w-full" aria-invalid={invalid}>
                    <SelectValue placeholder={__('Select a role', 'yay-wholesale-b2b')} />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="retailers">{__('Retail Customers (B2C)', 'yay-wholesale-b2b')}</SelectItem>
                    <SelectGroup>
                      <SelectLabel>{__('Wholesale Customers (B2B)', 'yay-wholesale-b2b')}</SelectLabel>
                      {activeRoles.map((role) => (
                        <SelectItem key={role.slug} value={role.slug}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </FieldContent>

              {error && <FieldError errors={[{ message: error.message }]} />}
            </Field>
          );
        }}
      />

      <div className="border-border flex flex-col gap-4 rounded-md border px-5 py-4">
        <div className="flex items-center justify-between rounded-md">
          <span className="text-sm font-medium">{__('Enabled status', 'yay-wholesale-b2b')}</span>
          <Controller
            control={control}
            name="enableStatus"
            render={({ field }) => <Switch size="sm" checked={field.value} onCheckedChange={field.onChange} />}
          />
        </div>
      </div>
    </>
  );
}
