import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { useActiveRolesQuery } from '@/lib/queries/roles.queries';
import type { Settings } from '@/lib/schema/settings.schema';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function GeneralTab() {
  const { control } = useFormContext<Settings>();

  const { data: activeRoles } = useActiveRolesQuery();

  const rolesList = useMemo(() => {
    return (
      activeRoles?.map((role) => ({
        slug: role.slug,
        name: role.name,
      })) ?? []
    );
  }, [activeRoles]);

  // const roleSlugs = useMemo(() => new Set(rolesList.map((r) => r.slug)), [rolesList]);

  return (
    <div className="flex flex-col gap-4">
      {/* Default role for new user */}
      <Controller
        control={control}
        name={`general.default_role`}
        render={({ field, fieldState }) => (
          <Field className="flex w-full flex-col gap-2.5">
            <FieldLabel className="text-xs font-medium">
              {__('Default role for new user', 'yay-wholesale-b2b')}
            </FieldLabel>
            <FieldContent>
              <Select value={field.value ? field.value : ''} onValueChange={field.onChange}>
                <SelectTrigger className="min-w-40 text-sm font-normal">
                  <SelectValue placeholder={__('Select a role', 'yay-wholesale-b2b')} />
                </SelectTrigger>
                <SelectContent>
                  {rolesList.map((role) => (
                    <SelectItem key={role.slug} value={role.slug}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldContent>
            {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
          </Field>
        )}
      />

      <Controller
        control={control}
        name={`general.show_wholesale_price`}
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <h2 className="text-foreground-400 text-sm leading-3.5 font-medium">
                {__('Show Wholesale Price to non-wholesale users', 'yay-wholesale-b2b')}
              </h2>
              <p className="text-muted-foreground mt-2 text-xs font-normal">
                {__('If enable, wholesale price will display for all users.', 'yay-wholesale-b2b')}
              </p>
            </div>
            <Switch
              id="show-wholesale-price"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked)}
            />
          </div>
        )}
      />

      <Controller
        control={control}
        name={`general.disable_coupon`}
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <h2 className="text-foreground-400 text-sm leading-3.5 font-medium">
                {__('Disable coupon', 'yay-wholesale-b2b')}
              </h2>
              <p className="text-muted-foreground mt-2 text-xs font-normal">
                {__('Hide coupon field for wholesale users.', 'yay-wholesale-b2b')}
              </p>
            </div>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />

      {/* Disable tax */}

      <Controller
        control={control}
        name={`general.disable_tax`}
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <h2 className="text-foreground-400 text-sm leading-3.5 font-medium">
                {__('Disable tax', 'yay-wholesale-b2b')}
              </h2>
              <p className="text-muted-foreground mt-2 text-xs font-normal">
                {__("Don't charge tax for wholesale users.", 'yay-wholesale-b2b')}
              </p>
            </div>
            <Switch checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />

      <Controller
        control={control}
        name={`general.tax_display_mode`}
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <h2 className="text-foreground-400 text-sm leading-3.5 font-medium">
                {__('Display prices in the shop', 'yay-wholesale-b2b')}
              </h2>
              <p className="text-muted-foreground mt-2 text-xs font-normal">
                {__('Display product prices Including or Excluding tax for wholesalers in shop', 'yay-wholesale-b2b')}
              </p>
            </div>
            <Select value={field.value ? field.value : 'inherit'} onValueChange={field.onChange}>
              <SelectTrigger className="min-w-40 text-sm font-normal">
                <SelectValue placeholder={__('Select the display mode', 'yay-wholesale-b2b')} />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="inherit">
                  {__('Inherit from the storewide tax settings [the default]', 'yay-wholesale-b2b')}
                </SelectItem>
                <SelectItem value="incl">{__('Including tax', 'yay-wholesale-b2b')}</SelectItem>
                <SelectItem value="excl">{__('Excluding tax', 'yay-wholesale-b2b')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      />
    </div>
  );
}
