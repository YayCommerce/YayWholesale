import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';

import { getErrorMsg } from '@/lib/helpers/response.helper';
import { useAddRoleMutation, useIsMutatingRoles } from '@/lib/queries/roles.queries';
import { RoleFormValues, roleSchema } from '@/lib/schema/roles.schema';
import { Button } from '@/components/ui/button';
import { SheetClose, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from '@/components/ui/sonner';
import RoleFormContent from './RoleFormContent';

export default function AddRoleForm() {
  const navigate = useNavigate();

  const addRoleMutation = useAddRoleMutation();
  const isMutating = useIsMutatingRoles();

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleSchema),
    mode: 'onChange',
    defaultValues: DEFAULT_ROLE,
  });

  async function onSubmit(data: RoleFormValues) {
    if (isMutating) return;

    try {
      await addRoleMutation.mutateAsync(data);
      toast.success(__('Role added successfully', 'yay-wholesale-b2b'));
      navigate('/roles');
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  }

  return (
    <FormProvider {...form}>
      <form
        id="role-form"
        onSubmit={form.handleSubmit(onSubmit, (err) => console.log(err))}
        className="flex h-full flex-col"
      >
        <SheetHeader>
          <div className="flex items-start justify-between">
            <SheetTitle>{__('Add New Role', 'yay-wholesale-b2b')}</SheetTitle>
          </div>
        </SheetHeader>

        <RoleFormContent />

        <SheetFooter className="p-0">
          <div className="border-divider flex justify-end gap-4 border-t bg-white p-5">
            <SheetClose asChild>
              <Button variant="outline">{__('Cancel', 'yay-wholesale-b2b')}</Button>
            </SheetClose>
            <Button type="submit" form="role-form" variant="primary">
              {__('Add Role', 'yay-wholesale-b2b')}
            </Button>
          </div>
        </SheetFooter>
      </form>
    </FormProvider>
  );
}

const DEFAULT_ROLE: RoleFormValues = {
  name: '',
  description: '',
  discount: 0,
  minOrderQuantity: 0,
  minOrderAmount: 0,
  applyToSalePrice: false,
  status: true,
};
