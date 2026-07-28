import { useState } from 'react';
import { closestCenter, DndContext, DragEndEvent, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { __ } from '@wordpress/i18n';

import { useActiveRolesQuery } from '@/lib/queries/roles.queries';
import type { PromotionRuleFormValues } from '@/lib/schema/promotion.schema';
import type { Settings } from '@/lib/schema/settings.schema';
import { isPro } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { UpgradeToProOverlay } from '@/components/ui/custom/upgrate-to-pro';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import AddPromotionRuleForm from './PromotionRuleForm/AddPromotionRuleForm';
import EditPromotionRuleForm from './PromotionRuleForm/EditPromotionRuleForm';
import PromotionRulesItem from './PromotionRulesItem';

export default function PromotionRulesTab() {
  const { control } = useFormContext<Settings>();
  const { fields, append, remove, move, update } = useFieldArray({ control, name: 'promotion_rules.promotionRules' });
  const [promotionRuleSheetState, setPromotionRuleSheetState] = useState<PromotionRuleSheetState>(['closed']);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  const navigate = useNavigate();

  const isAdding = promotionRuleSheetState[0] === 'add';
  const isEditing = promotionRuleSheetState[0] === 'edit';
  const editingIndex = isEditing ? promotionRuleSheetState[1] : undefined;

  const { data: activeRoles } = useActiveRolesQuery();

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (active.id !== over?.id) {
      const oldIndex = fields.findIndex((f) => f.id === active.id);
      const newIndex = fields.findIndex((f) => f.id === over?.id);
      move(oldIndex, newIndex);
    }
  };

  const handleCheckedChange = (index: number, checked: boolean) => {
    const promotionRule = fields[index];
    update(index, {
      ...promotionRule,
      enableStatus: checked,
    });
  };

  const closeSheet = () => {
    setPromotionRuleSheetState(['closed']);
  };

  const handleAddSave = (promotionRule: PromotionRuleFormValues) => {
    append(promotionRule);
    closeSheet();
  };

  const handleEditSave = (promotionRule: PromotionRuleFormValues) => {
    if (editingIndex === undefined) return;
    update(editingIndex, promotionRule);
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
        <div className="grid grid-cols-1 gap-6">
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-2">
                <h2 className="text-lg leading-none font-bold tracking-tight lg:text-2xl">
                  {__('Promotion Rules', 'yay-wholesale-b2b')}
                </h2>
                <p className="text-muted-foreground text-[14px] font-normal">
                  {__('Customers are automatically promoted when they meet the conditions below.', 'yay-wholesale-b2b')}
                </p>
              </div>
              {isPro && (
                <Button variant="outline" onClick={() => setPromotionRuleSheetState(['add'])}>
                  <Plus className="size-4" />
                  <span>{__('Add New Rule', 'yay-wholesale-b2b')}</span>
                </Button>
              )}
            </div>
            {/* Promotion Rules List */}
            {isPro ? (
              <>
                <div className="flex flex-col gap-2.5">
                  {fields.length === 0 && (
                    <p className="text-muted-foreground text-sm font-normal">
                      {__('No promotion rules found.', 'yay-wholesale-b2b')}
                    </p>
                  )}
                  <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                    <SortableContext items={fields.map((f) => f.id)} strategy={verticalListSortingStrategy}>
                      {fields.map((promotionRule, index) => (
                        <PromotionRulesItem
                          key={promotionRule.id}
                          promotionRule={promotionRule}
                          index={index}
                          promotionRuleId={promotionRule.id}
                          activeRoles={activeRoles}
                          onCheckedChange={handleCheckedChange}
                          onClick={() => setPromotionRuleSheetState(['edit', index])}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>
                </div>
                <div className="text-muted-foreground text-sm font-normal">
                  {__('To add new roles or edit existing ones, go to', 'yay-wholesale-b2b')}
                  <Button className="p-1.5 font-normal underline" variant="link" onClick={() => navigate('/roles')}>
                    {__('Manage Roles', 'yay-wholesale-b2b')}
                  </Button>
                </div>
              </>
            ) : (
              <UpgradeToProOverlay />
            )}
          </div>
        </div>
      </div>
      {/* Promotion Rule Form */}
      <Sheet
        open={isAdding || isEditing}
        onOpenChange={(open) => {
          if (!open) {
            closeSheet();
          }
        }}
      >
        <SheetContent hasMargin>
          {isAdding && <AddPromotionRuleForm onSave={handleAddSave} />}
          {isEditing && (
            <EditPromotionRuleForm
              promotionRule={fields[editingIndex!]}
              onSave={handleEditSave}
              onDelete={handleDelete}
            />
          )}
        </SheetContent>
      </Sheet>
      {/* Promotion Rule Form */}
    </div>
  );
}

export type PromotionRuleSheetState = ['closed'] | ['add'] | ['edit', number];
