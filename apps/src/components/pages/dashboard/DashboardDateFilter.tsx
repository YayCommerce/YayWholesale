import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function DashboardDateFilter() {
  return (
    <div className="flex items-center space-x-2">
      <Button
        variant="outline"
        className="flex items-center gap-2 rounded-md border bg-white text-sm font-normal text-gray-700 shadow-sm"
      >
        <CalendarIcon />
        Jan 20, 2023 – Feb 09, 2023
      </Button>
    </div>
  );
}
