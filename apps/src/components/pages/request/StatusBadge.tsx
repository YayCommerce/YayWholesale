import { __ } from '@wordpress/i18n';
import { CheckCircle2, CircleSlash, Clock4 } from 'lucide-react';

import { RequestFormValues } from '@/lib/schema/requests';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: RequestFormValues['status'];
}
export const statusMap = {
  approved: {
    icon: (isSmallIcon: boolean) => (
      <CheckCircle2
        className={cn('text-success min-h-4 min-w-4', isSmallIcon ? 'h-4 w-4' : '')}
        strokeWidth={2}
      />
    ),
    text: __('Approved', 'yay-wholesale'),
    border: 'border-muted',
    textColor: 'text-foreground',
  },
  pending: {
    icon: (isSmallIcon: boolean) => (
      <Clock4
        className={cn('text-muted-foreground min-h-4 min-w-4', isSmallIcon ? 'h-4 w-4' : '')}
        strokeWidth={2}
      />
    ),
    text: __('Pending', 'yay-wholesale'),
    border: 'border-muted',
    textColor: 'text-foreground',
  },
  rejected: {
    icon: (isSmallIcon: boolean) => (
      <CircleSlash
        className={cn('text-destructive min-h-4 min-w-4', isSmallIcon ? 'h-4 w-4' : '')}
        strokeWidth={2}
      />
    ),
    text: __('Rejected', 'yay-wholesale'),
    border: 'border-muted',
    textColor: 'text-foreground',
  },
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const { icon, text, textColor } = statusMap[status];

  return (
    <Badge
      variant="outline"
      className={cn('h-[26px] gap-2 rounded-md border text-sm font-semibold shadow-sm', textColor)}
    >
      {icon(false)}
      <span>{text}</span>
    </Badge>
  );
}
