import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { __ } from '@wordpress/i18n';

import { getErrorMsg } from '@/lib/helpers/response.helper';
import { useAddRoleMutation, useIsMutatingRoles } from '@/lib/queries/roles.queries';
import { RoleFormValues, roleSchema } from '@/lib/schema/roles.schema';
import { Button } from '@/components/ui/button';
import {
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
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
        <SheetContent
          side="right"
          className="overflow-x-auto md:m-2.5 md:h-[calc(100%-52px)] md:min-w-[490px] md:rounded-md"
        >
          <SheetHeader>
            <div className="flex items-start justify-between">
              <div>
                <SheetTitle className="text-foreground text-[18px] font-semibold">
                  {__('Add New Role', 'yay-wholesale-b2b')}
                </SheetTitle>
                <SheetDescription className="text-muted-foreground mt-[4px] text-sm leading-[20px] font-normal">
                  {__('Enter the information below to add a new wholesale user role', 'yay-wholesale-b2b')}
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
                {__('Add Role', 'yay-wholesale-b2b')}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
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
