import { zodResolver } from '@hookform/resolvers/zod';
import { Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { Controller, FormProvider, useForm } from 'react-hook-form';
import { useMatch, useNavigate, useParams } from 'react-router-dom';
import { useUpdateEffect } from 'react-use';

import { useAddRoleMutation, useRoleQuery, useUpdateRoleMutation } from '@/lib/queries/roles';
import { createRoleSchema, RoleFormValues, roleSchema } from '@/lib/schema/roles';
import { isPro } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  NumberInput,
  NumberInputChevrons,
  NumberInputInput,
  NumberInputRoot,
  NumberInputUnit,
} from '@/components/ui/number-input';
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

export const DEFAULT_ROLE = {
  name: '',
  description: '',
  discount: 0,
  minOrderQuantity: 0,
  minOrderAmount: 0,
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

  useUpdateEffect(() => {
    if (isAddingRole) {
      form.reset(DEFAULT_ROLE);
    } else if (data) {
      form.reset(data);
    }
  }, [isAddingRole, data, form]);

  return (
    <FormProvider {...form}>
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
            className="overflow-x-auto md:m-2.5 md:h-[calc(100%-52px)] md:min-w-[490px] md:rounded-md"
          >
            {(isLoadingRole || isErrorRole) && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70">
                <Spinner className="text-muted-foreground size-6 animate-spin" />
              </div>
            )}
            <SheetHeader>
              <div className="flex items-start justify-between">
                <div>
                  <SheetTitle className="text-foreground text-[18px] font-semibold">
                    {isAddingRole
                      ? __('Add New Role', 'yay-wholesale-b2b')
                      : __('Edit Role', 'yay-wholesale-b2b')}
                  </SheetTitle>
                  <SheetDescription className="text-muted-foreground mt-[4px] text-sm leading-[20px] font-normal">
                    {__(
                      'Enter the information below to add a new wholesale user role',
                      'yay-wholesale-b2b',
                    )}
                  </SheetDescription>
                </div>
              </div>
            </SheetHeader>

            <div className="grid gap-5 overflow-auto p-5">
              <Controller
                control={form.control}
                name="name"
                render={({ field: { ref, ...field }, fieldState: { error, invalid } }) => (
                  <Field className="w-full gap-2.5">
                    <FieldLabel className="text-foreground-400 text-xs font-medium">
                      {__('Role Name', 'yay-wholesale-b2b')}
                    </FieldLabel>
                    <FieldContent>
                      <Input
                        {...field}
                        value={field.value ?? ''}
                        placeholder={__('Enter a wholesale role name', 'yay-wholesale-b2b')}
                        className="h-9 rounded-md"
                        aria-invalid={invalid}
                      />
                    </FieldContent>
                    {error && (
                      <FieldError
                        errors={[
                          {
                            message: error.message,
                          },
                        ]}
                      />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name={`description`}
                render={({ field: { ref, ...field }, fieldState: { error, invalid } }) => (
                  <Field className="w-full gap-2.5">
                    <FieldLabel className="text-foreground-400 text-xs font-medium">
                      {__('Role description', 'yay-wholesale-b2b')}
                    </FieldLabel>
                    <FieldContent>
                      <Textarea
                        {...field}
                        placeholder={__('This is role description', 'yay-wholesale-b2b')}
                        className="h-24 rounded-md"
                        aria-invalid={invalid}
                      />
                    </FieldContent>
                    {error && (
                      <FieldError
                        errors={[
                          {
                            message: error.message,
                          },
                        ]}
                      />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name={`discount`}
                render={({ field: { ref, ...field }, fieldState: { error, invalid } }) => (
                  <Field className="w-full gap-2.5">
                    <FieldLabel className="text-foreground-400 text-xs font-medium">
                      {__('Discount', 'yay-wholesale-b2b')}
                    </FieldLabel>
                    <FieldContent>
                      <NumberInput
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                        min={0}
                        max={100}
                        step={1}
                        placeholder={__('Enter a percentage discount', 'yay-wholesale-b2b')}
                        decimalSeparator={
                          window.yayWholesaleB2BAdmin.currency_data.decimal_sep ?? '.'
                        }
                        decimalScale={2}
                        className="h-9 w-full"
                        aria-invalid={invalid}
                        suffix="%"
                      />
                    </FieldContent>
                    {error && (
                      <FieldError
                        errors={[
                          {
                            message: error.message,
                          },
                        ]}
                      />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name={`minOrderQuantity`}
                render={({ field: { ref, ...field }, fieldState: { error, invalid } }) =>
                  isPro ? (
                    <Field className="w-full gap-2.5">
                      <FieldLabel className="text-foreground-400 text-xs font-medium">
                        {__('Min Order Quantity', 'yay-wholesale-b2b')}
                      </FieldLabel>
                      <FieldContent>
                        <NumberInput
                          value={field.value}
                          onValueChange={(value) => field.onChange(value)}
                          min={0}
                          step={1}
                          placeholder={__(
                            'e.g. 10 (min number of items required per order)',
                            'yay-wholesale-b2b',
                          )}
                          className="h-9 w-full"
                          aria-invalid={invalid}
                        />
                      </FieldContent>
                      {error && (
                        <FieldError
                          errors={[
                            {
                              message: error.message,
                            },
                          ]}
                        />
                      )}
                    </Field>
                  ) : (
                    <Field className="w-full gap-2.5">
                      <Label className="text-foreground-400 text-xs font-medium">
                        {__('Min Order Quantity', 'yay-wholesale-b2b')}
                        <Badge variant="warning" className="text-white">
                          {__('Pro', 'yay-wholesale-b2b')}
                        </Badge>
                      </Label>
                      <FieldContent>
                        <Input
                          value={__('Upgrade to PRO to unlock this feature.', 'yay-wholesale-b2b')}
                          // value={0}
                          min={0}
                          disabled
                          className="h-9 w-full"
                        />
                      </FieldContent>
                    </Field>
                  )
                }
              />

              <Controller
                control={form.control}
                name={`minOrderAmount`}
                render={({ field: { ref, ...field }, fieldState: { error, invalid } }) => (
                  <Field className="w-full gap-2.5">
                    <FieldLabel className="text-foreground-400 text-xs font-medium">
                      {__('Min Order Amount', 'yay-wholesale-b2b')}
                    </FieldLabel>
                    <FieldContent>
                      <NumberInputRoot
                        value={field.value}
                        onValueChange={(value) => field.onChange(value)}
                        min={0}
                        fixedDecimalScale={true}
                        decimalScale={window.yayWholesaleB2BAdmin.currency_data.num_decimals ?? 2}
                        decimalSeparator={
                          window.yayWholesaleB2BAdmin.currency_data.decimal_sep ?? '.'
                        }
                        thousandSeparator={
                          window.yayWholesaleB2BAdmin.currency_data.thousand_sep ?? ','
                        }
                        step={1}
                        className="h-9 w-full"
                      >
                        <NumberInputInput
                          placeholder={__(
                            'e.g. 200.00 (min total value required per order)',
                            'yay-wholesale-b2b',
                          )}
                          aria-invalid={invalid}
                        />
                        <div className="absolute inset-y-0 end-0 flex">
                          <NumberInputChevrons hasUnit />
                          <NumberInputUnit
                            unit={window.yayWholesaleB2BAdmin.currency_data.symbol ?? '$'}
                          />
                        </div>
                      </NumberInputRoot>
                    </FieldContent>
                    {error && (
                      <FieldError
                        errors={[
                          {
                            message: error.message,
                          },
                        ]}
                      />
                    )}
                  </Field>
                )}
              />

              <Controller
                control={form.control}
                name={`applyToSalePrice`}
                render={({ field: { ref, ...field }, fieldState: { error } }) => (
                  <Field className="w-full gap-2.5">
                    <FieldContent>
                      <div className="border-border flex items-center justify-between rounded-md border p-3">
                        <span className="text-foreground-400 text-sm font-medium">
                          {__('Apply wholesale discounts to sale prices', 'yay-wholesale-b2b')}
                        </span>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </div>
                    </FieldContent>
                    {error && (
                      <FieldError
                        errors={[
                          {
                            message: error.message,
                          },
                        ]}
                      />
                    )}
                  </Field>
                )}
              />
            </div>

            <SheetFooter className="p-0">
              <div className="border-divider flex justify-end gap-4 border-t bg-white p-5">
                <SheetClose asChild>
                  <Button variant="outline" className="text-foreground-400 px-4.5">
                    {__('Cancel', 'yay-wholesale-b2b')}
                  </Button>
                </SheetClose>
                <Button
                  type="submit"
                  form="role-form"
                  variant="primary"
                  className="px-5"
                  disabled={isAddingRolePending || isUpdatingRolePending}
                >
                  {isAddingRole
                    ? __('Add Role', 'yay-wholesale-b2b')
                    : __('Save changes', 'yay-wholesale-b2b')}
                </Button>
              </div>
            </SheetFooter>
          </SheetContent>
        </Sheet>
      </form>
    </FormProvider>
  );
}
