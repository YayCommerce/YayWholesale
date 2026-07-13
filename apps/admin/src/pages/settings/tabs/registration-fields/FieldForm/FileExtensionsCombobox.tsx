import { ComponentProps, useCallback, useMemo, useState } from 'react';
import { __ } from '@wordpress/i18n';

import { cn } from '@/lib/utils';
import { useUncontrolled } from '@/hooks/useUncontrolled';
import {
  ComboboxBadge,
  ComboboxCheckbox,
  ComboboxIcon,
  ComboboxRemove,
  ComboboxTrigger,
} from '@/components/ui/combobox';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent } from '@/components/ui/popover';

type FileExtensionsComboboxProps = Omit<
  ComponentProps<typeof ComboboxTrigger>,
  'children' | 'value' | 'defaultValue'
> & {
  value?: FileExtension[];
  defaultValue?: FileExtension[];
  onValueChange?: (value: FileExtension[]) => void;
};

export function FileExtensionsCombobox({
  value: controlledValue,
  defaultValue,
  onValueChange,
  className,
  ...props
}: FileExtensionsComboboxProps) {
  const [value, setValue] = useUncontrolled({
    value: controlledValue === null ? undefined : controlledValue,
    defaultValue: defaultValue,
    onChange: onValueChange,
  });

  const [open, setOpen] = useState(false);

  const handleSelect = (extension: FileExtension) => {
    const isSelected = value.some((v) => v === extension);
    if (isSelected) {
      setValue(value.filter((v) => v !== extension));
    } else {
      setValue([...value, extension]);
    }
  };

  const handleRemove = useCallback(
    (extension: FileExtension, e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      setValue(value.filter((v) => v !== extension));
    },
    [value, setValue],
  );

  const labels = useMemo(() => {
    if (value.length === 0) return <span className="text-muted-foreground">Select extensions</span>;
    const moreCount = value.length - 5;
    return (
      <>
        {value.slice(0, 5).map((extension) => (
          <ComboboxBadge key={extension}>
            {extension}
            <ComboboxRemove onRemove={(e) => handleRemove(extension, e)} />
          </ComboboxBadge>
        ))}
        {moreCount > 0 && (
          <ComboboxBadge className="px-1" key="more">
            +{moreCount}
          </ComboboxBadge>
        )}
      </>
    );
  }, [value, handleRemove]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <ComboboxTrigger className={className} {...props}>
        <div className={cn('flex flex-wrap gap-1', value.length > 0 && '-ml-2')}>{labels}</div>
        <ComboboxIcon />
      </ComboboxTrigger>
      <PopoverContent className="w-(--radix-popover-trigger-width) p-0" align="start">
        <Command>
          <CommandInput placeholder={__('Search extensions', 'yay-wholesale-b2b')} />
          <CommandList>
            <CommandEmpty>{__('No extensions found.', 'yay-wholesale-b2b')}</CommandEmpty>
            <CommandGroup>
              {FILE_EXTENSION_OPTIONS.map((option) => {
                const isSelected = value.some((v) => v === option.value);
                return (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => {
                      handleSelect(option.value);
                    }}
                  >
                    <ComboboxCheckbox selected={isSelected} />
                    {option.label}
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

const FILE_EXTENSION_OPTIONS = [
  { label: 'jpg', value: 'jpg' },
  { label: 'jpeg', value: 'jpeg' },
  { label: 'png', value: 'png' },
  { label: 'gif', value: 'gif' },
  { label: 'txt', value: 'txt' },
  { label: 'pdf', value: 'pdf' },
  { label: 'doc', value: 'doc' },
  { label: 'docx', value: 'docx' },

  { label: 'zip', value: 'zip' },
] as const;
type FileExtension = (typeof FILE_EXTENSION_OPTIONS)[number]['value'];
