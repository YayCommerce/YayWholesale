import { useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { CirclePlus, Eye, EyeOff, GripVertical } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import type { Settings } from '@/lib/schema/settings.schema';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { WholeSaleToolTip } from '@/components/ui/custom/WholeSaleToolTip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import DeleteIcon from '@/components/icons/DeleteIcon';
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
  const { control, watch } = useFormContext<Settings>();
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
                className="hover:text-foreground text-muted-foreground h-9 w-9 hover:bg-transparent"
              >
                <EyeOff className="h-5 w-5 cursor-default" />
              </Button>
            }
            content={<span>{__('Field is hidden', 'yay-wholesale-b2b')}</span>}
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
          <Controller
            control={control}
            name={`registration_fields.fields.${index}.label`}
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel>
                  {__('Label', 'yay-wholesale-b2b')}
                  {isRequired && <div className="text-destructive">*</div>}
                </FieldLabel>
                <FieldContent>
                  <Input
                    {...field}
                    placeholder="Enter field label"
                    value={field.value}
                    onChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                    disabled={isHidden}
                  />
                </FieldContent>
                {fieldState.error && (
                  <FieldError
                    errors={[
                      {
                        message: fieldState.error.message,
                      },
                    ]}
                  />
                )}
              </Field>
            )}
          />
        </div>

        {/* Type */}
        <div className="min-w-[160px] flex-1">
          <Controller
            control={control}
            name={`registration_fields.fields.${index}.type`}
            render={({ field }) => (
              <Field>
                <FieldLabel>{__('Type', 'yay-wholesale-b2b')}</FieldLabel>
                <FieldContent>
                  <Select value={field.value} onValueChange={field.onChange} disabled={isDefault || isHidden}>
                    <SelectTrigger className="w-full rounded-sm">
                      <SelectValue placeholder={__('Select an option', 'yay-wholesale-b2b')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">{__('Text', 'yay-wholesale-b2b')}</SelectItem>
                      <SelectItem value="email">{__('Email', 'yay-wholesale-b2b')}</SelectItem>
                      <SelectItem value="number">{__('Number', 'yay-wholesale-b2b')}</SelectItem>
                      <SelectItem value="phone">{__('Phone', 'yay-wholesale-b2b')}</SelectItem>
                      <SelectItem value="date">{__('Date', 'yay-wholesale-b2b')}</SelectItem>
                      <SelectItem value="textarea">{__('Textarea', 'yay-wholesale-b2b')}</SelectItem>
                      {/* <SelectItem value="select">Select</SelectItem> */}
                    </SelectContent>
                  </Select>
                </FieldContent>
              </Field>
            )}
          />
        </div>

        {/* Placeholder */}
        <div className="min-w-[160px] flex-1">
          <Controller
            control={control}
            name={`registration_fields.fields.${index}.placeholder`}
            render={({ field }) => (
              <Field>
                <FieldLabel>{__('Placeholder', 'yay-wholesale-b2b')}</FieldLabel>
                <FieldContent>
                  <Input
                    placeholder="Enter placeholder"
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isHidden}
                  />
                </FieldContent>
              </Field>
            )}
          />
        </div>

        {/* Column Width */}
        <div className="min-w-[160px] flex-1">
          <Controller
            control={control}
            name={`registration_fields.fields.${index}.columnWidth`}
            render={({ field }) => (
              <Field>
                <FieldLabel>{__('Column Width', 'yay-wholesale-b2b')}</FieldLabel>
                <FieldContent>
                  <ToggleGroup
                    className="border-border h-9 w-full gap-0.75 border bg-white p-0.75"
                    type="single"
                    value={field.value}
                    onValueChange={(val) => {
                      if (val) field.onChange(val);
                    }}
                    disabled={isHidden}
                  >
                    <ToggleGroupItem value="50%">50%</ToggleGroupItem>
                    <ToggleGroupItem value="100%">100%</ToggleGroupItem>
                  </ToggleGroup>
                </FieldContent>
              </Field>
            )}
          />
        </div>
      </div>

      {/* Delete w-[50px]  */}
      <div className="flex shrink-0 items-center justify-center">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" disabled={isDefault}>
              <EllipsisIcon />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-48 p-1" align="end">
            <DropdownMenuGroup>
              <Controller
                control={control}
                name={`registration_fields.fields.${index}.isRequired`}
                render={({ field }) => (
                  <div className="flex items-center justify-between p-2">
                    <Label>{__('Set as required', 'yay-wholesale-b2b')}</Label>
                    <Switch
                      className="scale-70"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isHidden}
                    />
                  </div>
                )}
              />
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="mx-0.25" />
            <DropdownMenuGroup>
              <DropdownMenuItem onClick={append} disabled={isHidden} className="mt-1">
                <CirclePlus />
                {__('Add new field', 'yay-wholesale-b2b')}
              </DropdownMenuItem>
              <Controller
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
                        <Eye />
                        {__('Show field', 'yay-wholesale-b2b')}
                      </>
                    ) : (
                      <>
                        <EyeOff />
                        {__('Hide field', 'yay-wholesale-b2b')}
                      </>
                    )}
                  </DropdownMenuItem>
                )}
              />
            </DropdownMenuGroup>
            <DropdownMenuSeparator className="mx-0.25" />
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
                <DeleteIcon />
                {__('Delete', 'yay-wholesale-b2b')}
              </DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
