import { QuestionIcon } from '@phosphor-icons/react';
import clsx from 'clsx';

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface WholeSaleToolTipProps {
  className?: string;
  trigger?: React.ReactNode;
  content: React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export function WholeSaleToolTip({
  trigger = <QuestionIcon fill="#A0A0A7" className="text-background size-4" />,
  content,
  className,
  side = 'top',
}: WholeSaleToolTipProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{trigger}</TooltipTrigger>
        <TooltipContent
          side={side}
          className={clsx(`z-[9999] ${className}`, undefined === content && 'hidden')}
        >
          <div className="text-center text-sm">{content}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
