import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';

import { useActiveRolesQuery } from '@/lib/queries/roles';
import { useUpdateWholesalersRoleMutation } from '@/lib/queries/wholesalers';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import RolesIcon from '@/components/icons/RolesIcon';

export default function WholesalersRoleColumn({ role, userId }: { role: string; userId: number }) {
  const { data: roles } = useActiveRolesQuery();
  const { mutate: updateRole, isPending: isUpdatingRole } =
    useUpdateWholesalersRoleMutation(userId);

  const handleRoleChange = (roleKey: string) => {
    updateRole({ roleSlug: roleKey });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex w-45.5 items-center justify-between font-normal"
          disabled={isUpdatingRole}
        >
          <span className="flex gap-2 overflow-hidden">
            <RolesIcon role={role} className="mt-0.5 min-h-4 min-w-4" />
            {roles?.find((r) => r.slug === role)?.name ?? role}
          </span>
          <ChevronDown className="text-muted-foreground/70 h-6 w-6 cursor-pointer" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-45.5">
        <DropdownMenuGroup>
          {roles?.map((roleItem) => (
            <DropdownMenuItem
              key={roleItem.slug}
              disabled={roleItem.slug === role}
              onClick={() => roleItem.slug !== role && handleRoleChange(roleItem.slug)}
            >
              <RolesIcon role={roleItem.slug} className="mt-0.5 min-h-4 min-w-4" /> {roleItem.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
