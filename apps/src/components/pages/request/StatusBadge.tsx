import { Ban, CheckCircle2, RotateCcw } from 'lucide-react';

import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: 'approved' | 'pending' | 'rejected';
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const statusMap = {
    approved: {
      icon: <CheckCircle2 className="h-5 w-5 text-blue-600" strokeWidth={2} />,
      text: 'Approved',
      border: 'border-gray-200',
      textColor: 'text-gray-900',
    },
    pending: {
      icon: <Ban className="h-5 w-5 text-gray-500" strokeWidth={2} />,
      text: 'Pending',
      border: 'border-gray-200',
      textColor: 'text-gray-900',
    },
    rejected: {
      icon: <RotateCcw className="h-5 w-5 text-red-600" strokeWidth={2} />,
      text: 'Rejected',
      border: 'border-gray-200',
      textColor: 'text-gray-900',
    },
  };

  const { icon, text, border, textColor } = statusMap[status];

  return (
    <Badge
      variant="outline"
      className={`inline-flex h-[26px] items-center gap-2 rounded-md border ${border} bg-white text-sm font-semibold shadow-sm ${textColor}`}
    >
      {icon}
      <span>{text}</span>
    </Badge>
  );
}
