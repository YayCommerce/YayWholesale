import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MapPinIcon } from 'lucide-react';
import { __ } from '@wordpress/i18n';

import type { Field } from '@/lib/schema/settingsRegistration.schema';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { getBillingMappingLabel } from './registration-fields.helper';

interface RegistrationFieldsItemProps {
  index: number;
  field: Field;
  fieldId: string; // use for dnd-kit
  onCheckedChange: (index: number, checked: boolean) => void;
  onClick: (index: number) => void;
}

export function RegistrationFieldsItem({
  index,
  field,
  fieldId,
  onCheckedChange,
  onClick,
}: RegistrationFieldsItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: fieldId,
  });

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }} // for dnd-kit
      className={cn(
        'group bg-background flex items-center gap-2.5 rounded-md border py-2.5 pr-5 pl-4 transition-shadow',
        isDragging && 'z-10 opacity-60 shadow-md',
        !isDragging && 'hover:shadow-xs',
      )}
      onClick={() => onClick(index)}
    >
      <div
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground flex h-9 w-3.5 cursor-grab items-center justify-center active:cursor-grabbing"
      >
        <GripVertical className="size-5" />
      </div>

      <div className="flex w-full flex-1 flex-col items-start gap-1 text-left">
        <span className={cn('truncate text-sm font-medium', field.isHidden && 'text-muted-foreground line-through')}>
          {field.label} {field.isRequired && <Badge variant="outline">Required</Badge>}
        </span>

        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <span>{field.type[0].toUpperCase() + field.type.slice(1)} field</span>
          {field.billingMapping !== '' && field.billingMapping !== 'none' && (
            <span className="flex items-center gap-0.5">
              <MapPinIcon className="size-2.5" />
              {__('Mapping:', 'yay-wholesale-b2b')}
              {field.billingMapping != 'custom'
                ? ` ${getBillingMappingLabel(field.billingMapping)}`
                : ` ${field.customBillingMetaKey} ${__('[custom]', 'yay-wholesale-b2b')}`}{' '}
              {__('billing', 'yay-wholesale-b2b')}
            </span>
          )}
        </div>
      </div>

      <div onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
        <Switch
          size="sm"
          checked={!field.isHidden}
          onCheckedChange={(checked) => {
            onCheckedChange(index, checked);
          }}
          aria-label={__('Enabled status', 'yay-wholesale-b2b')}
        />
      </div>
    </div>
  );
}
