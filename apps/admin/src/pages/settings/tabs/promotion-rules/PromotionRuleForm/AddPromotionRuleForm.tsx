import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import type { PromotionRuleFormValues } from '@/lib/schema/promotion.schema';
import { promotionRuleSchema } from '@/lib/schema/promotion.schema';
import { Button } from '@/components/ui/button';
import { SheetClose, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import PromotionRuleFormContent from './PromotionRuleFormContent';

interface AddPromotionRuleFormProps {
  onSave: (promotionRule: PromotionRuleFormValues) => void;
}

const makeDefaultPromotionRule = (): PromotionRuleFormValues => {
  return {
    title: '',
    enableStatus: true,
    fromRoles: {
      retailers: 'enabled',
      wholesalers: 'enabled',
      selected_roles: [],
    },
    newRole: ['retailers', ''],
    condition: 'total-spend-at-least',
    conditionAmount: 0,
  };
};

export default function AddPromotionRuleForm({ onSave }: AddPromotionRuleFormProps) {
  const form = useForm<PromotionRuleFormValues>({
    resolver: zodResolver(promotionRuleSchema),
    mode: 'onChange',
    defaultValues: makeDefaultPromotionRule(),
  });

  const onSubmit = (promotionRule: PromotionRuleFormValues) => {
    console.log({ promotionRule });
    onSave(promotionRule);
  };

  return (
    <FormProvider {...form}>
      <SheetHeader>
        <div className="flex items-start justify-between">
          <SheetTitle>{__('Add New Rule', 'yay-wholesale-b2b')}</SheetTitle>
        </div>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
        <PromotionRuleFormContent />
      </div>

      <SheetFooter className="shrink-0 border-t px-5 py-4">
        <div className="flex w-full items-center justify-between gap-3">
          <span className="hidden sm:block" />
          <div className="ms-auto flex gap-4">
            <SheetClose asChild>
              <Button variant="outline">{__('Cancel', 'yay-wholesale-b2b')}</Button>
            </SheetClose>

            <Button type="button" onClick={form.handleSubmit(onSubmit)}>
              {__('Create New', 'yay-wholesale-b2b')}
            </Button>
          </div>
        </div>
      </SheetFooter>
    </FormProvider>
  );
}
