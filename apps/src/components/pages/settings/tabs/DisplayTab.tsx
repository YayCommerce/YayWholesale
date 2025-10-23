import { ColorPicker } from '@/components/ui/color-picker';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function DisplayTab() {
  return (
    <div className="space-y-6">
      {/* Two column layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Wholesale registration page */}
        <div className="space-y-2.5">
          <Label htmlFor="display-price-format" className="text-base-secondary text-xs font-medium">
            Display price format
          </Label>
          <Select>
            <SelectTrigger id="display-price-format" className="w-full font-normal">
              <SelectValue placeholder="Show retail and wholesale prices" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="retail-and-wholesale">Show retail and wholesale prices</SelectItem>
              <SelectItem value="wholesale">Show only wholesale prices</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submit button label */}
        <div className="space-y-2.5">
          <Label htmlFor="wholesale-price" className="text-base-secondary text-xs font-medium">
            Wholesale price label
          </Label>
          <Input
            id="wholesale-price"
            defaultValue=""
            placeholder="Wholesale price"
            className="w-full font-normal"
          />
        </div>
      </div>

      {/* Successful registration message */}
      <div className="space-y-2.5">
        <Label htmlFor="success-message" className="text-base-secondary text-xs font-medium">
          Wholesale price color
        </Label>
        <ColorPicker
          value="#333333"
          defaultColor="#333333"
          onChangeColor={(color: string) => console.log(color)}
        />
      </div>
    </div>
  );
}
