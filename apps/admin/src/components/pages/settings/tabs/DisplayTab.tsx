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
    <div className="space-y-6">
      {/* Two column layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Wholesale registration page */}
        <FormField
          control={control}
          name={`display.price_format`}
          render={({ field }) => (
            <FormItem className="w-full">
              <FormLabel className="text-foreground-400 space-y-2.5 text-xs font-medium">
                {__('Display price format', 'yay-wholesale')}
              </FormLabel>
              <FormControl>
                <Select defaultValue={field.value} onValueChange={field.onChange}>
                  <SelectTrigger id="display-price-format" className="w-full font-normal">
                    <SelectValue placeholder={__('Select a option', 'yay-wholesale')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="retail-and-wholesale">
                      {__('Show retail and wholesale prices', 'yay-wholesale')}
                    </SelectItem>
                    <SelectItem value="wholesale-only">
                      {__('Show only wholesale prices', 'yay-wholesale')}
                    </SelectItem>
                    <SelectItem value="retail-only">
                      {__('Show only retail prices', 'yay-wholesale')}
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
            <FormItem className="w-full">
              <FormLabel className="text-foreground-400 space-y-2.5 text-xs font-medium">
                {__('Wholesale price label', 'yay-wholesale')}
              </FormLabel>
              <FormControl>
                <Input
                  id="wholesale-price-label"
                  defaultValue={field.value}
                  onChange={field.onChange}
                  placeholder={__('Wholesale price', 'yay-wholesale')}
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
          <FormItem className="w-full">
            <FormLabel className="text-foreground-400 space-y-2.5 text-xs font-medium">
              {__('Wholesale price color', 'yay-wholesale')}
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
