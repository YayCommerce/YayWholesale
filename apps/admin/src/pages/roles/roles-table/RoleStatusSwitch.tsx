import { useEffect, useState } from 'react';

import { useUpdateRoleStatusMutation } from '@/lib/queries/roles.queries';
import { Switch } from '@/components/ui/switch';

export default function RoleStatusSwitch({
  id,
  status,
  isDefault,
}: {
  id: number;
  status: boolean;
  isDefault: boolean;
}) {
  const { mutateAsync: updateStatus, isPending } = useUpdateRoleStatusMutation(id);
  const [checked, setChecked] = useState(status);

  useEffect(() => {
    setChecked(status);
  }, [status]);

  const onToggle = async (value: boolean) => {
    if (isPending) return;
    setChecked(value);
    try {
      await updateStatus(value);
    } catch (error) {
      setChecked(!value);
    }
  };

  return <Switch loading={isPending} checked={checked} onCheckedChange={onToggle} disabled={isDefault} />;
}
