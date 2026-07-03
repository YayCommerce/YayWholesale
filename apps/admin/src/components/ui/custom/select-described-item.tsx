import * as SelectPrimitive from '@radix-ui/react-select';
import { CheckIcon } from 'lucide-react';

import { cn } from '@/lib/utils';

type DescribedSelectItemProps = {
  value: string;
  label: string;
  description: string;
};

function SelectDescribedItem({ value, label, description }: DescribedSelectItemProps) {
  return (
    <SelectPrimitive.Item
      value={value}
      className={cn(
        'focus:bg-accent focus:text-accent-foreground data-[state=checked]:text-primary hover:bg-accent relative flex w-full cursor-default flex-col gap-0.5 rounded-sm py-2 pr-8 pl-2 outline-hidden select-none data-disabled:pointer-events-none data-disabled:opacity-50',
      )}
    >
      <span className="absolute top-2.5 right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <CheckIcon className="size-3.5 stroke-[2.5px]" />
        </SelectPrimitive.ItemIndicator>
      </span>
      <SelectPrimitive.ItemText className="text-sm">{label}</SelectPrimitive.ItemText>
      <span className="text-muted-foreground text-xs font-normal">{description}</span>
    </SelectPrimitive.Item>
  );
}

export { SelectDescribedItem };
