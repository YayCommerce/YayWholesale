import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { Controller, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import type { Settings } from '@/lib/schema/settings.schema';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import type { RegistrationField } from './registration-fields.helpers';

type FieldCardProps = {
  field: RegistrationField;
  index: number;
  onEdit: (index: number) => void;
};

export function FieldCard({ field, index, onEdit }: FieldCardProps) {
  const { control } = useFormContext<Settings>();

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group bg-background flex items-center gap-4 rounded-md border py-2.5 pr-5 pl-4 transition-shadow',
        isDragging && 'z-10 opacity-60 shadow-md',
        !isDragging && 'hover:shadow-xs',
      )}
      onClick={() => onEdit(index)}
    >
      <div
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground flex h-9 w-3.5 cursor-grab items-center justify-center active:cursor-grabbing"
      >
        <GripVertical className="size-5" />
      </div>

      <div className="flex w-full flex-1 items-center gap-2 text-left">
        <span className={cn('truncate text-sm font-medium', field.isHidden && 'text-muted-foreground line-through')}>
          {field.label || __('Untitled field', 'yay-wholesale-b2b')}
        </span>
      </div>

      <Controller
        control={control}
        name={`registration_fields.fields.${index}.isHidden`}
        render={({ field: hiddenField }) => (
          <div onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
            <Switch
              size="sm"
              checked={!hiddenField.value}
              onCheckedChange={(checked) => hiddenField.onChange(!checked)}
              aria-label={__('Enabled status', 'yay-wholesale-b2b')}
            />
          </div>
        )}
      />
    </div>
  );
}
