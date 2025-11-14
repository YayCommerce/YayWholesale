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
import { FormField } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';

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
    append({
      id: uuidv4(),
      label: '',
      type: 'text',
      placeholder: '',
      columnWidth: '50%',
      deletable: true,
      isDefault: false,
      isRequired: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Toggle: Use default form */}
      <FormField
        control={control}
        name="registration_fields.useDefaultForm"
        render={({ field }) => (
          <div className="base-base-border flex items-center justify-between rounded-md border p-4">
            <div>
              <h2 className="text-base-secondary text-sm font-normal">
                {__('Use default registration form')}
              </h2>
              <p className="text-base-muted-foreground mt-1 text-xs font-normal">
                {__('Turn on to switch to default registration form.')}
              </p>
            </div>
            <Switch size="md" checked={field.value} onCheckedChange={field.onChange} />
          </div>
        )}
      />

      {/* Custom Fields */}
      <div>
        <h3 className="mb-4 text-base font-medium text-[#000000]">
          {__('Custom Registration Fields')}
        </h3>
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
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {/* Add new field */}
              <div className="flex justify-center py-6">
                <Button
                  variant="outline"
                  onClick={addNewField}
                  className="border-primary rounded-1.5 text-primary hover:bg-primary/10 gap-2 p-3 text-sm font-medium"
                >
                  <Plus className="h-4 w-4" />
                  {__('Add New Field')}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
