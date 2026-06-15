import { useMemo } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { __ } from '@wordpress/i18n';

import { getErrorMsg } from '@/lib/helpers/response.helper';
import { useAddRoleMutation, useIsMutatingRoles } from '@/lib/queries/roles.queries';
import { useSettingsQuery } from '@/lib/queries/settings.queries';
import { roleFormSchema, RoleFormValues } from '@/lib/schema/roles.schema';
import { Button } from '@/components/ui/button';
import { SheetClose, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { toast } from '@/components/ui/sonner';
import { makeDefaultAddRole } from '@/pages/roles/roles.helper';
import { makeDefaultSettings } from '@/pages/settings/settings.helper';
import RoleFormContent from './RoleFormContent';

export default function AddRoleForm() {
  const navigate = useNavigate();

  const addRoleMutation = useAddRoleMutation();
  const isMutating = useIsMutatingRoles();
  const { data: settings } = useSettingsQuery();

  const defaultValues = useMemo(() => {
    const handledSettings = makeDefaultSettings(settings);
    return makeDefaultAddRole(handledSettings);
  }, [settings]);

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(roleFormSchema),
    mode: 'onChange',
    defaultValues,
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
