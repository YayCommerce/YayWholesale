import { useCallback, useMemo, useState } from 'react';
import { QuestionIcon } from '@phosphor-icons/react';
import { CommandGroup } from 'cmdk';
import { InfoIcon, WalletCards } from 'lucide-react';
import { useFieldArray, useFormContext } from 'react-hook-form';
import { __ } from '@wordpress/i18n';

import { useActiveRolesQuery } from '@/lib/queries/roles.queries';
import { RoleRelatedSetting, Settings } from '@/lib/schema/settings.schema';
import { cn, isPro } from '@/lib/utils';
import { useUncontrolled } from '@/hooks/useUncontrolled';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  ComboboxBadge,
  ComboboxCheckbox,
  ComboboxIcon,
  ComboboxRemove,
  ComboboxTrigger,
} from '@/components/ui/combobox';
import { Command, CommandEmpty, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { WholeSaleToolTip } from '@/components/ui/custom/WholeSaleToolTip';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Popover, PopoverContent } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

export default function PaymentRolesTab() {
  const { control } = useFormContext<Settings>();

  const { fields, update } = useFieldArray({
    control,
    name: 'payment_roles',
  });

  const { data: roles } = useActiveRolesQuery();

  const rolesSelect = useMemo(() => {
    const handleRoles = roles?.map((role) => ({ slug: role.slug, name: role.name })) ?? [];

    return [
      ...handleRoles,
      {
        slug: 'ywhs_retail',
        name: 'Retail Customer (B2C)',
      },
    ];
  }, [roles]);

  return (
    <div className="flex flex-col gap-4 overflow-x-auto">
      <div>
        <h3 className="text-foreground text-[16px] font-semibold">{__('Payment Roles', 'yay_wholesale_b2b')}</h3>
        <p className="text-muted-foreground text-[14px] font-normal">
          {__('Select which roles can use each payment method.', 'yay_wholesale_b2b')}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white shadow-xs">
        <Table>
          <TableHeader className="text-foreground bg-muted-400 h-10">
            <TableRow className="text-[14px] font-semibold">
              <TableHead className="w-90">
                <span>{__('Payment Methods', 'yay_wholesale_b2b')}</span>
              </TableHead>
              <TableHead>
                <span className="flex items-center gap-2">
                  {__('Roles', 'yay_wholesale_b2b')}
                  <WholeSaleToolTip
                    className="w-57"
                    trigger={<QuestionIcon className="h-4 w-4" />}
                    content={__(
                      'The payment method is only available to users with the selected roles.',
                      'yay_wholesale_b2b',
                    )}
                  />
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isPro ? (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  <Empty className="my-5">
                    <EmptyHeader>
                      <EmptyMedia variant="icon" className="h-15 w-15 rounded-full">
                        <WalletCards className="min-h-6 min-w-6" />
                      </EmptyMedia>
                      <EmptyTitle className="flex items-center gap-1.5 font-bold">
                        {__('Yay Wholesale B2B', 'yay-wholesale-b2b')}
                        {!isPro && (
                          <Badge variant="warning" className="text-white">
                            {__('Pro', 'yay-wholesale-b2b')}
                          </Badge>
                        )}
                      </EmptyTitle>
                      <EmptyDescription>
                        {__('Upgrade to PRO to unlock this feature now', 'yay-wholesale-b2b')}
                      </EmptyDescription>
                      <EmptyContent>
                        <Button
                          variant="warning"
                          className="text-white"
                          onClick={() => {
                            window.open('https://yaycommerce.com/yay-wholesale-b2b-for-woocommerce/');
                          }}
                        >
                          {__('Upgrade', 'yay-wholesale-b2b')}
                        </Button>
                      </EmptyContent>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : fields.length > 0 ? (
              fields.map((setting, index) => {
                const onSettingChange = async (value: RoleRelatedSetting[]) => {
                  const updated = { ...fields[index] };

                  updated.roles = value;
                  update(index, updated);
                };

                const [value, setValue] = useUncontrolled<RoleRelatedSetting[]>({
                  value: setting.roles,
                  defaultValue: setting.roles,
                  onChange: onSettingChange,
                });

                const [open, setOpen] = useState(false);

                const handleSelect = (role: RoleRelatedSetting) => {
                  const isSelected = value.some((v) => v.slug === role.slug);
                  if (isSelected) {
                    setValue(value.filter((v) => v.slug !== role.slug));
                  } else {
                    setValue([...value, role]);
                  }
                };

                const handleRemove = useCallback(
                  (role: RoleRelatedSetting, e: React.MouseEvent) => {
                    e.stopPropagation();
                    e.preventDefault();
                    setValue(value.filter((v) => v.slug !== role.slug));
                  },
                  [value, setValue],
                );

                const labels = useMemo(() => {
                  if (value.length === 0)
                    return (
                      <span className="text-muted-foreground">{__('Select your roles', 'yay_wholesale_b2b')}</span>
                    );
                  return value.map((role) => (
                    <ComboboxBadge key={role.slug}>
                      {role.name}
                      <ComboboxRemove onRemove={(e) => handleRemove(role, e)} />
                    </ComboboxBadge>
                  ));
                }, [value, handleRemove]);

                return (
                  <TableRow key={setting.id} className="border-divider border-b">
                    <TableCell className="w-80 px-2 py-3.5">
                      <p className="text-foreground flex items-center gap-1.5 font-extrabold whitespace-pre-line">
                        {setting.method_title}
                        {setting.description && (
                          <span>
                            <WholeSaleToolTip
                              trigger={<InfoIcon className="h-3 w-3" />}
                              content={setting.description}
                            />
                          </span>
                        )}
                      </p>
                      <p className="text-muted-foreground text-xs font-normal whitespace-pre-line">{setting.title}</p>
                    </TableCell>
                    <TableCell>
                      <Popover open={open} onOpenChange={setOpen}>
                        <ComboboxTrigger disabled={false} className="my-3 w-full">
                          <div className={cn('flex flex-wrap gap-1', value.length > 0 && '-ml-2')}>{labels}</div>
                          <ComboboxIcon />
                        </ComboboxTrigger>
                        <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
                          <Command>
                            {rolesSelect.length > 10 && <CommandInput placeholder="Search roles" />}
                            <CommandList>
                              <CommandEmpty>{__('No roles found')}</CommandEmpty>
                              <CommandGroup>
                                {rolesSelect.map((role) => {
                                  const isSelected = value.some((v) => v.slug === role.slug);
                                  return (
                                    <CommandItem
                                      key={role.slug}
                                      value={role.slug}
                                      onSelect={() => {
                                        handleSelect(role);
                                      }}
                                    >
                                      <ComboboxCheckbox selected={isSelected} />
                                      {role.name}
                                    </CommandItem>
                                  );
                                })}
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={2} className="h-24 text-center">
                  <Empty className="my-5">
                    <EmptyHeader>
                      <EmptyMedia variant="icon" className="h-15 w-15 rounded-full">
                        <WalletCards className="min-h-6 min-w-6" />
                      </EmptyMedia>
                      <EmptyTitle className="font-bold">
                        {__('No Enabled Payment Methods Found', 'yay-wholesale-b2b')}
                      </EmptyTitle>
                      <EmptyDescription>
                        {__(
                          "You haven't enabled any payment methods. Get started with Woocommerce Payments.",
                          'yay-wholesale-b2b',
                        )}
                      </EmptyDescription>
                      <EmptyContent>
                        <Button
                          onClick={() => {
                            window.open(window.yayWholesaleB2BMeta.wcMeta.setting_urls.payment);
                          }}
                        >
                          {__('Configure', 'yay-wholesale-b2b')}
                        </Button>
                      </EmptyContent>
                    </EmptyHeader>
                  </Empty>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
