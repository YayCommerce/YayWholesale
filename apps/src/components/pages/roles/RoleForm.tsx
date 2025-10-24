import { __ } from '@wordpress/i18n';
import { X } from 'lucide-react';
import { useFormContext } from 'react-hook-form';
import { useMatch, useNavigate, useParams } from 'react-router-dom';

import { RolesListFormData } from '@/lib/schema/roles';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export default function RoleForm() {
  const isAddingRole = useMatch({ path: '/roles/new' }) !== null;
  const editRoleId = useParams().roleId;
  const navigate = useNavigate();

  const isSheetOpen = isAddingRole || editRoleId !== undefined;

  const { watch } = useFormContext<RolesListFormData>();
  const roles = watch('roles') || [];
  const roleEdit = editRoleId ? roles.find((role) => role.id === Number(editRoleId)) : null;

  return (
    <Sheet
      open={isSheetOpen}
      onOpenChange={(open) => {
        if (!open) navigate('/roles');
      }}
    >
      <SheetContent
        side="right"
        className="top-[32px] h-[calc(100%-32px)] w-full gap-0 overflow-x-auto pt-0 md:min-w-[490px]"
      >
        <SheetHeader className="border-border border-b p-5">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-[18px] font-semibold text-[#151619]">
                {!roleEdit ? __('Add New Role') : __('Edit Role')}
              </h2>
              <p className="text-base-muted-foreground mt-[4px] text-sm leading-[20px] font-normal">
                {__('Enter the information below to add a new wholesale user role')}
              </p>
            </div>
            <SheetClose asChild>
              <button className="mt-1 text-[#67708066] hover:text-[#677080]">
                <X className="h-5 w-5" />
              </button>
            </SheetClose>
          </div>
        </SheetHeader>

        <div className="grid gap-5 overflow-auto p-5">
          <div className="space-y-1.5">
            <Label htmlFor="role-name" className="text-base-secondary text-xs font-medium">
              {__('Role name')}
            </Label>
            <Input
              id="role-name"
              placeholder={__('Enter a wholesale role name')}
              className="rounded-md"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="role-description" className="text-base-secondary text-xs font-medium">
              {__('Role description')}
            </Label>
            <Textarea
              id="role-description"
              placeholder={__('Enter a wholesale role description')}
              className="h-24 rounded-md"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="discount" className="text-base-secondary text-xs font-medium">
              {__('Discount')}
            </Label>
            <Input
              id="discount"
              placeholder={__('Enter a percentage discount')}
              className="rounded-md"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="min-order-qty" className="text-base-secondary text-xs font-medium">
              {__('Min Order Quantity')}
            </Label>
            <Input
              id="min-order-qty"
              placeholder={__('e.g. 10 (min number of items required per order)')}
              className="h-9 rounded-md"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="min-order-amount" className="text-base-secondary text-xs font-medium">
              {__('Min Order Amount')}
            </Label>
            <Input
              id="min-order-amount"
              placeholder={__('e.g. 200.00 (min total value required per order)')}
              className="h-9 rounded-md"
            />
          </div>

          <div className="border-base-border flex items-center justify-between rounded-md border p-3">
            <span className="text-base-secondary text-sm font-medium">
              {__('Apply wholesale discounts to sale prices')}
            </span>
            <Switch size="md" />
          </div>
        </div>

        <SheetFooter className="p-0">
          <div className="flex justify-end border-t border-[#E5E7EB] bg-white p-5">
            <SheetClose asChild>
              <Button
                variant="outline"
                className="border-base-border text-base-secondary border bg-white px-5 hover:bg-gray-50"
              >
                {__('Cancel')}
              </Button>
            </SheetClose>
            <Button className="bg-primary hover:bg-primary-accent ml-4 px-5 font-medium text-white">
              {__('Save changes')}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
