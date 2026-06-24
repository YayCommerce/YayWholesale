import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { useDidUpdate } from 'rooks';
import { __ } from '@wordpress/i18n';

import { getErrorMsg } from '@/lib/helpers/response.helper';
import { useIsMutatingRoles, useUpdateRoleMutation } from '@/lib/queries/roles.queries';
import { useSettingsQuery } from '@/lib/queries/settings.queries';
import { Role, roleFormSchema, RoleFormValues } from '@/lib/schema/roles.schema';
import { Button, LoadingButton } from '@/components/ui/button';
import { SheetClose, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from '@/components/ui/sonner';
import { makeDefaultEditRole } from '@/pages/roles/roles.helper';
import RoleFormContent from './RoleFormContent';

export default function EditRoleForm({ role }: { role: Role }) {
  const navigate = useNavigate();

  const updateRoleMutation = useUpdateRoleMutation(role.slug);
  const isMutating = useIsMutatingRoles();
  const { data: settings } = useSettingsQuery();

  const defaultValues = useMemo(() => makeDefaultEditRole(role, settings), [role, settings]);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
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

  useDidUpdate(() => {
    form.reset(defaultValues);
  }, [defaultValues, form]);

  return (
    <FormProvider {...form}>
      <form
        id="role-form"
        onSubmit={form.handleSubmit(onSubmit, (err) => console.log(err))}
        className="flex h-full flex-col"
      >
        <SheetHeader>
          <div className="flex items-start justify-between">
            <SheetTitle>{__('Edit Role', 'yay-wholesale-b2b')}</SheetTitle>
          </div>
        </SheetHeader>

        <RoleFormContent slug={role.slug} />

        <SheetFooter className="p-0">
          <div className="border-divider flex justify-end gap-4 border-t bg-white p-5">
            <SheetClose asChild>
              <Button variant="outline">{__('Cancel', 'yay-wholesale-b2b')}</Button>
            </SheetClose>
            <LoadingButton loading={updateRoleMutation.isPending} type="submit" form="role-form" variant="primary">
              {__('Save Changes', 'yay-wholesale-b2b')}
            </LoadingButton>
          </div>
        </SheetFooter>
      </form>
    </FormProvider>
  );
}
