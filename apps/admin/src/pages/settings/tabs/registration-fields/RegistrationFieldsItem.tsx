import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, MapPinIcon } from 'lucide-react';
import { FieldArrayWithId, useController, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { Settings } from '@/lib/schema/settings.schema';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { getBillingMappingLabel } from './registration-fields.helper';

interface RegistrationFieldsItemProps {
  index: number;
  registrationField: FieldArrayWithId<Settings, 'registration_fields.fields'>;
  onEdit: () => void;
}

export function RegistrationFieldsItem({ index, registrationField, onEdit }: RegistrationFieldsItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: registrationField.id,
  });

  const { control } = useFormContext<Settings>();

  const { field: hiddenField } = useController({
    control,
    name: `registration_fields.fields.${index}.isHidden`,
  });

  const stopPropagation = (e: React.PointerEvent | React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }} // for dnd-kit
      className={cn(
        'group bg-background flex items-center gap-2.5 rounded-md border py-2.5 pr-5 pl-4 transition-shadow',
        isDragging && 'z-10 opacity-60 shadow-md',
        !isDragging && 'hover:shadow-xs',
      )}
      onClick={onEdit}
    >
      <div
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground flex h-9 w-3.5 cursor-grab items-center justify-center active:cursor-grabbing"
      >
        <GripVertical className="size-5" />
      </div>

      <div className="flex w-full flex-1 flex-col items-start gap-1 text-left">
        <span className={cn('truncate text-sm font-medium', hiddenField.value && 'text-muted-foreground line-through')}>
          {registrationField.label} {registrationField.isRequired && <Badge variant="outline">Required</Badge>}
        </span>

        <div className="text-muted-foreground flex items-center gap-2 text-xs">
          <span>{registrationField.type[0].toUpperCase() + registrationField.type.slice(1)} field</span>
          {registrationField.billingMapping && registrationField.billingMapping !== 'none' && (
            <span className="flex items-center gap-0.5">
              <MapPinIcon className="size-2.5" />
              {__('Mapping:', 'yay-wholesale-b2b')}
              {registrationField.billingMapping != 'custom'
                ? ` ${getBillingMappingLabel(registrationField.billingMapping)}`
                : ` ${registrationField.customBillingMetaKey} ${__('[custom]', 'yay-wholesale-b2b')}`}{' '}
              {__('billing', 'yay-wholesale-b2b')}
            </span>
          )}
        </div>
      </div>

      <div onPointerDown={stopPropagation} onClick={stopPropagation}>
        <Switch
          size="sm"
          checked={!hiddenField.value}
          onCheckedChange={(checked) => hiddenField.onChange(!checked)}
          aria-label={__('Enabled status', 'yay-wholesale-b2b')}
        />
      </div>
    </div>
  );
}
