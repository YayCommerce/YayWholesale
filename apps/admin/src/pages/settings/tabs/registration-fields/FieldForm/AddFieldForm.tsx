import { zodResolver } from '@hookform/resolvers/zod';
import { FormProvider, useForm } from 'react-hook-form';
import { v4 as uuidv4 } from 'uuid';
import { __ } from '@wordpress/i18n';

import { createFieldFormSchema, FieldFormValues } from '@/lib/schema/settingsRegistration.schema';
import { Button } from '@/components/ui/button';
import { SheetClose, SheetFooter, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { EMPTY_FORM_VALUES } from '../registration-fields.helper';
import FieldFormContent from './FieldFormContent';

interface AddFieldFormProps {
  siblingFields: FieldFormValues[];
  onSave: (data: FieldFormValues) => void;
}

const makeDefaultField = (): FieldFormValues => {
  const uuid = uuidv4();
  return {
    ...EMPTY_FORM_VALUES,
    label: '',
    inputName: `custom_field_${uuid}`,
    type: 'text',
    placeholder: '',
    columnWidth: '50%',
    isRequired: false,
    isHidden: false,
    billingMapping: '',
    customBillingMetaKey: '',
  };
};

export default function AddFieldForm({ siblingFields, onSave }: AddFieldFormProps) {
  const form = useForm<FieldFormValues>({
    resolver: zodResolver(createFieldFormSchema(siblingFields)),
    mode: 'onChange',
    defaultValues: makeDefaultField(),
  });

  const onSubmit = (field: FieldFormValues) => {
    onSave(field);
  };

  return (
    <FormProvider {...form}>
      <SheetHeader>
        <div className="flex items-start justify-between">
          <SheetTitle>{__('Add New Field', 'yay-wholesale-b2b')}</SheetTitle>
        </div>
      </SheetHeader>

      <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
        <FieldFormContent />
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
