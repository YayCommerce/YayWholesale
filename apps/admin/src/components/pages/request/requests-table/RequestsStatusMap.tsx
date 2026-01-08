import { __ } from '@wordpress/i18n';

import RequestStatusIcon from '@/components/icons/RequestStatusIcon';

const requestsStatusMap = {
  approved: {
    icon: <RequestStatusIcon status="approved" className="min-h-4 min-w-4" strokeWidth={2} />,
    text: __('Approved', 'yay-wholesale'),
    border: 'border-input',
    textColor: 'text-foreground',
  },
  pending: {
    icon: <RequestStatusIcon status="pending" className="min-h-4 min-w-4" strokeWidth={2} />,
    text: __('Pending', 'yay-wholesale'),
    border: 'border-input',
    textColor: 'text-foreground',
  },
  rejected: {
    icon: <RequestStatusIcon status="rejected" className="min-h-4 min-w-4" strokeWidth={2} />,
    text: __('Rejected', 'yay-wholesale'),
    border: 'border-input',
    textColor: 'text-foreground',
  },
};

export default requestsStatusMap;
