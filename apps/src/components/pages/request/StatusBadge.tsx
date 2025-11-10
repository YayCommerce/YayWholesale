import { __ } from '@wordpress/i18n';
import { CheckCircle2, CircleSlash, Clock4 } from 'lucide-react';

import { RequestStatusValues } from '@/lib/schema/requests';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: RequestStatusValues;
}
export const statusMap = {
  approved: {
    icon: (isSmallIcon: boolean) => (
      <CheckCircle2
        className={cn('min-h-4 min-w-4', isSmallIcon ? 'h-4 w-4' : '')}
        color="green"
        strokeWidth={2}
      />
    ),
    text: __('Approved', 'yay-wholesale'),
    border: 'border-gray-200',
    textColor: 'text-gray-900',
  },
  pending: {
    icon: (isSmallIcon: boolean) => (
      <Clock4
        className={cn('min-h-4 min-w-4', isSmallIcon ? 'h-4 w-4' : '')}
        color="gray"
        strokeWidth={2}
      />
    ),
    text: __('Pending', 'yay-wholesale'),
    border: 'border-gray-200',
    textColor: 'text-gray-900',
  },
  rejected: {
    icon: (isSmallIcon: boolean) => (
      <CircleSlash
        className={cn('min-h-4 min-w-4', isSmallIcon ? 'h-4 w-4' : '')}
        color="red"
        strokeWidth={2}
      />
    ),
    text: __('Rejected', 'yay-wholesale'),
    border: 'border-gray-200',
    textColor: 'text-gray-900',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { icon, text, border, textColor } = statusMap[status];

  return (
    <Badge
      variant="outline"
      className={`inline-flex h-[26px] items-center gap-2 rounded-md border ${border} bg-white text-sm font-semibold shadow-sm ${textColor} py-4`}
    >
      {icon(false)}
      <span>{text}</span>
    </Badge>
  );
}
