import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Trash } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import type { PromotionRuleFormValues } from '@/lib/schema/promotion.schema';
import { promotionRuleSchema } from '@/lib/schema/promotion.schema';
import { Role } from '@/lib/schema/roles.schema';
import { Button } from '@/components/ui/button';
import { SheetClose, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { DeletePromotionRuleDialog } from '../PromotionRuleForm/DeletePromotionRuleDialog';
import PromotionRuleFormContent from './PromotionRuleFormContent';

interface EditPromotionRuleFormProps {
  promotionRule: PromotionRuleFormValues;
  activeRoles: Role[];
  onSave: (promotionRule: PromotionRuleFormValues) => void;
  onDelete: () => void;
}

export default function EditPromotionRuleForm({
  promotionRule,
  activeRoles,
  onSave,
  onDelete,
}: EditPromotionRuleFormProps) {
  const form = useForm<PromotionRuleFormValues>({
    resolver: zodResolver(promotionRuleSchema),
    mode: 'onChange',
    defaultValues: promotionRule,
  });

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const onSubmit = (promotionRule: PromotionRuleFormValues) => {
    onSave(promotionRule);
  };

  useEffect(() => {
    form.reset(promotionRule);
  }, [promotionRule, form]);

  return (
    <FormProvider {...form}>
      <SheetHeader>
        <div className="flex items-start justify-between">
          <SheetTitle>{__('Edit Promotion Rule', 'yay-wholesale-b2b')}</SheetTitle>
        </div>
      </SheetHeader>
      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
        <PromotionRuleFormContent roles={activeRoles} />
      </div>
      <SheetFooter className="shrink-0 border-t px-5 py-4">
        <div className="flex w-full items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => setDeleteDialogOpen(true)}
            className="shrink-0"
          >
            <Trash className="size-4" />
          </Button>
          <div className="ms-auto flex gap-4">
            <SheetClose asChild>
              <Button variant="outline">{__('Cancel', 'yay-wholesale-b2b')}</Button>
            </SheetClose>
            <Button type="button" onClick={form.handleSubmit(onSubmit)}>
              {__('Apply', 'yay-wholesale-b2b')}
            </Button>
          </div>
        </div>
      </SheetFooter>
      {/* Delete Promotion Rule Dialog */}
      <DeletePromotionRuleDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirmDelete={() => {
          onDelete();
          setDeleteDialogOpen(false);
        }}
      />
      {/* Delete Promotion Rule Dialog */}
    </FormProvider>
  );
}
