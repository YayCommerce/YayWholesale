import { __ } from '@wordpress/i18n';

import RequestsForm from './RequestsForm';
import RequestsList from './RequestsList';

export default function RequestsPage() {
  return (
    <div className="mx-auto mt-[28px] max-w-7xl px-6">
      <RequestsList />
      <RequestsForm />
    </div>
  );
}
