import { useState } from 'react';
import { closestCenter, DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

interface FieldConfig {
  id: string;
  label: string;
  type: string;
  placeholder: string;
  columnWidth: '50%' | '100%';
  deletable?: boolean;
}

export default function RegistrationFieldsTab() {
  const [useDefaultForm, setUseDefaultForm] = useState(false);

  // Giả sử đây là option sẽ lưu (có thể gọi API saveOption(fields))
  const [fields, setFields] = useState<FieldConfig[]>([
    {
      id: '1',
      label: 'First Name',
      type: 'Text',
      placeholder: 'Enter First Name',
      columnWidth: '50%',
      deletable: true,
    },
    {
      id: '2',
      label: 'Last Name',
      type: 'Text',
      placeholder: 'Enter Last Name',
      columnWidth: '50%',
      deletable: true,
    },
    {
      id: '3',
      label: 'Email Address',
      type: 'Email',
      placeholder: 'Enter Email Address',
      columnWidth: '100%',
      deletable: false,
    },
    {
      id: '4',
      label: 'Message',
      type: 'Textarea',
      placeholder: 'Enter Message',
      columnWidth: '100%',
      deletable: true,
    },
  ]);

  const sensors = useSensors(useSensor(PointerSensor));

  // 🔁 handle reorder on drag end
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      setFields((prev) => {
        const oldIndex = prev.findIndex((f) => f.id === active.id);
        const newIndex = prev.findIndex((f) => f.id === over?.id);
        const newArr = arrayMove(prev, oldIndex, newIndex);
        // giả lập save
        console.log(
          '🧩 Saved new order:',
          newArr.map((f) => f.label),
        );
        return newArr;
      });
    }
  };

  const addNewField = () => {
    const newField: FieldConfig = {
      id: Date.now().toString(),
      label: '',
      type: 'Text',
      placeholder: '',
      columnWidth: '50%',
      deletable: true,
    };
    setFields([...fields, newField]);
  };

  const deleteField = (id: string) => {
    setFields(fields.filter((f) => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FieldConfig>) => {
    setFields(fields.map((f) => (f.id === id ? { ...f, ...updates } : f)));
  };

  return (
    <div className="space-y-6">
      {/* Default Form Toggle */}
      <div className="base-base-border flex items-center justify-between rounded-md border p-4">
        <div>
          <h2 className="text-base-secondary text-sm font-normal">Use default registration form</h2>
          <p className="text-base-muted-foreground mt-1 text-xs font-normal">
            Turn on to switch to default registration form.
          </p>
        </div>
        <Switch size="md" checked={useDefaultForm} onCheckedChange={setUseDefaultForm} />
      </div>

      {/* Custom Registration Fields Header */}
      <div>
        <h3 className="mb-4 text-base font-medium text-[#000000]">Custom Registration Fields</h3>
        <Card className="m-0 rounded-md px-4 py-5 shadow-none">
          <CardContent className="w-full overflow-x-auto px-0">
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={fields.map((f) => f.id)}
                strategy={verticalListSortingStrategy}
              >
                {fields.map((field) => (
                  <SortableFieldRow
                    key={field.id}
                    field={field}
                    updateField={updateField}
                    deleteField={deleteField}
                  />
                ))}
              </SortableContext>
            </DndContext>

            {/* Add new field */}
            <div className="mt-6 flex justify-center">
              <Button
                variant="outline"
                onClick={addNewField}
                className="border-primary text-primary hover:bg-primary/10 gap-2 bg-transparent"
              >
                <Plus className="h-4 w-4" />
                Add New Field
              </Button>
            </div>
          </CardContent>
        </Card>
        {/* <div className="rounded-xl border bg-white p-5 shadow-sm"> */}

        {/* </div> */}
      </div>
    </div>
  );
}

/* -------------------- Sortable Row -------------------- */
function SortableFieldRow({
  field,
  updateField,
  deleteField,
}: {
  field: FieldConfig;
  updateField: (id: string, updates: Partial<FieldConfig>) => void;
  deleteField: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: field.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-1 items-end gap-4 border-b border-dashed border-[#E5E5E5] pb-6 last:border-0 last:pb-0 md:grid-cols-[auto_2fr_1.5fr_2fr_1.5fr_auto]"
    >
      {/* Drag handle */}
      <div className="flex items-center justify-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:bg-muted hover:text-foreground h-[36px] w-[18px] cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </Button>
      </div>

      {/* Label */}
      <div className="space-y-2">
        <Label className="text-base-secondary text-xs font-medium">Label</Label>
        <Input
          placeholder="Enter field label"
          value={field.label}
          onChange={(e) => updateField(field.id, { label: e.target.value })}
          className="bg-background h-9 w-full"
        />
      </div>

      {/* Type */}
      <div className="space-y-2">
        <Label className="text-base-secondary text-xs font-medium">Type</Label>
        <Select value={field.type} onValueChange={(v) => updateField(field.id, { type: v })}>
          <SelectTrigger className="bg-background h-9 w-full text-sm font-normal">
            <SelectValue placeholder="Select type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Text">Text</SelectItem>
            <SelectItem value="Email">Email</SelectItem>
            <SelectItem value="Number">Number</SelectItem>
            <SelectItem value="Phone">Phone</SelectItem>
            <SelectItem value="Date">Date</SelectItem>
            <SelectItem value="Textarea">Text area</SelectItem>
            <SelectItem value="Select">Select</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Placeholder */}
      <div className="space-y-2">
        <Label className="text-base-secondary text-xs font-medium">Placeholder</Label>
        <Input
          placeholder="Enter Placeholder"
          value={field.placeholder}
          onChange={(e) => updateField(field.id, { placeholder: e.target.value })}
          className="bg-background h-9 w-full text-sm font-normal"
        />
      </div>

      {/* Column Width */}
      <div className="space-y-2">
        <Label className="text-base-secondary text-xs font-medium">Column Width</Label>
        <div className="flex h-9 gap-1 rounded-lg border border-[#E5E5E5] bg-white p-[3px]">
          {['50%', '100%'].map((w) => (
            <button
              key={w}
              onClick={() => updateField(field.id, { columnWidth: w as '50%' | '100%' })}
              type="button"
              className={`flex-1 rounded-[6px] text-sm font-normal transition-colors ${
                field.columnWidth === w
                  ? 'text-base-secondary bg-[#F4F4F5]'
                  : 'text-[#677080] hover:bg-[#F4F4F5]'
              }`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Delete */}
      <div className="flex items-center justify-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => field.deletable && deleteField(field.id)}
          disabled={!field.deletable}
          className={`h-10 w-10 ${
            field.deletable
              ? 'text-muted-foreground hover:bg-destructive/10 hover:text-destructive'
              : 'text-muted-foreground cursor-not-allowed opacity-40'
          }`}
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
