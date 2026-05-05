import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { parseWPCurrency } from '@/lib/helpers/format.helper';
import { SettingsFormData } from '@/lib/schema/settings';
import { AddToCartSkeleton, ProductImageSkeleton } from '@/components/ui/custom/shop-skeleton';
import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ColorPicker } from '@/components/ui/wp-color-picker';

export default function DisplayTab() {
  const { control, watch } = useFormContext<SettingsFormData>();

  const displayFormat = watch('display.price_format');
  const priceLabel = watch('display.wholesale_price_label');
  const priceColor = watch('display.wholesale_price_color');

  return (
    <div className="flex flex-wrap justify-center gap-10">
      <div className="flex flex-1 flex-col gap-5">
        {/* Wholesale registration page */}
        <Controller
          control={control}
          name={`display.price_format`}
          render={({ field }) => (
            <Field className="flex w-full flex-col gap-2.5">
              <FieldLabel className="text-foreground-400 text-xs font-medium">
                {__('Display price format', 'yay-wholesale-b2b')}
              </FieldLabel>
              <FieldContent>
                <Select defaultValue={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="display-price-format" className="w-full font-normal">
                    <SelectValue placeholder={__('Select a option', 'yay-wholesale-b2b')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail-and-wholesale">
                      {__('Show retail and wholesale prices', 'yay-wholesale-b2b')}
                    </SelectItem>
                    <SelectItem value="wholesale-only">
                      {__('Show only wholesale prices', 'yay-wholesale-b2b')}
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
          name={`display.wholesale_price_label`}
          render={({ field }) => (
            <Field className="flex w-full flex-col gap-2.5">
              <FieldLabel className="text-foreground-400 text-xs font-medium">
                {__('Wholesale price label', 'yay-wholesale-b2b')}
              </FieldLabel>
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
          name={`display.wholesale_price_color`}
          render={({ field }) => (
            <Field className="flex w-full flex-col gap-2.5">
              <FieldLabel className="text-foreground-400 text-xs font-medium">
                {__('Wholesale price color', 'yay-wholesale-b2b')}
              </FieldLabel>
              <FieldContent>
                <ColorPicker
                  value={field.value}
                  defaultColor={field.value}
                  onChangeColor={(color: string) => field.onChange(color)}
                />
              </FieldContent>
            </Field>
          )}
        />
      </div>
      <div className="border-divider flex w-fit flex-1 justify-center border-t py-4 lg:flex-0 lg:border-t-0 lg:border-l lg:pr-6 lg:pl-10">
        <div className="flex flex-col gap-4">
          <ProductImageSkeleton />
          <div className="flex flex-col gap-2.5">
            <Skeleton className="h-2 w-[65px] animate-none bg-[#F1F3F6]" />
            <Skeleton className="h-2 w-[130px] animate-none bg-[#F1F3F6]" />
          </div>
          {['retail-and-wholesale', 'retail-only'].includes(displayFormat) && (
            <p className="flex gap-1.5 text-[14px] leading-3.5 text-[#A0A0A7]">
              {displayFormat === 'retail-and-wholesale' && <span>{__('Retail:', 'yay-wholesale-b2b')}</span>}
              <del> {parseWPCurrency(20)} </del>
              <span>{parseWPCurrency(18)}</span>
            </p>
          )}
          {['retail-and-wholesale', 'wholesale-only'].includes(displayFormat) && (
            <p className="flex gap-1.5 text-[14px] leading-3.5">
              <span>{priceLabel}:</span>
              <span className="font-bold" style={{ color: priceColor }}>
                {parseWPCurrency(15)}
              </span>
            </p>
          )}
          <AddToCartSkeleton />
        </div>
      </div>
    </div>
  );
}
