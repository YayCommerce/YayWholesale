import { useState } from 'react';
import { ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { useDebounce } from 'rooks';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { updateSetupHelpful } from '@/lib/api/wizard.api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type SetupWizardHelpfulProps = {
  step: number;
  maxSteps: number;
};

const SetupWizardHelpful = ({ step, maxSteps }: SetupWizardHelpfulProps) => {
  const [isSkippingHelpful, setSkippingHelpful] = useState(false);
  const [setupHelpful, setSetupHelpful] = useState('blank');
  const updateSetupHelpfulDebounced = useDebounce(updateSetupHelpful, 500);

  const updateSetupWizardHelpful = (value: 'yes' | 'no') => {
    if (value === setupHelpful) return;
    try {
      setSetupHelpful(value);
      updateSetupHelpfulDebounced(value);
    } catch (error) {
      console.warn('Update helpful failed:', error);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Card
        className={cn(
          'z-10 flex h-12.5 flex-row items-center gap-7.5 p-0 pr-1.5 pl-4 transition-all duration-300',
          (step < maxSteps || isSkippingHelpful) && '-z-10 translate-y-5 opacity-0',
        )}
      >
        <span>
          {setupHelpful === 'yes' &&
            createInterpolateElement(__('Thank you for using YayWholesale from <link/>.', 'yay-wholesale-b2b'), {
              link: (
                <a
                  href="https://yaycommerce.com/"
                  target="_blank"
                  className="hover:text-foreground cursor-pointer font-semibold underline underline-offset-3 focus:shadow-none"
                >
                  YayCommerce
                </a>
              ),
            })}
          {setupHelpful === 'no' &&
            createInterpolateElement(__('Need assistance? Our team is <link/> you.', 'yay-wholesale-b2b'), {
              link: (
                <a
                  href="https://yaycommerce.com/support"
                  target="_blank"
                  className="hover:text-foreground cursor-pointer font-semibold underline underline-offset-3 focus:shadow-none"
                >
                  {__('here to help', 'yay-wholesale-b2b')}
                </a>
              ),
            })}
          {setupHelpful === 'blank' && __('How was your onboarding experience?')}
        </span>
        <div className="flex items-center gap-1.5">
          <div className="flex gap-1.5 py-3">
            <Button
              variant={setupHelpful === 'yes' ? 'primary-soft' : 'ghost'}
              className={cn('p-2.5', setupHelpful !== 'yes' && 'text-muted-foreground')}
              onClick={() => updateSetupWizardHelpful('yes')}
            >
              <ThumbsUp />
            </Button>
            <Button
              variant={setupHelpful === 'no' ? 'destructive-soft' : 'ghost'}
              className={cn('p-2.5', setupHelpful !== 'no' && 'text-muted-foreground')}
              onClick={() => updateSetupWizardHelpful('no')}
            >
              <ThumbsDown className={cn(setupHelpful === 'no' && 'text-destructive')} />
            </Button>
          </div>
          <Separator orientation="vertical" className="bg-border h-12.5! w-[0.5px]!" />
          <Button variant="ghost" className="text-muted-foreground py-3" onClick={() => setSkippingHelpful(true)}>
            <X className="size-4.5" />
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default SetupWizardHelpful;
