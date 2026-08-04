import { useMemo } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { useAllPagesQuery } from '@/lib/queries/pages.queries';
import { useActiveRolesQuery } from '@/lib/queries/roles.queries';
import type { Settings } from '@/lib/schema/settings.schema';
import { isPro } from '@/lib/utils';
import { UpgradeToProBadge } from '@/components/ui/custom/upgrate-to-pro';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import {
  DescribedSelectItem,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

const isWholesaleStoreExperimental = window.yayWholesaleB2BMeta.wholesaleMeta.experimentals.wholesale_store_page;

export default function GeneralTab() {
  const { control } = useFormContext<Settings>();

  const { data: activeRoles } = useActiveRolesQuery();
  const { data: allPages } = useAllPagesQuery();

  const rolesList = useMemo(() => {
    return (
      activeRoles?.map((role) => ({
        slug: role.slug,
        name: role.name,
      })) ?? []
    );
  }, [activeRoles]);

  const validPagesforWholesaleStore = useMemo(() => {
    if (!allPages) {
      return [];
    }
    const excluded = window.yayWholesaleB2BAdmin.wc_page_ids;
    return allPages.pages.flatMap((pageGroup) => pageGroup.pages).filter((page) => !excluded.includes(page.id));
  }, [allPages]);

  return (
    <div className="flex flex-col gap-4">
      {/* Default role for new user */}
      <Controller
        control={control}
        name="general.default_role"
        render={({ field, fieldState }) => (
          <Field className="flex w-full flex-col gap-1.5">
            <FieldLabel className="text-xs font-medium">
              {__('Default role for new user', 'yay-wholesale-b2b')}
            </FieldLabel>
            <FieldContent>
              <Select value={field.value ? field.value : ''} onValueChange={field.onChange}>
                <SelectTrigger className="min-w-67.5">
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

      {isWholesaleStoreExperimental && (
        <Controller
          control={control}
          name="general.wholesale_store_page"
          render={({ field }) => (
            <div className="flex items-center justify-between rounded-md border p-4">
              <div>
                <h2 className="flex items-center gap-2 leading-3.5 font-medium">
                  {__('Wholesale shop page', 'yay-wholesale-b2b')}
                  {!isPro && <UpgradeToProBadge />}
                </h2>
                <p className="text-muted-foreground mt-2 text-xs font-normal">
                  {__('Set your wholesale shop page for wholesaler logged in', 'yay-wholesale-b2b')}
                </p>
              </div>
              <Select value={String(field.value) || 'inherit'} onValueChange={field.onChange} disabled={!isPro}>
                <SelectTrigger className="sm:min-45 w-25 min-w-25 sm:w-45">
                  <SelectValue placeholder={__('Select your page', 'yay-wholesale-b2b')} />
                </SelectTrigger>
                <SelectContent align="end">
                  <SelectItem value="inherit">{__('WooCommerce shop page', 'yay-wholesale-b2b')}</SelectItem>
                  {validPagesforWholesaleStore.map((page) => (
                    <SelectItem key={page.id} value={String(page.id)}>
                      {page.title.rendered}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        />
      )}

      <Controller
        control={control}
        name="general.disable_coupon"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div>
              <h2 className="leading-3.5 font-medium">{__('Disable coupon', 'yay-wholesale-b2b')}</h2>
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
        name="general.disable_tax"
        render={({ field }) => (
          <div className="flex items-center justify-between rounded-md border p-4">
            <div>
              <h2 className="leading-3.5 font-medium">{__('Disable tax', 'yay-wholesale-b2b')}</h2>
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
        name="general.tax_display_mode"
        render={({ field }) => (
          <div className="flex items-center justify-between gap-5 rounded-md border p-4">
            <div>
              <h2 className="flex items-center gap-2 leading-3.5 font-medium">
                {__('Display prices in the shop', 'yay-wholesale-b2b')}
                {!isPro && <UpgradeToProBadge />}
              </h2>
              <p className="text-muted-foreground mt-2 text-xs font-normal">
                {__('Display product prices including or excluding tax for wholesalers in shop', 'yay-wholesale-b2b')}
              </p>
            </div>
            <Select value={field.value ? field.value : 'inherit'} onValueChange={field.onChange} disabled={!isPro}>
              <SelectTrigger className="w-25 min-w-25 sm:w-67.5 sm:min-w-67.5">
                <SelectValue placeholder={__('Select the display mode', 'yay-wholesale-b2b')} />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="inherit">{__('Woocommerce setting', 'yay-wholesale-b2b')}</SelectItem>
                <SelectItem value="incl">{__('Including tax', 'yay-wholesale-b2b')}</SelectItem>
                <SelectItem value="excl">{__('Excluding tax', 'yay-wholesale-b2b')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      />

      <Controller
        control={control}
        name="general.guest_access_rule"
        render={({ field }) => (
          <div className="flex items-center justify-between gap-5 rounded-md border p-4">
            <div>
              <h2 className="flex items-center gap-2 leading-3.5 font-medium">
                {__('Guest Access Rule', 'yay-wholesale-b2b')}
                {!isPro && <UpgradeToProBadge />}
              </h2>
              <p className="text-muted-foreground mt-2 text-xs font-normal">
                {__(
                  'Configure shop access for guest users, including product visibility and pricing.',
                  'yay-wholesale-b2b',
                )}
              </p>
            </div>

            <Select
              value={field.value ? field.value : 'no-restriction'}
              onValueChange={field.onChange}
              disabled={!isPro}
            >
              <SelectTrigger className="w-25 min-w-25 sm:w-67.5 sm:min-w-67.5">
                <SelectValue placeholder={__('Select the guest restriction rule', 'yay-wholesale-b2b')} />
              </SelectTrigger>
              <SelectContent align="end">
                <DescribedSelectItem
                  value="no-restriction"
                  label={__('No Restriction', 'yay-wholesale-b2b')}
                  description={__('Guest is treated as Retailer Customers.', 'yay-wholesale-b2b')}
                />
                <DescribedSelectItem
                  value="hidden-prices"
                  label={__('Hidden Prices', 'yay-wholesale-b2b')}
                  description={__(
                    'Guest cannot see product prices, instead sees "Log in to view price".',
                    'yay-wholesale-b2b',
                  )}
                />
                <DescribedSelectItem
                  value="hidden-entire-shop"
                  label={__('Hidden Entire Shop', 'yay-wholesale-b2b')}
                  description={__(
                    "Guest get redirected to login page (and can't view any products/categories).",
                    'yay-wholesale-b2b',
                  )}
                />
              </SelectContent>
            </Select>
          </div>
        )}
      />
    </div>
  );
}
