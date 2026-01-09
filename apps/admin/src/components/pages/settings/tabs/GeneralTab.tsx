import { useEffect, useMemo } from 'react';
import { __ } from '@wordpress/i18n';
import { useFormContext } from 'react-hook-form';

import { useActiveRolesQuery, useRolesQuery } from '@/lib/queries/roles';
import { SettingsFormData } from '@/lib/schema/settings';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function GeneralTab() {
  const { control } = useFormContext<SettingsFormData>();

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
      <FormField
        control={control}
        name={`general.default_role`}
        render={({ field }) => (
          <FormItem className="flex w-full flex-col gap-2.5">
            <FormLabel className="text-xs font-medium">
              {__('Default role for new user', 'yay-wholesale')}
            </FormLabel>
            <FormControl>
              <Select value={field.value ? field.value : ''} onValueChange={field.onChange}>
                <SelectTrigger className="min-w-40 text-sm font-normal">
                  <SelectValue placeholder={__('Select a role', 'yay-wholesale')} />
                </SelectTrigger>
                <SelectContent>
                  {rolesList.map((role) => (
                    <SelectItem key={role.slug} value={role.slug}>
                      {role.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name={`general.show_wholesale_price`}
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <h2 className="text-foreground-400 text-sm leading-3.5 font-medium">
                {__('Show Wholesale Price to non-wholesale users', 'yay-wholesale')}
              </h2>
              <p className="text-muted-foreground mt-2 text-xs font-normal">
                {__('If enable, wholesale price will display for all users.', 'yay-wholesale')}
              </p>
            </div>
            <Switch
              size="md"
              id="show-wholesale-price"
              checked={field.value}
              onCheckedChange={(checked) => field.onChange(checked)}
            />
          </div>
        )}
      />

      <FormField
        control={control}
        name={`general.disable_coupon`}
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <h2 className="text-foreground-400 text-sm leading-3.5 font-medium">
                {__('Disable coupon', 'yay-wholesale')}
              </h2>
              <p className="text-muted-foreground mt-2 text-xs font-normal">
                {__("Hide coupon field for wholesale users., 'yay-wholesale'")}
              </p>
            </div>
            <Switch size="md" checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />

      {/* Disable tax */}

      <FormField
        control={control}
        name={`general.disable_tax`}
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <h2 className="text-foreground-400 text-sm leading-3.5 font-medium">
                {__('Disable tax', 'yay-wholesale')}
              </h2>
              <p className="text-muted-foreground mt-2 text-xs font-normal">
                {__("Don't charge tax for wholesale users.", 'yay-wholesale')}
              </p>
            </div>
            <Switch size="md" checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />
    </div>
  );
}
