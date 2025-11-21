import { RequestFormValues } from '@/lib/schema/requests';
import { cn } from '@/lib/utils';

import RequestsApprovedIcon from './RequestsApprovedIcon';
import RequestsPendingIcon from './RequestsPendingIcon';
import RequestsRejectedIcon from './RequestsRejectedIcon';

export default function RequestsStatusIcon({ status = 'pending', className = '', ...props }) {
  switch (status) {
    case 'pending':
      return <RequestsPendingIcon className={className} {...props} />;
    case 'approved':
      return <RequestsApprovedIcon className={className} {...props} />;
    case 'rejected':
      return <RequestsRejectedIcon className={className} {...props} />;
    default:
      return <div></div>;
  }
}
