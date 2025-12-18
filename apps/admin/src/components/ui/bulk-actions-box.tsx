import { __, sprintf } from '@wordpress/i18n';
import { XIcon } from 'lucide-react';

import { Separator } from '@/components/ui/separator';

import { Button } from './button';
import { TableToast, TableToastClose, TableToaster, TableToastTitle } from './table-toast';

type BulkActionBoxProps = {
  selectedCount: number;
  onResetRow: () => void;
  isHidingCondition?: boolean;
  children?: React.ReactNode;
};

const BulkActionBox = ({
  selectedCount,
  onResetRow,
  isHidingCondition,
  children,
}: BulkActionBoxProps) => {
  return (
    <>
      <div className="flex items-center gap-4">
        {selectedCount > 1 && (isHidingCondition ?? true) && (
          <div className="border-border flex items-center gap-2 rounded-md border px-1.5 py-1 shadow-[0_1px_2px_0_#0000000D]">
            <Button
              variant="ghost"
              size="icon"
              className="hover:text-foreground text-muted-foreground h-6 w-6 shrink-0 hover:bg-transparent"
              onClick={() => onResetRow()}
              aria-label="Clear selection"
            >
              <XIcon className="size-4" />
            </Button>
            <span className="text-sm font-normal text-[#151619]">
              {sprintf(__('%d selected'), selectedCount)}
            </span>
            <Separator orientation="vertical" className="ml-2 h-5!" />
            {children}
          </div>
        )}
      </div>
    </>
  );
};

export default BulkActionBox;
