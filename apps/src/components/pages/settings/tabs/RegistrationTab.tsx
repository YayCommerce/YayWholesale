import { useState } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export default function RegistrationTab() {
  const [moderate, setModerate] = useState(true);

  return (
    <div className="space-y-6">
      {/* Moderate new registrations */}
      <div className="base-base-border flex items-center justify-between rounded-md border p-4">
        <div>
          <h2 className="text-base-secondary text-sm font-normal">Moderate new registrations</h2>
          <p className="text-base-muted-foreground mt-1 text-xs font-normal">
            Hold new wholesale registrations for moderation by an administrator.
          </p>
        </div>
        <Switch size="md" checked={moderate} onCheckedChange={setModerate} />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-2 gap-6">
        {/* Wholesale registration page */}
        <div className="space-y-2.5">
          <Label htmlFor="wholesale-page" className="text-base-secondary text-xs font-medium">
            Wholesale registration page
          </Label>
          <Select>
            <SelectTrigger id="wholesale-page" className="w-full font-normal">
              <SelectValue placeholder="Select a option" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="page1">Wholesale Registration</SelectItem>
              <SelectItem value="page2">B2B Registration</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Submit button label */}
        <div className="space-y-2.5">
          <Label htmlFor="submit-label" className="text-base-secondary text-xs font-medium">
            Submit button label
          </Label>
          <Input id="submit-label" placeholder="Register now" className="w-full font-normal" />
        </div>
      </div>

      {/* Successful registration message */}
      <div className="space-y-2.5">
        <Label htmlFor="success-message" className="text-base-secondary text-xs font-medium">
          Successful registration message
        </Label>
        <Textarea
          id="success-message"
          rows={4}
          defaultValue="Thank you for registering. Your account begin reviewing. Please wait to be approved."
          className="w-full resize-none font-normal"
        />
      </div>
    </div>
  );
}
