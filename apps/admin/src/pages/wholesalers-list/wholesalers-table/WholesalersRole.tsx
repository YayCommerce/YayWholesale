import { useState } from 'react';
import { SelectGroup } from '@radix-ui/react-select';
import { useUpdateEffect } from 'react-use';

import { useActiveRolesQuery } from '@/lib/queries/roles';
import { useUpdateWholesalersRoleMutation } from '@/lib/queries/wholesalers';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import RolesIcon from '@/components/icons/RolesIcon';

export default function WholesalersRoleColumn({ role, userId }: { role: string; userId: number }) {
  const { data: roles } = useActiveRolesQuery();
  const { mutateAsync: updateRole, isPending: isUpdatingRole } = useUpdateWholesalersRoleMutation(userId);

  const [currentRole, setCurrentRole] = useState(roles?.find((r) => r.slug === role)?.slug);

  const handleRoleChange = async (roleKey: string) => {
    await updateRole({ roleSlug: roleKey });
    setCurrentRole(roleKey);
  };

  useUpdateEffect(() => {
    setCurrentRole(roles?.find((r) => r.slug === role)?.slug);
  }, [roles, role]);

  return (
    <Select value={currentRole} onValueChange={handleRoleChange}>
      <SelectTrigger
        disabled={isUpdatingRole}
        className="hover:bg-accent flex w-45.5 items-center justify-between gap-2 overflow-hidden bg-white font-normal"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {roles?.map((roleItem) => (
            <SelectItem key={roleItem.id} value={roleItem.slug}>
              <RolesIcon role={roleItem.slug} className="text-foreground-400 mt-0.5 min-h-4 min-w-4" />{' '}
              <span className="truncate">{roleItem.name}</span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
