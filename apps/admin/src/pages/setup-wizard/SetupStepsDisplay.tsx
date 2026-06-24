import { useMemo } from 'react';
import { __, sprintf } from '@wordpress/i18n';

import { cn } from '@/lib/utils';

type SetupStepsDisplayProps = {
  step: number;
  stepTitles: string[];
};

// const stepsTitle = [__('1. Welcome to YayWholesale'), __('2. Setup First Role'), __('3. Ready To Go')];

export default function SetupStepsDisplay({ step, stepTitles }: SetupStepsDisplayProps) {
  const title = useMemo(() => stepTitles[step], [step]);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold">{title}</span>
        <span className="text-xs font-normal text-[#A0A0A7]">
          {sprintf(__('Step %d of %d'), step + 1, stepTitles.length)}
        </span>
      </div>
      <div className="flex gap-2.5">
        {stepTitles.map((title, index) => (
          <div key={index} className="bg-muted relative h-1.25 flex-1 overflow-hidden rounded-[20px]">
            <div className={cn('bg-primary h-full w-0 transition-all', index <= step && 'w-full')}></div>
          </div>
        ))}
      </div>
    </div>
  );
}
