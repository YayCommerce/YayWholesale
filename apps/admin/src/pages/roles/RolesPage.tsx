import { __ } from '@wordpress/i18n';

import RoleForm from './RoleForm';
import RolesList from './RolesList';

export default function RolesPage() {
  return (
    <div className="mx-auto max-w-7xl px-6">
      <RolesList />
      <RoleForm />
    </div>
  );
}
