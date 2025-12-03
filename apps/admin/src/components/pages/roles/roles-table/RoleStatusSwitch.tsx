import { useEffect, useState } from 'react';

import { useUpdateRoleStatusMutation } from '@/lib/queries/roles';
import { Switch } from '@/components/ui/switch';

export default function RoleStatusSwitch({ id, status }: { id: number; status: boolean }) {
  const { mutate: updateStatus, isPending } = useUpdateRoleStatusMutation(id);
  const [checked, setChecked] = useState(status);

  useEffect(() => {
    setChecked(status);
  }, [status]);

  const onToggle = (value: boolean) => {
    setChecked(value);
    updateStatus(value);
  };

  return <Switch size="md" checked={checked} onCheckedChange={onToggle} disabled={isPending} />;
}
