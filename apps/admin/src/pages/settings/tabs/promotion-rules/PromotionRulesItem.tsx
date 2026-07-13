import { Fragment, useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { __ } from '@wordpress/i18n';

import type { PromotionRuleFormValues } from '@/lib/schema/promotion.schema';
import { Role } from '@/lib/schema/roles.schema';
import { cn } from '@/lib/utils';
import { Switch } from '@/components/ui/switch';
import { getPromotionSummaryItems } from './promotion-rule.helper';

interface PromotionRulesItemProps {
  index: number;
  promotionRule: PromotionRuleFormValues;
  promotionRuleId: string; // use for dnd-kit
  activeRoles: Role[];
  onCheckedChange: (index: number, checked: boolean) => void;
  onClick: (index: number) => void;
}

export default function PromotionRulesItem({
  index,
  promotionRule,
  promotionRuleId,
  activeRoles,
  onCheckedChange,
  onClick,
}: PromotionRulesItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: promotionRuleId,
  });

  const summaryItems = getPromotionSummaryItems(promotionRule, activeRoles);

  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }} // for dnd-kit
      className={cn(
        'group bg-background flex items-center gap-2.5 rounded-md border py-2.5 pr-5 pl-4 transition-shadow',
        isDragging && 'z-10 opacity-60 shadow-md',
        !isDragging && 'hover:shadow-xs',
      )}
      onClick={() => onClick(index)}
    >
      <div
        {...attributes}
        {...listeners}
        className="text-muted-foreground hover:text-foreground flex h-9 w-3.5 cursor-grab items-center justify-center active:cursor-grabbing"
      >
        <GripVertical className="size-5" />
      </div>

      <div className="flex w-full flex-1 flex-col items-start gap-0.5 text-left">
        <span
          className={cn(
            'truncate text-sm font-medium',
            !promotionRule.enableStatus && 'text-muted-foreground font-normal',
          )}
        >
          {promotionRule.title}
        </span>

        <div className="text-muted-foreground flex items-center text-xs">
          {summaryItems.map((item, idx) => (
            <Fragment key={item}>
              {idx > 0 && (
                <span aria-hidden className="mx-1 text-sm leading-none opacity-60">
                  •
                </span>
              )}
              <span>{item}</span>
            </Fragment>
          ))}
        </div>
      </div>

      <div onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}>
        <Switch
          size="sm"
          checked={promotionRule.enableStatus}
          onCheckedChange={(checked) => {
            onCheckedChange(index, checked);
          }}
          aria-label={__('Enabled status', 'yay-wholesale-b2b')}
        />
      </div>
    </div>
  );
}
