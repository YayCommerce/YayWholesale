import { __ } from '@wordpress/i18n';
import { useFormContext } from 'react-hook-form';

import { SettingsFormData } from '@/lib/schema/settings';
import { ColorPicker } from '@/components/ui/color-picker';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function DisplayTab() {
  const { control, watch } = useFormContext<SettingsFormData>();
  return (
    <div className="flex flex-col gap-6">
      {/* Two column layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Wholesale registration page */}
        <FormField
          control={control}
          name={`display.price_format`}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-2.5">
              <FormLabel className="text-foreground-400 text-xs font-medium">
                {__('Display price format', 'yay-wholesale-b2b')}
              </FormLabel>
              <FormControl>
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
              </FormControl>
            </FormItem>
          )}
        />

        {/* Submit button label */}

        <FormField
          control={control}
          name={`display.wholesale_price_label`}
          render={({ field }) => (
            <FormItem className="flex w-full flex-col gap-2.5">
              <FormLabel className="text-foreground-400 text-xs font-medium">
                {__('Wholesale price label', 'yay-wholesale-b2b')}
              </FormLabel>
              <FormControl>
                <Input
                  id="wholesale-price-label"
                  defaultValue={field.value}
                  onChange={field.onChange}
                  placeholder={__('Wholesale price', 'yay-wholesale-b2b')}
                  className="w-full font-normal"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Successful registration message */}

      <FormField
        control={control}
        name={`display.wholesale_price_color`}
        render={({ field }) => (
          <FormItem className="flex w-full flex-col gap-2.5">
            <FormLabel className="text-foreground-400 text-xs font-medium">
              {__('Wholesale price color', 'yay-wholesale-b2b')}
            </FormLabel>
            <FormControl>
              <ColorPicker
                value={field.value}
                defaultColor={field.value}
                onChangeColor={(color: string) => field.onChange(color)}
              />
            </FormControl>
          </FormItem>
        )}
      />
    </div>
  );
}
