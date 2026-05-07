import { getErrorMsg } from '@/lib/helpers/response.helper';
import { useUpdateRoleStatusMutation } from '@/lib/queries/roles.queries';
import { Role } from '@/lib/schema/roles.schema';
import { toast } from '@/components/ui/sonner';
import { Switch } from '@/components/ui/switch';
import { isDefaultRole } from '../roles.helper';

export default function RoleStatusSwitch({ role }: { role: Role }) {
  const updateRoleStatusMutation = useUpdateRoleStatusMutation(role.id);

  async function handleUpdateStatus(status: boolean) {
    if (updateRoleStatusMutation.isPending) return;

    try {
      await updateRoleStatusMutation.mutateAsync(status);
    } catch (error) {
      toast.error(await getErrorMsg(error));
    }
  }

  return (
    <Switch
      loading={updateRoleStatusMutation.isPending}
      checked={role.status}
      onCheckedChange={(checked) => handleUpdateStatus(checked)}
      disabled={isDefaultRole(role)}
    />
  );
}
