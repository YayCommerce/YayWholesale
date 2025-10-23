import { useState } from 'react';

import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function GeneralTab() {
  const [showWholesalePrice, setShowWholesalePrice] = useState(false);
  const [disableCoupon, setDisableCoupon] = useState(false);
  const [disableTax, setDisableTax] = useState(false);

  return (
    <div className="space-y-6">
      {/* Default role for new user */}
      <div className="space-y-2.5">
        <Label htmlFor="default-role" className="text-base-secondary text-xs font-medium">
          Default role for new user
        </Label>
        <Select>
          <SelectTrigger id="default-role" className="w-full">
            <SelectValue placeholder="Select a option" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="wholesale">Wholesale User</SelectItem>
            <SelectItem value="regular">Regular User</SelectItem>
            <SelectItem value="guest">Guest</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="base-base-border flex items-center justify-between rounded-md border p-4">
        <div>
          <h2 className="text-base-secondary text-sm font-normal">
            Show Wholesale Price to non-wholesale users
          </h2>
          <p className="text-base-muted-foreground mt-1 text-xs font-normal">
            If enable, wholesale price will display for all users.
          </p>
        </div>
        <Switch size="md" checked={showWholesalePrice} onCheckedChange={setShowWholesalePrice} />
      </div>

      <div className="base-base-border flex items-center justify-between rounded-lg border p-4">
        <div>
          <h2 className="text-base-secondary text-sm font-normal">Disable coupon</h2>
          <p className="text-base-muted-foreground mt-1 text-xs font-normal">
            Hide coupon field for wholesale users.
          </p>
        </div>
        <Switch size="md" checked={disableCoupon} onCheckedChange={setDisableCoupon} />
      </div>

      {/* Disable tax */}
      <div className="base-base-border flex items-center justify-between rounded-md border p-4">
        <div>
          <h2 className="text-base-secondary text-sm font-normal">Disable tax</h2>
          <p className="text-base-muted-foreground mt-1 text-xs font-normal">
            Don't charge tax for wholesale users.
          </p>
        </div>
        <Switch size="md" checked={disableTax} onCheckedChange={setDisableTax} />
      </div>
    </div>
  );
}
