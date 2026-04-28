import { RequestFormValues } from '@/lib/schema/requests';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

import requestsStatusMap from './requests-table/RequestsStatusMap';

interface StatusBadgeProps {
  status: RequestFormValues['status'];
}
export function StatusBadge({ status }: StatusBadgeProps) {
  const { icon, text, textColor } = requestsStatusMap[status];

  return (
    <Badge
      variant="outline"
      className={cn('h-[26px] gap-2 rounded-md border text-sm font-semibold shadow-sm', textColor)}
    >
      {icon}
      <span>{text}</span>
    </Badge>
  );
}
