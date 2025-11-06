import { __ } from '@wordpress/i18n';
import { CheckCircle2, CircleSlash, Clock4 } from 'lucide-react';

import { RequestStatusValues } from '@/lib/schema/requests';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: RequestStatusValues;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusMap = {
    approved: {
      icon: <CheckCircle2 className="min-h-4 min-w-4" color="green" strokeWidth={2} />,
      text: __('Approved', 'yay-wholesale'),
      border: 'border-gray-200',
      textColor: 'text-gray-900',
    },
    pending: {
      icon: <Clock4 className="min-h-4 min-w-4" color="gray" strokeWidth={2} />,
      text: __('Pending', 'yay-wholesale'),
      border: 'border-gray-200',
      textColor: 'text-gray-900',
    },
    rejected: {
      icon: <CircleSlash className="min-h-4 min-w-4" color="red" strokeWidth={2} />,
      text: __('Rejected', 'yay-wholesale'),
      border: 'border-gray-200',
      textColor: 'text-gray-900',
    },
  };

  const { icon, text, border, textColor } = statusMap[status];

  return (
    <Badge
      variant="outline"
      className={`inline-flex h-[26px] items-center gap-2 rounded-md border ${border} bg-white text-sm font-semibold shadow-sm ${textColor} py-4`}
    >
      {icon}
      <span>{text}</span>
    </Badge>
  );
}
