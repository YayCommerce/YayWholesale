import { useMatch, useNavigate, useParams } from 'react-router-dom';

import { useRoleQuery } from '@/lib/queries/roles.queries';
import { Sheet } from '@/components/ui/sheet';
import AddRoleForm from './RoleForm/AddRoleForm';
import EditRoleForm from './RoleForm/EditRoleForm';

export default function RoleForm() {
  const { roleId: paramRoleId } = useParams();
  const isAdding = useMatch({ path: '/roles/new' }) !== null;
  const isEditing = useMatch({ path: '/roles/edit/:roleId' }) !== null;
  const roleId = paramRoleId ? Number(paramRoleId) : 0;

  const navigate = useNavigate();
  const { data: editingRole } = useRoleQuery(roleId);

  const isSheetOpen = isAdding || (isEditing && editingRole !== null);

  return (
    <Sheet
      open={isSheetOpen}
      onOpenChange={(open) => {
        if (!open) navigate('/roles');
      }}
    >
      {isAdding && <AddRoleForm />}
      {isEditing && editingRole !== null && <EditRoleForm role={editingRole} />}
    </Sheet>
  );
}
