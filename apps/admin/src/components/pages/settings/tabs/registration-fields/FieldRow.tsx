import { useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { __ } from '@wordpress/i18n';
import { CirclePlus, Eye, EyeOff, GripVertical, Info, Trash2 } from 'lucide-react';
import { useFormContext } from 'react-hook-form';

import { SettingsFormData } from '@/lib/schema/settings';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { WholeSaleToolTip } from '@/components/custom/WholeSaleToolTip';
import EllipsisIcon from '@/components/icons/EllipsisIcon';

export function FieldRow({
  field,
  index,
  update,
  remove,
  append,
}: {
  field: any;
  index: number;
  update: (index: number, value: any) => void;
  remove: (index: number) => void;
  append: () => void;
}) {
  const { control, watch } = useFormContext<SettingsFormData>();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  const isRequired = watch(`registration_fields.fields.${index}.isRequired`);
  const isHidden = watch(`registration_fields.fields.${index}.isHidden`);

  const isDefault: boolean = useMemo(() => field.isDefault, [field]);

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
        {isHidden ? (
          <WholeSaleToolTip
            trigger={
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="hover:text-foreground text-muted-foreground h-[36px] w-[18px] cursor-grab hover:bg-transparent active:cursor-grabbing"
              >
                <EyeOff className="h-5 w-5 cursor-default" />
              </Button>
            }
            content={
              <div className="flex items-center gap-2">
                <Info className="mt-6/7 h-3.5 w-3.5" />
                {__('Field is hidden', 'yay-wholesale-b2b')}
              </div>
            }
          />
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="hover:text-foreground text-muted-foreground hover:bg-muted h-9 w-9 cursor-grab rounded-sm active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="h-5 w-5" />
          </Button>
        )}
      </div>

      <div className="flex flex-1 flex-wrap gap-4">
        {/* Label */}
        <div className="min-w-[160px] flex-1">
          <FormField
            control={control}
            name={`registration_fields.fields.${index}.label`}
            render={({ field, fieldState }) => (
              <FormItem className="flex w-full flex-col gap-2.5">
                <FormLabel className="text-foreground-400 text-xs font-medium">
                  {__('Label', 'yay-wholesale-b2b')}
                  {isRequired && <div className="text-destructive">*</div>}
                </FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    placeholder="Enter field label"
                    defaultValue={field.value}
                    onChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                    className="h-9 w-full"
                    disabled={isHidden}
                  />
                </FormControl>
                {fieldState.invalid && (
                  <div className="text-destructive text-[12px]">{fieldState.error?.message}</div>
                )}
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
              <FormItem className="flex w-full flex-col gap-2.5">
                <FormLabel className="text-foreground-400 text-xs font-medium">
                  {__('Type', 'yay-wholesale-b2b')}
                </FormLabel>
                <FormControl>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                    disabled={isDefault || isHidden}
                  >
                    <SelectTrigger className="bg-background h-9 w-full rounded-sm text-sm font-normal disabled:cursor-default">
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
              <FormItem className="flex w-full flex-col gap-2.5">
                <FormLabel className="text-foreground-400 text-xs font-medium">
                  {__('Placeholder', 'yay-wholesale-b2b')}
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter placeholder"
                    defaultValue={field.value}
                    onChange={field.onChange}
                    className="bg-background h-9 w-full"
                    disabled={isHidden}
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
              <FormItem className="flex w-full flex-col gap-2.5">
                <FormLabel className="text-foreground-400 text-xs font-medium">
                  {__('Column Width', 'yay-wholesale-b2b')}
                </FormLabel>
                <FormControl>
                  <ToggleGroup
                    className="border-input flex h-9 w-full gap-0.75 rounded-[8px] border bg-white p-[3px]"
                    type="single"
                    value={field.value}
                    onValueChange={(val) => {
                      if (val) field.onChange(val);
                    }}
                    disabled={isHidden}
                  >
                    <ToggleGroupItem className="size-xs rounded-[6px]" value="50%">
                      50%
                    </ToggleGroupItem>
                    <ToggleGroupItem className="size-xs rounded-[6px]" value="100%">
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isDefault} className="hover:bg-muted">
              <EllipsisIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 p-1" align="end">
            <DropdownMenuGroup>
              <FormField
                control={control}
                name={`registration_fields.fields.${index}.isRequired`}
                render={({ field }) => (
                  <div className="flex items-center justify-between p-2">
                    <Label>{__('Set as required', 'yay-wholesale-b2b')}</Label>
                    <Switch
                      className="translate-y-0.5 scale-70"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isHidden}
                    />
                  </div>
                )}
              />
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="mx-0.25 mt-1" />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={append} disabled={isHidden} className="mt-1">
                <CirclePlus className="translate-y-0.5" />
                {__('Add new field', 'yay-wholesale-b2b')}
              </DropdownMenuItem>
              <FormField
                control={control}
                name={`registration_fields.fields.${index}.isHidden`}
                render={({ field }) => (
                  <DropdownMenuItem
                    onClick={() => {
                      field.onChange(!field.value); // Toggle
                    }}
                    className="mt-1"
                  >
                    {isHidden ? (
                      <>
                        <Eye className="translate-y-0.5" />
                        {__('Show field', 'yay-wholesale-b2b')}
                      </>
                    ) : (
                      <>
                        <EyeOff className="translate-y-0.5" />
                        {__('Hide field', 'yay-wholesale-b2b')}
                      </>
                    )}
                  </DropdownMenuItem>
                )}
              />
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="mx-0.25 mt-1" />
            <DropdownMenuGroup>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => {
                  if (field.deletable) {
                    remove(index);
                  }
                }}
                disabled={field.isHidden || !field.deletable}
                className="mt-1"
              >
                <Trash2 />
                {__('Delete', 'yay-wholesale-b2b')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
