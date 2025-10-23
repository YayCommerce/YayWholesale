import { Button } from '@wordpress/components';
import { useMatch, useNavigate, useParams } from 'react-router-dom';

import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';

export default function RolesPage() {
  const isAddingRole = useMatch({ path: '/roles/new' }) !== null;
  const editRoleId = useParams().roleId;
  const navigate = useNavigate();

  const isSheetOpen = isAddingRole || editRoleId !== undefined;

  return (
    <div>
      <h2>Roles</h2>

      <Button onClick={() => navigate('/roles/new')}>Add Role</Button>
      <div>Roles List</div>

      <Sheet
        open={isSheetOpen}
        onOpenChange={(open) => {
          if (!open) {
            navigate('/roles');
          }
        }}
      >
        <SheetContent>
          {isAddingRole && 'New Role Form'}
          {editRoleId !== undefined && 'Edit Role Form'}
          {!isSheetOpen && 'Some Skeleton Loading'}
        </SheetContent>
      </Sheet>
    </div>
  );
}
