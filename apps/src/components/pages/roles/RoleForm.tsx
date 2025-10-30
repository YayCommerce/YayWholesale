import { useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { X } from 'lucide-react';
import { FormProvider, useForm } from 'react-hook-form';
import { useMatch, useNavigate, useParams } from 'react-router-dom';

import { useAddRoleMutation, useRoleQuery, useUpdateRoleMutation } from '@/lib/queries/roles';
import { createRoleSchema, RoleFormValues, roleSchema } from '@/lib/schema/roles';
import { Button } from '@/components/ui/button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { InputNumberCarets, InputNumberInput, InputNumberRoot } from '@/components/ui/input-number';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Toaster } from '@/components/ui/sonner';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export const DEFAULT_ROLE = {
  name: '',
  description: '',
  discount: undefined,
  minOrderQuantity: undefined,
  minOrderAmount: undefined,
  applyToSalePrice: false,
  status: true,
};

export default function RoleForm() {
  const params = useParams();
  const isAddingRole = useMatch({ path: '/roles/new' }) !== null;
  const editRoleId = params.roleId ? Number(params.roleId) : 0;

  const navigate = useNavigate();

  const { mutate: addRole, isPending: isAddingRolePending } = useAddRoleMutation();
  const { mutate: updateRole, isPending: isUpdatingRolePending } =
    useUpdateRoleMutation(editRoleId);

  // Use the custom hook to fetch role data and handle loading and error states
  const { data, isLoading: isLoadingRole, isError: isErrorRole } = useRoleQuery(editRoleId);

  const isSheetOpen = isAddingRole || editRoleId !== 0;

  const form = useForm<RoleFormValues>({
    resolver: zodResolver(isAddingRole ? createRoleSchema : roleSchema),
    mode: 'onChange',
    defaultValues: data ?? DEFAULT_ROLE,
  });

  const onError = (errors: any, event: any) => {
    console.log('errors', errors);
    console.log('event', event);
  };

  function onSubmit(data: RoleFormValues): void {
    if (isAddingRole) {
      addRole(data);
    } else {
      updateRole(data);
    }
  }

  useEffect(() => {
    if (isAddingRole) {
      form.reset(DEFAULT_ROLE);
    } else if (data) {
      form.reset(data);
    }
  }, [isAddingRole, data, form]);

  return (
    <FormProvider {...form}>
      <Toaster />
      <form
        id="role-form"
        onSubmit={form.handleSubmit(onSubmit, onError)}
        className="flex h-full flex-col"
      >
        <Sheet
          open={isSheetOpen}
          onOpenChange={(open) => {
            if (!open) navigate('/roles');
          }}
        >
          <SheetContent
            side="right"
            className="top-[32px] h-[calc(100%-32px)] w-full gap-0 overflow-x-auto pt-0 md:min-w-[490px]"
          >
            {(isLoadingRole || isErrorRole) && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
                <Spinner className="text-muted-foreground size-6 animate-spin" />
              </div>
            )}
            <SheetHeader className="border-border border-b p-5">
              <div className="flex items-start justify-between">
                <div>
                  <SheetTitle className="text-[18px] font-semibold text-[#151619]">
                    {isAddingRole ? __('Add New Role') : __('Edit Role')}
                  </SheetTitle>
                  <SheetDescription className="text-base-muted-foreground mt-[4px] text-sm leading-[20px] font-normal">
                    {__('Enter the information below to add a new wholesale user role')}
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
                name={`name`}
                render={({ field: { ref, ...field }, fieldState: { error } }) => (
                  <FormItem className="w-full gap-2.5">
                    <FormLabel className="text-base-secondary text-xs font-medium">
                      {__('Role Name')}
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder={__('e.g. Wholesale Customer')}
                        className={`h-9 rounded-md ${error ? 'border-destructive' : ''} focus-visible:ring-0`}
                      />
                    </FormControl>
                    {error && <FormMessage />}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`description`}
                render={({ field: { ref, ...field }, fieldState: { error } }) => (
                  <FormItem className="w-full gap-2.5">
                    <FormLabel className="text-base-secondary text-xs font-medium">
                      {__('Role description')}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder={__('Enter a wholesale role description')}
                        className="h-24 rounded-md"
                      />
                    </FormControl>
                    {error && <FormMessage>{error.message}</FormMessage>}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`discount`}
                render={({ field: { ref, ...field }, fieldState: { error } }) => (
                  <FormItem className="w-full gap-2.5">
                    <FormLabel className="text-base-secondary text-xs font-medium">
                      {__('Discount')}
                    </FormLabel>
                    <FormControl>
                      <InputNumberRoot
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                        min={0}
                        max={100}
                      >
                        <InputNumberInput
                          placeholder={__('Enter a percentage discount')}
                          className={`h-9 w-full ${error ? 'border-destructive' : ''} `}
                        />
                        <InputNumberCarets />
                      </InputNumberRoot>
                    </FormControl>
                    {error && <FormMessage />}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`minOrderQuantity`}
                render={({ field: { ref, ...field }, fieldState: { error } }) => (
                  <FormItem className="w-full gap-2.5">
                    <FormLabel className="text-base-secondary text-xs font-medium">
                      {__('Min Order Quantity')}
                    </FormLabel>
                    <FormControl>
                      <InputNumberRoot
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                        min={0}
                      >
                        <InputNumberInput
                          placeholder={__('e.g. 10 (min number of items required per order)')}
                          className={`h-9 w-full ${error ? 'border-destructive' : ''} `}
                        />
                        <InputNumberCarets />
                      </InputNumberRoot>
                    </FormControl>
                    {error && <FormMessage />}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`minOrderAmount`}
                render={({ field: { ref, ...field }, fieldState: { error } }) => (
                  <FormItem className="w-full gap-2.5">
                    <FormLabel className="text-base-secondary text-xs font-medium">
                      {__('Min Order Amount')}
                    </FormLabel>
                    <FormControl>
                      <InputNumberRoot
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                        min={0}
                        decimalScale={window.yayWholesale.currency_data.num_decimals ?? 2}
                      >
                        <InputNumberInput
                          placeholder={__('e.g. 200.00 (min total value required per order)')}
                          className={`h-9 w-full ${error ? 'border-destructive' : ''} `}
                        />
                        <InputNumberCarets />
                      </InputNumberRoot>
                    </FormControl>
                    {error && <FormMessage>{error.message}</FormMessage>}
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name={`applyToSalePrice`}
                render={({ field: { ref, ...field }, fieldState: { error } }) => (
                  <FormItem className="w-full gap-2.5">
                    <FormControl>
                      <div className="border-base-border flex items-center justify-between rounded-md border p-3">
                        <span className="text-base-secondary text-sm font-medium">
                          {__('Apply wholesale discounts to sale prices')}
                        </span>
                        <Switch size="md" checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                    </FormControl>
                    {error && <FormMessage>{error.message}</FormMessage>}
                  </FormItem>
                )}
              />
            </div>

            <SheetFooter className="p-0">
              <div className="flex justify-end gap-4 border-t border-[#E5E7EB] bg-white p-5">
                <SheetClose asChild>
                  <Button
                    variant="outline"
                    className="border-base-border text-base-secondary border bg-white px-5 hover:bg-gray-50"
                  >
                    {__('Cancel')}
                  </Button>
                </SheetClose>
                <Button
                  type="submit"
                  form="role-form"
                  className="bg-primary hover:bg-primary-accent px-5 font-medium text-white"
                  disabled={isAddingRolePending || isUpdatingRolePending}
                >
                  {isAddingRole ? __('Add Role') : __('Save changes')}
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </form>
    </FormProvider>
  );
}
