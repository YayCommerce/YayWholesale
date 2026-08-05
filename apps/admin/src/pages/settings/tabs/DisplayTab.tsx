import { useMemo, useState } from 'react';
import { Edit } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { parseWPCurrency } from '@/lib/helpers/format.helper';
import type { Settings } from '@/lib/schema/settings.schema';
import { isPro } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  ColorPicker,
  ColorPickerContent,
  ColorPickerInput,
  ColorPickerPanel,
  ColorPickerProps,
  ColorPickerSwatch,
  ColorPickerTrigger,
} from '@/components/ui/color-picker';
import { AddToCartSkeleton, ProductImageSkeleton } from '@/components/ui/custom/shop-skeleton';
import { UpgradeToProBadge } from '@/components/ui/custom/upgrate-to-pro';
import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Segmented, SegmentedItem } from '@/components/ui/segmented';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';

export default function DisplayTab() {
  const { control, watch } = useFormContext<Settings>();
  const [previewing, setPreviewing] = useState('wholesaler');

  const wholesaleDisplayFormat = watch('display.wholesaler_price_format');
  const retailDisplayFormat = watch('display.retailer_price_format');
  const priceLabel = watch('display.wholesale_price_label');
  const priceColor = watch('display.wholesale_price_color');

  const isShowingFull = useMemo(
    () =>
      (previewing === 'wholesaler' && wholesaleDisplayFormat === 'retail-and-wholesale') ||
      (previewing === 'retailer' && retailDisplayFormat === 'retail-and-wholesale'),
    [wholesaleDisplayFormat, retailDisplayFormat, previewing],
  );

  return (
    <div className="flex flex-wrap justify-center gap-10">
      <div className="flex flex-1 flex-col gap-5">
        {/* Wholesale registration page */}
        <Controller
          control={control}
          name="display.wholesaler_price_format"
          render={({ field }) => (
            <Field>
              <FieldLabel>{__('Price Format for Wholesaler (B2B)', 'yay-wholesale-b2b')}</FieldLabel>
              <FieldContent>
                <Select defaultValue={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="display-price-format" className="w-full">
                    <SelectValue placeholder={__('Select a option', 'yay-wholesale-b2b')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail-and-wholesale">
                      {__('Show retail and wholesale prices', 'yay-wholesale-b2b')}
                    </SelectItem>
                    <SelectItem value="wholesale-only">
                      {__('Show only wholesale prices', 'yay-wholesale-b2b')}
                    </SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
          )}
        />

        <Controller
          control={control}
          name="display.retailer_price_format"
          render={({ field }) => (
            <Field>
              <FieldLabel>{__('Price Format for Retailer (B2C)', 'yay-wholesale-b2b')}</FieldLabel>
              <FieldContent>
                <Select defaultValue={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="display-price-format" className="w-full">
                    <SelectValue placeholder={__('Select a option', 'yay-wholesale-b2b')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail-and-wholesale">
                      {__('Show retail and wholesale prices', 'yay-wholesale-b2b')}
                    </SelectItem>
                    <SelectItem value="retail-only">{__('Show only retail prices', 'yay-wholesale-b2b')}</SelectItem>
                  </SelectContent>
                </Select>
              </FieldContent>
            </Field>
          )}
        />

        {/* Submit button label */}

        <Controller
          control={control}
          name="display.wholesale_price_label"
          render={({ field }) => (
            <Field>
              <FieldLabel>{__('Wholesale price label', 'yay-wholesale-b2b')}</FieldLabel>
              <FieldContent>
                <Input
                  id="wholesale-price-label"
                  defaultValue={field.value}
                  onChange={field.onChange}
                  placeholder={__('Wholesale price', 'yay-wholesale-b2b')}
                  className="w-full font-normal"
                />
              </FieldContent>
            </Field>
          )}
        />

        {/* Successful registration message */}

        <Controller
          control={control}
          name="display.wholesale_price_color"
          render={({ field }) => (
            <Field>
              <FieldLabel>{__('Wholesale price color', 'yay-wholesale-b2b')}</FieldLabel>
              <FieldContent>
                <CustomColorPicker value={field.value} onValueChange={(color: string) => field.onChange(color)} />
              </FieldContent>
            </Field>
          )}
        />

        <Separator />
        <Controller
          control={control}
          name="display.requirement_bar_visible"
          render={({ field }) => (
            <div className="flex items-center justify-between gap-5 rounded-md border p-4">
              <div>
                <h2 className="flex items-center gap-2 leading-3.5 font-medium">
                  {__('Requirement Bar', 'yay-wholesale-b2b')}
                  {!isPro && <UpgradeToProBadge />}
                </h2>
                <p className="text-muted-foreground mt-2 text-xs font-normal">
                  {__('Display a requirement progress bar in mini cart, cart and checkout pages.', 'yay-wholesale-b2b')}
                </p>
              </div>
              <Switch checked={field.value} onCheckedChange={field.onChange} disabled={!isPro} />
            </div>
          )}
        />

        {isBlockTheme ? (
          <div className="flex flex-col items-end justify-between gap-4 rounded-md border p-4 lg:flex-row lg:items-center lg:gap-15">
            <div>
              <h2 className="flex items-center gap-2 leading-3.5 font-medium">
                {__('Template Editor', 'yay-wholesale-b2b')}
                {!isPro && <UpgradeToProBadge />}
              </h2>
              <span className="text-muted-foreground mt-2 text-xs font-normal">
                {__(
                  "Create, customize and manage access permissions for each user role in the shop page. Build your shop catalog using the 'Products with Wholesale' template.",
                  'yay-wholesale-b2b',
                )}
              </span>
            </div>
            <Button
              variant="outline"
              className="flex items-center gap-2"
              onClick={() => {
                window.open(window.yayWholesaleB2BMeta.wcMeta.setting_urls.templateEditor);
              }}
            >
              <Edit className="size-4" />
              <span className="text-[13px]">{__('Manage', 'yay-wholesale-b2b')}</span>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            <Controller
              control={control}
              name="display.classic_retailer_template"
              render={({ field }) => (
                <div className="flex flex-col items-start justify-between gap-2 rounded-md border p-4 lg:flex-row lg:items-center">
                  <div>
                    <h2 className="flex items-center gap-2 leading-3.5 font-medium">
                      {__('Retailer Shop Template', 'yay-wholesale-b2b')}
                      {!isPro && <UpgradeToProBadge />}
                    </h2>
                    <p className="text-muted-foreground mt-2 text-xs font-normal">
                      {__("Select a template for your retailer's product catalog page", 'yay-wholesale-b2b')}
                    </p>
                  </div>
                  <Select value={field.value ? field.value : 'wc'} onValueChange={field.onChange} disabled={!isPro}>
                    <SelectTrigger className="w-full min-w-full lg:w-55 lg:min-w-55">
                      <SelectValue placeholder={__('Select the template', 'yay-wholesale-b2b')} />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {classic_templates.map((template, index) => (
                        <SelectItem key={index} value={template.slug}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />

            <Controller
              control={control}
              name="display.classic_wholesaler_template"
              render={({ field }) => (
                <div className="flex flex-col items-start justify-between gap-2 rounded-md border p-4 lg:flex-row lg:items-center">
                  <div>
                    <h2 className="flex items-center gap-2 leading-3.5 font-medium">
                      {__('Wholesaler Shop Template', 'yay-wholesale-b2b')}
                      {!isPro && <UpgradeToProBadge />}
                    </h2>
                    <p className="text-muted-foreground mt-2 text-xs font-normal">
                      {__("Select a template for your wholesaler's product catalog page", 'yay-wholesale-b2b')}
                    </p>
                  </div>
                  <Select value={field.value ? field.value : 'wc'} onValueChange={field.onChange} disabled={!isPro}>
                    <SelectTrigger className="w-full min-w-full lg:w-55 lg:min-w-55">
                      <SelectValue placeholder={__('Select the template', 'yay-wholesale-b2b')} />
                    </SelectTrigger>
                    <SelectContent align="end">
                      {classic_templates.map((template, index) => (
                        <SelectItem key={index} value={template.slug}>
                          {template.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            />
          </div>
        )}
      </div>
      <div className="border-divider flex w-fit flex-1 justify-center border-t py-4 lg:flex-0 lg:border-t-0 lg:border-l lg:pr-6 lg:pl-10">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-l font-bold">{__('Preview', 'yay-wholesale-b2b')}</span>
            <Segmented
              size="sm"
              shape="square"
              value={previewing}
              onValueChange={(value) => {
                if (value) {
                  setPreviewing(value);
                }
              }}
            >
              <SegmentedItem value="wholesaler">B2B</SegmentedItem>
              <SegmentedItem value="retailer">B2C</SegmentedItem>
            </Segmented>
          </div>
          <ProductImageSkeleton />
          <div className="flex flex-col gap-2.5">
            <Skeleton className="bg-muted h-2 w-16.25 animate-none" />
            <Skeleton className="bg-muted h-2 w-32.5 animate-none" />
          </div>
          <div className="flex flex-col gap-3">
            {(isShowingFull || previewing == 'retailer') && (
              <p className="flex gap-1.5 text-sm/3.5 text-[#A0A0A7]">
                {isShowingFull && <span>{__('Retail:', 'yay-wholesale-b2b')}</span>}
                <del> {parseWPCurrency(20)} </del>
                <span>{parseWPCurrency(18)}</span>
              </p>
            )}
            {(isShowingFull || previewing == 'wholesaler') && (
              <p className="flex gap-1.5 text-sm/3.5">
                {priceLabel.length > 0 && <span>{priceLabel}:</span>}
                <span className="font-bold" style={{ color: priceColor }}>
                  {parseWPCurrency(15)}
                </span>
              </p>
            )}
          </div>
          <AddToCartSkeleton />
        </div>
      </div>
    </div>
  );
}

function CustomColorPicker({ children, ...props }: ColorPickerProps) {
  return (
    <ColorPicker {...props}>
      <ColorPickerTrigger />
      <ColorPickerContent>
        <ColorPickerPanel />
        <ColorPickerInput />
        <div className="mt-1 flex justify-between">
          <ColorPickerSwatch swatchValue="#171717" title="Black" />
          <ColorPickerSwatch swatchValue="#fafafa" title="White" />
          <ColorPickerSwatch swatchValue="#d50719" title="Red" />
          <ColorPickerSwatch swatchValue="#ea580c" title="Orange" />
          <ColorPickerSwatch swatchValue="#f9bd09" title="Yellow" />
          <ColorPickerSwatch swatchValue="#16a34a" title="Green" />
          <ColorPickerSwatch swatchValue="#3858e9" title="Blue" />
          <ColorPickerSwatch swatchValue="#6d28d9" title="Violet" />
        </div>
      </ColorPickerContent>
    </ColorPicker>
  );
}

const { isBlockTheme } = window.yayWholesaleB2BMeta.wpMeta;
const { classic_templates } = window.yayWholesaleB2BMeta.wcMeta;
