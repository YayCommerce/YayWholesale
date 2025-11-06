import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { __ } from '@wordpress/i18n';
import { GripVertical, Trash2 } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { SettingsFormData } from '@/lib/schema';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export function FieldRow({
  field,
  index,
  update,
  remove,
}: {
  field: any;
  index: number;
  update: (index: number, value: any) => void;
  remove: (index: number) => void;
}) {
  const { control } = useFormContext<SettingsFormData>();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex flex-wrap items-end gap-4 border-b border-[#F4F4F7] p-4 transition-colors last:border-0 last:pb-0',
        isDragging && 'bg-[#F9FAFB]',
      )}
    >
      {/* Drag handle */}
      <div className="flex w-[32px] shrink-0 items-center justify-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="hover:text-foreground text-base-muted-foreground h-[36px] w-[18px] cursor-grab hover:bg-transparent active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex flex-1 flex-wrap gap-4">
        {/* Label */}
        <div className="min-w-[160px] flex-1">
          <FormField
            control={control}
            name={`registration_fields.fields.${index}.label`}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-base-secondary space-y-2.5 text-xs font-medium">
                  Label
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter field label"
                    defaultValue={field.value}
                    onChange={field.onChange}
                    className="bg-background h-9 w-full"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Type */}
        <div className="min-w-[160px] flex-1">
          <FormField
            control={control}
            name={`registration_fields.fields.${index}.type`}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-base-secondary space-y-2.5 text-xs font-medium">
                  Type
                </FormLabel>
                <FormControl>
                  <Select defaultValue={field.value} onValueChange={field.onChange}>
                    <SelectTrigger className="bg-background h-9 w-full rounded-sm text-sm font-normal">
                      <SelectValue placeholder="Select an option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="number">Number</SelectItem>
                      <SelectItem value="phone">Phone</SelectItem>
                      <SelectItem value="date">Date</SelectItem>
                      <SelectItem value="textarea">Textarea</SelectItem>
                      <SelectItem value="select">Select</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Placeholder */}
        <div className="min-w-[160px] flex-1">
          <FormField
            control={control}
            name={`registration_fields.fields.${index}.placeholder`}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-base-secondary space-y-2.5 text-xs font-medium">
                  Placeholder
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter placeholder"
                    defaultValue={field.value}
                    onChange={field.onChange}
                    className="bg-background h-9 w-full"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Column Width */}
        <div className="min-w-[160px] flex-1">
          <FormField
            control={control}
            name={`registration_fields.fields.${index}.columnWidth`}
            render={({ field }) => (
              <FormItem className="w-full">
                <FormLabel className="text-base-secondary space-y-2.5 text-xs font-medium">
                  Column Width
                </FormLabel>
                <FormControl>
                  <ToggleGroup
                    className="flex h-9 w-full gap-1 rounded-[6px] border border-[#E5E5E5] bg-white p-[3px]"
                    type="single"
                    value={field.value}
                    onValueChange={(val) => {
                      console.log('val', val);
                      if (val) field.onChange(val);
                    }}
                  >
                    <ToggleGroupItem className="size-xs" value="50%">
                      50%
                    </ToggleGroupItem>
                    <ToggleGroupItem className="size-xs" value="100%">
                      100%
                    </ToggleGroupItem>
                  </ToggleGroup>
                </FormControl>
              </FormItem>
            )}
          />
        </div>
      </div>

      {/* Delete w-[50px]  */}
      <div className="flex shrink-0 items-center justify-center">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            if (field.deletable) {
              remove(index);
            }
          }}
          className={cn(
            'h-9 w-9',
            field.deletable
              ? 'hover:bg-destructive/10 hover:text-destructive bg-muted/50 text-base-muted-foreground'
              : 'text-muted-foreground cursor-not-allowed opacity-40 hover:bg-transparent',
          )}
        >
          <Trash2 className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
}
