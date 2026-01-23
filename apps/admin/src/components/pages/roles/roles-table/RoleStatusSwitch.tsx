import { useState } from 'react';

import { useUpdateRoleStatusMutation } from '@/lib/queries/roles';
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
  const { mutate: updateStatus, isPending } = useUpdateRoleStatusMutation(id);
  const [checked, setChecked] = useState(status);

  // useEffect(() => {
  //   setChecked(status);
  // }, [status]);

  const onToggle = (value: boolean) => {
    setChecked(value);
    updateStatus(value);
  };

  return (
    <Switch
      loading={isPending}
      checked={checked}
      onCheckedChange={onToggle}
      disabled={isPending || isDefault}
    />
  );
}
