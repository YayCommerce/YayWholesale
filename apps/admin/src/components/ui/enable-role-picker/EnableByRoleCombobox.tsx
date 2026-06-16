import { useId } from 'react';
import { __ } from '@wordpress/i18n';

import { useActiveRolesQuery, useAllRolesQuery } from '@/lib/queries/roles.queries';
import { EnableByRole } from '@/lib/schema/common.schema';
import { useUncontrolled } from '@/hooks/useUncontrolled';
import {
  ComboboxBadge,
  ComboboxCheckbox,
  ComboboxIcon,
  ComboboxRemove,
  ComboboxTrigger,
} from '@/components/ui/combobox';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Popover, PopoverContent } from '@/components/ui/popover';

type Props = {
  value?: EnableByRole;
  defaultValue?: EnableByRole;
  onValueChange?: (value: EnableByRole) => void;
};

export function EnableByRoleCombobox({ value: controlledValue, defaultValue, onValueChange }: Props) {
  const [value, setValue] = useUncontrolled({
    value: controlledValue === null ? undefined : controlledValue,
    defaultValue: defaultValue,
    onChange: onValueChange,
  });

  const { data: roles } = useAllRolesQuery();

  function toggleRetailer() {
    setValue({
      ...value,
      retailers: value.retailers === 'enabled' ? 'disabled' : 'enabled',
    });
  }

  function toggleAllWholesalers() {
    if (value.wholesalers === 'disabled') {
      setValue({
        ...value,
        wholesalers: 'enabled',
        selected_roles: [],
      });
    } else if (value.wholesalers === 'enabled') {
      setValue({
        ...value,
        wholesalers: 'disabled',
        selected_roles: [],
      });
    } else if (value.wholesalers === 'enabled-selected-roles') {
      setValue({
        ...value,
        wholesalers: 'enabled',
        selected_roles: [],
      });
    }
  }

  function selectWholesalerRole(roleSlug: string) {
    const nextSelectedRoles = [...value.selected_roles, roleSlug];
    const isAllRolesSelected = roles.every((role) => nextSelectedRoles.includes(role.slug));

    if (isAllRolesSelected) {
      setValue({
        ...value,
        wholesalers: 'enabled',
        selected_roles: [],
      });
    } else {
      setValue({
        ...value,
        wholesalers: 'enabled-selected-roles',
        selected_roles: nextSelectedRoles,
      });
    }
  }

  function unselectWholesalerRole(roleSlug: string) {
    let valueArray = value.selected_roles;
    if (value.wholesalers === 'enabled') {
      valueArray = roles.map((role) => role.slug);
    }

    const nextSelectedRoles = valueArray.filter((slug) => slug !== roleSlug);
    const isAllRolesUnselected = roles.every((role) => !nextSelectedRoles.includes(role.slug));

    if (isAllRolesUnselected) {
      setValue({
        ...value,
        wholesalers: 'disabled',
        selected_roles: [],
      });
    } else {
      setValue({
        ...value,
        wholesalers: 'enabled-selected-roles',
        selected_roles: nextSelectedRoles,
      });
    }
  }

  function toogleWholesalerRole(roleSlug: string) {
    let isSelected = false;
    if (value.wholesalers === 'disabled') {
      isSelected = false;
    } else if (value.wholesalers === 'enabled') {
      isSelected = true;
    } else if (value.wholesalers === 'enabled-selected-roles') {
      isSelected = value.selected_roles.includes(roleSlug);
    }

    if (isSelected) {
      unselectWholesalerRole(roleSlug);
    } else {
      selectWholesalerRole(roleSlug);
    }
  }

  // make sure command item value is unique
  const uniqueId = useId();

  return (
    <Popover>
      <ComboboxTrigger disabled={false} className="my-3 w-full">
        {value.retailers === 'disabled' && value.wholesalers === 'disabled' && (
          <div className="text-muted-foreground">{__('Select roles', 'yay-wholesale-b2b')}</div>
        )}
        <div className="-ml-2 flex flex-wrap gap-1">
          {value.retailers === 'enabled' && (
            <ComboboxBadge key={`all-retailers-${uniqueId}`}>
              {__('Retail Customers (B2C)', 'yay-wholesale-b2b')}
              <ComboboxRemove onRemove={() => toggleRetailer()} />
            </ComboboxBadge>
          )}
          {value.wholesalers === 'enabled' && (
            <ComboboxBadge key={`all-wholesalers-${uniqueId}`}>
              {__('Wholesale Customers (B2B)', 'yay-wholesale-b2b')}
              <ComboboxRemove onRemove={() => toggleAllWholesalers()} />
            </ComboboxBadge>
          )}
          {value.wholesalers === 'enabled-selected-roles' &&
            value.selected_roles.map((roleSlug) => (
              <ComboboxBadge key={roleSlug}>
                {roles.find((role) => role.slug === roleSlug)?.name}
                <ComboboxRemove onRemove={() => toogleWholesalerRole(roleSlug)} />
              </ComboboxBadge>
            ))}
        </div>
        <ComboboxIcon />
      </ComboboxTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          {roles.length > 10 && <CommandInput placeholder="Search roles" />}
          <CommandList>
            <CommandEmpty>{__('No roles found', 'yay-wholesale-b2b')}</CommandEmpty>
            <CommandGroup>
              <CommandItem
                key={`all-retailers-${uniqueId}`}
                value={`all-retailers-${uniqueId}`}
                onSelect={() => toggleRetailer()}
              >
                <ComboboxCheckbox selected={value.retailers === 'enabled'} />
                {__('Retail Customers (B2C)', 'yay-wholesale-b2b')}
              </CommandItem>
              <CommandItem
                key={`all-wholesalers-${uniqueId}`}
                value={`all-wholesalers-${uniqueId}`}
                onSelect={() => toggleAllWholesalers()}
              >
                <ComboboxCheckbox selected={value.wholesalers === 'enabled'} />
                {__('Wholesale Customers (B2B)', 'yay-wholesale-b2b')}
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup>
              {roles.map((role) => {
                const isSelected =
                  value.wholesalers === 'enabled' ||
                  (value.wholesalers === 'enabled-selected-roles' && value.selected_roles.includes(role.slug));
                return (
                  <CommandItem key={role.slug} value={role.slug} onSelect={() => toogleWholesalerRole(role.slug)}>
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
  );
}
