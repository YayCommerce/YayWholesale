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

  const roleSlugs = useMemo(() => new Set(rolesList.map((r) => r.slug)), [rolesList]);

  return (
    <div className="space-y-6">
      {/* Default role for new user */}
      <FormField
        control={control}
        name={`general.default_role`}
        render={({ field }) => (
          <FormItem className="w-full">
            <FormLabel className="space-y-2.5 text-xs font-medium">
              {__('Default role for new user')}
            </FormLabel>
            <FormControl>
              <Select
                value={field.value && roleSlugs.has(field.value) ? field.value : ''}
                onValueChange={field.onChange}
              >
                <SelectTrigger className="w-[160px] text-sm font-normal">
                  <SelectValue placeholder={__('Select a role')} />
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
          <div className="base-base-border flex items-center justify-between rounded-md border p-4">
            <div>
              <h2 className="text-base-secondary text-sm font-normal">
                Show Wholesale Price to non-wholesale users
              </h2>
              <p className="text-base-muted-foreground mt-1 text-xs font-normal">
                If enable, wholesale price will display for all users.
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
          <div className="base-base-border flex items-center justify-between rounded-lg border p-4">
            <div>
              <h2 className="text-base-secondary text-sm font-normal">Disable coupon</h2>
              <p className="text-base-muted-foreground mt-1 text-xs font-normal">
                Hide coupon field for wholesale users.
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
          <div className="base-base-border flex items-center justify-between rounded-md border p-4">
            <div>
              <h2 className="text-base-secondary text-sm font-normal">Disable tax</h2>
              <p className="text-base-muted-foreground mt-1 text-xs font-normal">
                Don't charge tax for wholesale users.
              </p>
            </div>
            <Switch size="md" checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />
    </div>
  );
}
