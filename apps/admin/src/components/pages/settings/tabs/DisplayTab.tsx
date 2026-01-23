import { __ } from '@wordpress/i18n';
import { Controller, useFormContext } from 'react-hook-form';

import { SettingsFormData } from '@/lib/schema/settings';
import { Field, FieldContent, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ColorPicker } from '@/components/ui/wp-color-picker';

export default function DisplayTab() {
  const { control, watch } = useFormContext<SettingsFormData>();
  return (
    <div className="flex flex-col gap-6">
      {/* Two column layout */}
      <div className="grid grid-cols-2 gap-6">
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
                    <SelectItem value="retail-only">
                      {__('Show only retail prices', 'yay-wholesale-b2b')}
                    </SelectItem>
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
      </div>

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
  );
}
