import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { RegistrationFieldsItem } from './RegistrationFieldsItem';

type RegistrationFieldsListProps = {
  fields: { id: string }[];
  onEdit: (index: number) => void;
  onMove: (oldIndex: number, newIndex: number) => void;
};

export function RegistrationFieldsList({ fields, onEdit, onMove }: RegistrationFieldsListProps) {
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over?.id);
      onMove(oldIndex, newIndex);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
          {fields.map((field, index) => (
            <RegistrationFieldsItem key={field.id} fieldId={field.id} index={index} onEdit={onEdit} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
}
