import { useState } from 'react';
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import type { Settings } from '@/lib/schema/settings.schema';
import { FieldFormValues } from '@/lib/schema/settingsRegistration.schema';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import AddFieldForm from './FieldForm/AddFieldForm';
import EditFieldForm from './FieldForm/EditFieldForm';
import { RegistrationFieldsItem } from './RegistrationFieldsItem';
import { RegistrationFieldsPreview } from './RegistrationFieldsPreview/RegistrationFieldsPreview';

export default function RegistrationFieldsTab() {
  const [fieldSheetState, setFieldSheetState] = useState<FieldSheetState>(['closed']);
  const { control } = useFormContext<Settings>();
  const { fields, append, remove, move, update } = useFieldArray({ control, name: 'registration_fields.fields' });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over?.id);
      move(oldIndex, newIndex);
    }
  };

  const handleCheckedChange = (index: number, checked: boolean) => {
    const field = fields[index];

    update(index, {
      ...field,
      isHidden: !checked,
    });
  };

  const isAdding = fieldSheetState[0] === 'add';
  const isEditing = fieldSheetState[0] === 'edit';
  const editingIndex = isEditing ? fieldSheetState[1] : undefined;

  const closeSheet = () => {
    setFieldSheetState(['closed']);
  };

  const handleAddSave = (field: FieldFormValues) => {
    append(field);
    closeSheet();
  };

  const handleEditSave = (field: FieldFormValues) => {
    if (editingIndex === undefined) return;
    update(editingIndex, field);
    closeSheet();
  };

  const handleDelete = () => {
    if (editingIndex === undefined) return;
    remove(editingIndex);
    closeSheet();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto w-full max-w-360">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,424px)]">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg leading-none font-bold tracking-tight lg:text-2xl">
                {__('Registration Fields', 'yay-wholesale-b2b')}
              </h2>
              <Button variant="primary-outline-fill" onClick={() => setFieldSheetState(['add'])}>
                <Plus className="size-4" />
                <span>{__('Add New Field', 'yay-wholesale-b2b')}</span>
              </Button>
            </div>
            {/* Registration Fields List */}
            <div className="flex flex-col gap-3">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  {fields.map((field, index) => (
                    <RegistrationFieldsItem
                      key={field.id}
                      field={field}
                      index={index}
                      fieldId={field.id}
                      onCheckedChange={handleCheckedChange}
                      onClick={(index) => setFieldSheetState(['edit', index])}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
            {/* Registration Fields List */}
          </div>
          {/* Registration Fields Preview */}
          <div className="border-divider xl:sticky xl:top-4 xl:self-start xl:border-l xl:pl-6">
            <RegistrationFieldsPreview />
          </div>
          {/* Registration Fields List */}
        </div>
      </div>

      {/* Field Form */}
      <Sheet
        open={isAdding || isEditing}
        onOpenChange={(open) => {
          if (!open) {
            closeSheet();
          }
        }}
      >
        <SheetContent hasMargin>
          {isAdding && <AddFieldForm siblingFields={fields} onSave={handleAddSave} />}
          {isEditing && (
            <EditFieldForm
              field={fields[editingIndex!]}
              editingIndex={editingIndex!}
              siblingFields={fields}
              onSave={handleEditSave}
              onDelete={handleDelete}
            />
          )}
        </SheetContent>
      </Sheet>
      {/* Field Form */}
    </div>
  );
}

export type FieldSheetState = ['closed'] | ['add'] | ['edit', number];
