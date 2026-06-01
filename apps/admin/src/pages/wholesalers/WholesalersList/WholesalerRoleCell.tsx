import { SelectGroup } from '@radix-ui/react-select';

import { getErrorMsg } from '@/lib/helpers/response.helper';
import { useActiveRolesQuery } from '@/lib/queries/roles.queries';
import { useIsMutatingWholesalers, useUpdateWholesalersRoleMutation } from '@/lib/queries/wholesalers.queries';
import { Wholesaler } from '@/lib/schema/wholesalers.type';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/sonner';
import RolesIcon from '@/components/icons/RolesIcon';

export function WholesalerRoleCell({ wholesaler }: { wholesaler: Wholesaler }) {
  const { wholesaleRoleSlug, id: userId } = wholesaler;
  const { data: roles } = useActiveRolesQuery();

  const updateWholesalersRoleMutation = useUpdateWholesalersRoleMutation(userId);
  const isMutating = useIsMutatingWholesalers();

  async function handleChangeRole(roleKey: string) {
    if (isMutating) return;

    try {
      await updateWholesalersRoleMutation.mutateAsync(roleKey);
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  }

  return (
    <Select value={wholesaleRoleSlug} onValueChange={handleChangeRole}>
      <SelectTrigger className="hover:bg-accent w-45.5">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {roles?.map((roleItem) => (
            <SelectItem key={roleItem.id} value={roleItem.slug}>
              <RolesIcon role={roleItem.slug} className="mt-0.5 min-h-4 min-w-4" />{' '}
              <span className="truncate">{roleItem.name}</span>
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
