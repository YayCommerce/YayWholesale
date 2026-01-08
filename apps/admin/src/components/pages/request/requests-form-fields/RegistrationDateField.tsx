import { useEffect, useState } from 'react';
import { __ } from '@wordpress/i18n';
import dayjs from 'dayjs';
import { Calendar as CalendarIcon } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

import { parseWPDate, parseWPTimeForInput } from '../../common.helper';

export default function RegistrationDateField() {
  const form = useFormContext();
  return (
    <FormField
      control={form.control}
      name="date"
      render={({ field, fieldState: { error } }) => {
        const [date, setDate] = useState('');

        const [time, setTime] = useState('');

        const [open, setOpen] = useState(false);

        const parseDate = (date: string) => {
          if (dayjs(date).isValid()) {
            var res = parseWPDate(date);
          } else {
            res = '';
          }

          return res;
        };

        useEffect(() => {
          setDate(parseDate(field.value));
          setTime(parseWPTimeForInput(field.value));
        }, [field.value]);

        return (
          <FormItem className="w-full gap-2.5">
            <FormLabel className="text-foreground-400 text-xs font-medium">
              {__('Registration Date', 'yay-wholesale')}
            </FormLabel>
            <div className="flex gap-3">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex w-2/3 justify-between font-normal hover:border-black"
                  >
                    {date}
                    <CalendarIcon className="cursor-pointer" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent
                  className="w-auto overflow-hidden p-0"
                  align="center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Calendar
                    mode="single"
                    selected={new Date(field.value)}
                    captionLayout="dropdown"
                    onSelect={(date) => {
                      field.onChange(dayjs(date).format('YYYY-MM-DD') + ' ' + time);
                      setOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>

              <Input
                type="time"
                id="ywhs-time-picker"
                step="1"
                value={time}
                className="bg-background appearance-none [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-calendar-picker-indicator]:appearance-none"
                onChange={(e) => {
                  field.onChange(dayjs(date).format('YYYY-MM-DD') + ' ' + e.target.value);
                }}
              />
            </div>

            {error && <FormMessage>{error.message}</FormMessage>}
          </FormItem>
        );
      }}
    />
  );
}
