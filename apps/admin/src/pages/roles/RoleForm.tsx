import { useMatch, useNavigate, useParams } from 'react-router';

import { useRoleQuery } from '@/lib/queries/roles.queries';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import AddRoleForm from './RoleForm/AddRoleForm';
import EditRoleForm from './RoleForm/EditRoleForm';

export default function RoleForm() {
  const { roleSlug: paramRoleId } = useParams();
  const isAdding = useMatch({ path: '/roles/new' }) !== null;
  const isEditing = useMatch({ path: '/roles/edit/:roleSlug' }) !== null;

  const navigate = useNavigate();
  const { data: editingRole } = useRoleQuery(paramRoleId ?? '');

  const isSheetOpen = isAdding || (isEditing && editingRole !== null);

  return (
    <Sheet
      open={isSheetOpen}
      onOpenChange={(open) => {
        if (!open) navigate('/roles');
      }}
    >
      <SheetContent hasMargin>
        {isAdding && <AddRoleForm />}
        {isEditing && editingRole !== null && <EditRoleForm role={editingRole} />}
      </SheetContent>
    </Sheet>
  );
}
