import { Dispatch, FC, SetStateAction, useMemo, useState } from 'react';
import { PopoverClose } from '@radix-ui/react-popover';
import { CalendarIcon, ChevronDown } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { __ } from '@wordpress/i18n';

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
    () => parseWPDate(dateRange?.from?.toDateString()) + ' - ' + parseWPDate(dateRange?.to?.toDateString()),
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
    <div className="z-1 flex items-center">
      <Popover open={openPopover} onOpenChange={(open) => onClose(open)}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="text-foreground flex h-9 min-w-67.5 justify-between bg-white px-1.5! pl-2! shadow-xs not-last:ms-2 not-last:me-2"
          >
            <div className="mr-4 flex items-center gap-2">
              <CalendarIcon />
              {displayDateRange}
            </div>
            <ChevronDown className="text-muted-foreground/70 h-6 w-6 cursor-pointer" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="h-fit w-fit px-1 sm:-translate-x-5 lg:-translate-x-6" align="start">
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
                {__('Close', 'yay-wholesale-b2b')}
              </Button>
            </PopoverClose>
            <Button className="px-3" onClick={saveChanges}>
              {__('Update Report', 'yay-wholesale-b2b')}
            </Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DashboardDatePicker;
