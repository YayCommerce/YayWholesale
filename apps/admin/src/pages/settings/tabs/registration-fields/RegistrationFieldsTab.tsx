import { useState } from 'react';
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import type { Settings } from '@/lib/schema/settings.schema';
import { Button } from '@/components/ui/button';
import { FieldCard } from './FieldCard';
import { FieldEditorForm } from './FieldEditorForm';
import { createDefaultField, type RegistrationField } from './registration-fields.helpers';
import { RegistrationFieldsPreview } from './RegistrationFieldsPreview';

type EditorState =
  | { mode: 'add'; field: RegistrationField }
  | { mode: 'edit'; index: number; field: RegistrationField }
  | null;

export default function RegistrationFieldsTab() {
  const { control, getValues } = useFormContext<Settings>();
  const [editorState, setEditorState] = useState<EditorState>(null);
  const [previewDraft, setPreviewDraft] = useState<RegistrationField | null>(null);

  const { fields, append, remove, move, update } = useFieldArray({
    control,
    name: 'registration_fields.fields',
  });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over?.id);
      move(oldIndex, newIndex);
    }
  };

  const openAddDialog = () => {
    const field = createDefaultField(fields.length);
    setPreviewDraft(field);
    setEditorState({
      mode: 'add',
      field,
    });
  };

  const openEditDialog = (index: number) => {
    const field = getValues(`registration_fields.fields.${index}`);
    const draft = { ...field };
    setPreviewDraft(draft);
    setEditorState({
      mode: 'edit',
      index,
      field: draft,
    });
  };

  const handleSave = (field: RegistrationField) => {
    if (editorState?.mode === 'add') {
      append(field);
      return;
    }

    if (editorState?.mode === 'edit') {
      update(editorState.index, field);
    }
  };

  const handleDelete = () => {
    if (editorState?.mode !== 'edit') return;
    if (window.confirm(__('Are you sure you want to delete this field?', 'yay-wholesale-b2b'))) {
      remove(editorState.index);
      setEditorState(null);
      setPreviewDraft(null);
    }
  };

  const previewOverride =
    editorState && previewDraft
      ? editorState.mode === 'add'
        ? { mode: 'add' as const, field: previewDraft }
        : { mode: 'edit' as const, index: editorState.index, field: previewDraft }
      : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto w-full max-w-360">
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,424px)]">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg leading-none font-bold tracking-tight lg:text-2xl">
                {__('Registration Fields', 'yay-wholesale-b2b')}
              </h2>
              <Button variant="outline" onClick={openAddDialog}>
                <Plus className="size-4" />
                <span>{__('Add New Field', 'yay-wholesale-b2b')}</span>
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                  {fields.map((field, index) => (
                    <FieldCard key={field.id} field={field} index={index} onEdit={openEditDialog} />
                  ))}
                </SortableContext>
              </DndContext>
            </div>
          </div>

          <div className="border-divider xl:sticky xl:top-4 xl:self-start xl:border-l xl:pl-6">
            <RegistrationFieldsPreview previewOverride={previewOverride} />
          </div>
        </div>
      </div>
      {editorState && (
        <FieldEditorForm
          open={!!editorState}
          onOpenChange={(open) => {
            if (!open) {
              setEditorState(null);
              setPreviewDraft(null);
            }
          }}
          mode={editorState.mode}
          initialField={editorState.field}
          onSave={handleSave}
          onDraftChange={setPreviewDraft}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
