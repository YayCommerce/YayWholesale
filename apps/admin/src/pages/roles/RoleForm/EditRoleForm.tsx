import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { useUpdateEffect } from 'react-use';
import { __ } from '@wordpress/i18n';

import { getErrorMsg } from '@/lib/helpers/response.helper';
import { useIsMutatingRoles, useUpdateRoleMutation } from '@/lib/queries/roles.queries';
import { Role, RoleFormValues, roleSchema } from '@/lib/schema/roles.schema';
import { Button } from '@/components/ui/button';
import { SheetClose, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from '@/components/ui/sonner';
import RoleFormContent from './RoleFormContent';

export default function EditRoleForm({ role }: { role: Role }) {
  const navigate = useNavigate();

  const updateRoleMutation = useUpdateRoleMutation(role.id);
  const isMutating = useIsMutatingRoles();

  const defaultValues = useMemo(() => {
    return {
      name: role.name,
      description: role.description,
      discount: role.discount,
      minOrderQuantity: role.minOrderQuantity,
      minOrderAmount: role.minOrderAmount,
      applyToSalePrice: role.applyToSalePrice,
      status: role.status,
    } satisfies RoleFormValues;
  }, [role]);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    mode: 'onChange',
    defaultValues,
  });

  async function onSubmit(data: RoleFormValues) {
    if (isMutating) return;

    try {
      await updateRoleMutation.mutateAsync(data);
      toast.success(__('Role updated successfully', 'yay-wholesale-b2b'));
      navigate('/roles');
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  }

  useUpdateEffect(() => {
    form.reset(defaultValues);
  }, [role, form]);

  return (
    <FormProvider {...form}>
      <form
        id="role-form"
        onSubmit={form.handleSubmit(onSubmit, (err) => console.log(err))}
        className="flex h-full flex-col"
      >
        <SheetHeader>
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-foreground text-[18px] font-semibold">
                {__('Edit Role', 'yay-wholesale-b2b')}
              </SheetTitle>
              <SheetDescription className="text-muted-foreground mt-[4px] text-sm leading-[20px] font-normal">
                {__('Enter the information below to edit wholesale user role', 'yay-wholesale-b2b')}
              </SheetDescription>
            </div>
          </div>
        </SheetHeader>

        <RoleFormContent />

        <SheetFooter className="p-0">
          <div className="border-divider flex justify-end gap-4 border-t bg-white p-5">
            <SheetClose asChild>
              <Button variant="outline" className="text-foreground-400 px-4.5">
                {__('Cancel', 'yay-wholesale-b2b')}
              </Button>
            </SheetClose>
            <Button type="submit" form="role-form" variant="primary" className="px-5">
              {__('Save Changes', 'yay-wholesale-b2b')}
            </Button>
          </div>
        </SheetFooter>
      </form>
    </FormProvider>
  );
}
