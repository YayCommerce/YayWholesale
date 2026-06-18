import { useMemo, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { parseWPCurrency } from '@/lib/helpers/format.helper';
import type { Settings } from '@/lib/schema/settings.schema';
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
import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Segmented, SegmentedItem } from '@/components/ui/segmented';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';

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
