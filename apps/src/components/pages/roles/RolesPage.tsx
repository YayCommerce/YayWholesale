import { zodResolver } from '@hookform/resolvers/zod';
import { __ } from '@wordpress/i18n';
import { FormProvider, useForm, useFormContext } from 'react-hook-form';

import { RolesListFormData, rolesListSchema } from '@/lib/schema/roles';
import { getRoles } from '@/lib/utils';
import { Toaster } from '@/components/ui/sonner';

import RoleForm from './RoleForm';
import RolesList from './RolesList';

export default function RolesPage() {
  const form = useForm<RolesListFormData>({
    resolver: zodResolver(rolesListSchema),
    defaultValues: {
      roles: getRoles(),
    },
  });

  const onSubmit = (data: RolesListFormData) => {
    console.log({ data });
  };

  return (
    <FormProvider {...form}>
      <Toaster />
      <form id="roles-form" onSubmit={form.handleSubmit(onSubmit)}>
        <div className="mx-auto mt-[84px] max-w-7xl space-y-6 px-6">
          <RolesList />
          <RoleForm />
        </div>
      </form>
    </FormProvider>
  );
}
