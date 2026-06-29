import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useFormContext, useWatch } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import type { Settings } from '@/lib/schema/settings.schema';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';

type RegistrationFieldsItemProps = {
  fieldId: string;
  index: number;
  onEdit: (index: number) => void;
};

export function RegistrationFieldsItem({ fieldId, index, onEdit }: RegistrationFieldsItemProps) {
  const { control, getValues, setValue } = useFormContext<Settings>();
  const fieldPath = `registration_fields.fields.${index}` as const;
  const field = useWatch({ control, name: fieldPath });

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: fieldId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isHidden = field?.isHidden ?? false;

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
        <span className={cn('truncate text-sm font-medium', isHidden && 'text-muted-foreground line-through')}>
          {field?.label || __('Untitled field', 'yay-wholesale-b2b')}
        </span>
      </div>

      <div onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
        <Switch
          size="sm"
          checked={!isHidden}
          onCheckedChange={(checked) => {
            const current = getValues(fieldPath);
            setValue(fieldPath, { ...current, isHidden: !checked }, { shouldDirty: true });
          }}
          aria-label={__('Enabled status', 'yay-wholesale-b2b')}
        />
      </div>
    </div>
  );
}
