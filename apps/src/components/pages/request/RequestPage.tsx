import { __ } from '@wordpress/i18n';

import RequestList from './RequestsList';

export default function RolesPage() {
  return (
    <div className="mx-auto mt-[84px] max-w-7xl space-y-6 px-6">
      <RequestList />
    </div>
  );
}
