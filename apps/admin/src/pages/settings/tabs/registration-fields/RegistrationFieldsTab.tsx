import { useState } from 'react';
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { __ } from '@wordpress/i18n';
import { Plus } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';

import type { SettingsFormData } from '@/lib/schema/settings';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

import { FieldRow } from './FieldRow';

export default function RegistrationFieldsTab() {
  const { control } = useFormContext<SettingsFormData>();

  const { fields, append, remove, move, update } = useFieldArray({
    control,
    name: 'registration_fields.fields',
  });

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over?.id);
      move(oldIndex, newIndex);
    }
  };

  const addNewField = () => {
    const custom_field_index = fields.length - 3;
    append({
      id: uuidv4(),
      label: '',
      inputName: `custom_field_${custom_field_index}`,
      type: 'text',
      placeholder: '',
      columnWidth: '50%',
      deletable: true,
      isDefault: false,
      isRequired: false,
      isHidden: false,
    });
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Custom Fields */}
      <div className="flex items-center justify-between">
        <span className="text-foreground-400 text-2xl leading-[100%] font-bold tracking-[-2%]">
          {__('Registration Fields', 'yay-wholesale-b2b')}
        </span>
        {/* Add new field */}
        <Button
          variant="primary-outline"
          onClick={addNewField}
          className="rounded-1.5 hover:bg-primary hover:text-primary-foreground gap-0.25 p-3 shadow-xs"
        >
          <Plus className="h-4 w-4" />
          <span className="px-0.75">{__('Add New Field', 'yay-wholesale-b2b')}</span>
        </Button>
      </div>
      <Card className="m-0 rounded-md p-0 shadow-none">
        <CardContent className="w-full overflow-x-auto px-0">
          <div
            className="relative"
            style={{
              overflow: 'hidden',
            }}
          >
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
              autoScroll={false}
            >
              <SortableContext
                items={fields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                {fields.map((field, index) => (
                  <FieldRow
                    key={field.id}
                    field={field}
                    index={index}
                    update={update}
                    remove={remove}
                    append={addNewField}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
