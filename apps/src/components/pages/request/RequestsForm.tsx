import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { X } from 'lucide-react';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import { useUpdateEffect } from 'react-use';
import { Toaster } from 'sonner';

import { useRequestQuery, useUpdateRequestMutation } from '@/lib/queries/requests';
import { RequestFormValues, RequestSchema } from '@/lib/schema/requests';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';

import { parseWPDate, parseWPTime } from '../common.helper';
import RegistrationDateField from './request-form-fields/RegistrationDateField';
import StatusRadioField from './request-form-fields/StatusRadioField';

export const DEFAULT_REQUEST: RequestFormValues = {
  id: -1,
  name: '',
  email: '',
  message: '',
  status: 'pending',
  date: '',
  avatar: '',
  fields: [],
};

export default function RequestsForm() {
  const params = useParams();
  const editRequestId = params.requestId ? Number(params.requestId) : 0;

  const navigate = useNavigate();
  const isOpen = editRequestId !== 0;

  const {
    data,
    isLoading: isLoadingRequest,
    isError: isErrorRequest,
  } = useRequestQuery(editRequestId);

  const { mutate: updateRequest, isPending: isUpdatingRequestPending } =
    useUpdateRequestMutation(editRequestId);

  const form = useForm<RequestFormValues>({
    resolver: zodResolver(RequestSchema),
    defaultValues: data ?? DEFAULT_REQUEST,
  });

  const { fields } = useFieldArray({
    control: form.control,
    name: 'fields',
  });

  function onSubmit(data: RequestFormValues) {
    console.log(data);
    updateRequest(data);
  }

  const onError = (errors: any, event: any) => {
    console.log('errors', errors);
    console.log('event', event);
  };

  useUpdateEffect(() => {
    if (data) form.reset(data);
  }, [data]);

  return (
    <FormProvider {...form}>
      <Toaster />
      <form
        id="ywhs-request-form"
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="flex h-full flex-col"
      >
        <Sheet
          open={isOpen}
          onOpenChange={(open) => {
            if (!open) navigate('/request');
          }}
        >
          <SheetContent
            side="right"
            className="top-[32px] h-[calc(100%-32px)] w-full gap-0 pt-0 md:min-w-[490px]"
          >
            {(isLoadingRequest || isErrorRequest) && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
                <Spinner className="text-muted-foreground size-6 animate-spin" />
              </div>
            )}
            <SheetHeader className="border-border border-b p-5">
              <div className="flex items-start justify-between">
                <div>
                  <SheetTitle className="text-[18px] font-semibold text-[#151619]">
                    {form.watch('name')}
                  </SheetTitle>
                  <SheetDescription className="text-base-muted-foreground mt-[4px] text-sm leading-[20px] font-normal">
                    {__(
                      "Enter the information below to edit this user's wholesale user request",
                      'yay-wholesale',
                    )}
                  </SheetDescription>
                </div>
                <SheetClose asChild>
                  <button className="mt-1 text-[#67708066] hover:text-[#677080]">
                    <X className="h-5 w-5" />
                  </button>
                </SheetClose>
              </div>
            </SheetHeader>

            <div className="grid gap-5 overflow-auto p-5">
              <FormField
                control={form.control}
                name={'name'}
                render={({ field, fieldState: { error } }) => (
                  <FormItem className="w-full gap-2.5">
                    <FormLabel className="text-base-secondary text-xs font-medium">
                      {__('Name')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder={__('e.g. Wholesale Customer')}
                        className={`h-9 rounded-md ${error ? 'border-destructive' : ''} focus-visible:ring-0`}
                      />
                    </FormControl>
                    {error && <FormMessage>{error.message}</FormMessage>}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={'email'}
                render={({ field, fieldState: { error } }) => (
                  <FormItem className="w-full gap-2.5">
                    <FormLabel className="text-base-secondary text-xs font-medium">
                      {__('Email')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder={__('e.g. abc@yay-wholesale.com')}
                        className={`h-9 rounded-md ${error ? 'border-destructive' : ''} focus-visible:ring-0`}
                      />
                    </FormControl>
                    {error && <FormMessage>{error.message}</FormMessage>}
                  </FormItem>
                )}
              />

              <RegistrationDateField />

              <FormField
                control={form.control}
                name={'message'}
                render={({ field, fieldState: { error } }) => (
                  <FormItem className="w-full gap-2.5">
                    <FormLabel className="text-base-secondary text-xs font-medium">
                      {__('Message')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        value={field.value ?? ''}
                        placeholder={__('Wholesaler message')}
                        className={`h-fit rounded-md ${error ? 'border-destructive' : ''} hover:border-black focus-visible:ring-0`}
                      />
                    </FormControl>
                    {error && <FormMessage>{error.message}</FormMessage>}
                  </FormItem>
                )}
              />

              <dl className="divide-y divide-black/10">
                {fields.map((field, index) => {
                  const handleDataByType = (value: string) => {
                    if (field.type.toLowerCase() == 'date') {
                      return parseWPDate(value);
                    }

                    if (field.type.toLowerCase() == 'time') {
                      return parseWPTime(value);
                    }

                    return value;
                  };
                  return (
                    <div key={index} className="px-4 py-6 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-0">
                      <dt className="text-base-secondary text-xs font-medium">{field.label}</dt>
                      <dd className="mt-1 text-sm/6 text-gray-400 sm:col-span-2 sm:mt-0">
                        {handleDataByType(field.value)}
                      </dd>
                    </div>
                  );
                })}
              </dl>

              <StatusRadioField />
            </div>

            <SheetFooter>
              <div className="flex justify-end gap-2 border-t border-[#E5E7EB] bg-white p-5">
                <SheetClose asChild>
                  <Button variant="outline" className="w-fit">
                    {__('Cancel', 'yay-wholesale')}
                  </Button>
                </SheetClose>
                <Button
                  type="submit"
                  form="ywhs-request-form"
                  className="w-fit"
                  disabled={isUpdatingRequestPending}
                >
                  {__('Save Change', 'yay-wholesale')}
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </form>
    </FormProvider>
  );
}
