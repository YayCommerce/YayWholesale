import { Dispatch, FC, SetStateAction, useMemo, useState } from 'react';
import { PopoverClose } from '@radix-ui/react-popover';
import { __ } from '@wordpress/i18n';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

import { parseWPDate } from '../common.helper';

interface DashboardDatePickerProps {
  dateRange: DateRange | undefined;
  setDateRange: Dispatch<SetStateAction<DateRange | undefined>>;
}

const DashboardDatePicker: FC<DashboardDatePickerProps> = ({ dateRange, setDateRange }) => {
  const [previewDateRange, setPreviewDateRange] = useState<DateRange | undefined>(dateRange);
  const [openPopover, setOpenPopover] = useState(false);

  const displayDateRange = useMemo(
    () =>
      parseWPDate(dateRange?.from?.toDateString()) +
      ' - ' +
      parseWPDate(dateRange?.to?.toDateString()),
    [dateRange],
  );

  const saveChanges = () => {
    if (previewDateRange) {
      setDateRange(previewDateRange);
    } else {
      setPreviewDateRange(dateRange);
    }
    setOpenPopover(false);
  };

  const onClose = (open: boolean) => {
    if (!open) {
      setPreviewDateRange(dateRange);
    }
    setOpenPopover(open);
  };

  return (
    <div className="z-1 flex items-center space-x-2">
      <Popover open={openPopover} onOpenChange={(open) => onClose(open)}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="text-foreground flex h-8.5 min-w-71.5 items-center justify-between rounded-md border bg-white px-2.5! text-[14px] font-medium shadow-xs"
          >
            <div className="flex items-center gap-2">
              <CalendarIcon />
              {displayDateRange}
            </div>
            <ChevronDown className="pt-0.5" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="h-fit w-fit px-1 sm:-translate-x-5 lg:-translate-x-6"
          align="start"
        >
          <Calendar
            mode="range"
            defaultMonth={previewDateRange?.from}
            selected={previewDateRange}
            onSelect={setPreviewDateRange}
            numberOfMonths={2}
            disabled={{
              after: new Date(),
            }}
            className="hidden md:block"
          />
          <Calendar
            mode="range"
            defaultMonth={previewDateRange?.from}
            selected={previewDateRange}
            onSelect={setPreviewDateRange}
            numberOfMonths={1}
            disabled={{
              after: new Date(),
            }}
            className="block md:hidden"
          />
          <div className="px-4 pt-2">
            <Separator />
          </div>
          <div className="mt-4 flex justify-end gap-2 bg-white px-2">
            <PopoverClose asChild>
              <Button className="px-3" variant="outline">
                {__('Close', 'yay-wholesale')}
              </Button>
            </PopoverClose>
            <Button className="px-3" onClick={saveChanges}>
              {__('Update Report', 'yay-wholesale')}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DashboardDatePicker;
