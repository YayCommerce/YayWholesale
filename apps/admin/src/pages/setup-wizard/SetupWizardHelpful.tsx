import { useState } from 'react';
import { Separator } from '@radix-ui/react-separator';
import { ThumbsDown, ThumbsUp, X } from 'lucide-react';
import { useDebounce } from 'rooks';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { updateSetupHelpful } from '@/lib/api/wizard.api';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

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
          'z-10 flex-row items-center gap-0 p-0 transition-all duration-300',
          (step < maxSteps || isSkippingHelpful) && '-z-10 translate-y-5 opacity-0',
        )}
      >
        <div className="flex items-center gap-5 pl-4">
          <span>
            {setupHelpful === 'yes' &&
              createInterpolateElement(__('Thank you for using YayWholesale from <link/>.', 'yay-wholesale-b2b'), {
                link: (
                  <a
                    href="https://yaycommerce.com/"
                    target="_blank"
                    className="hover:text-foreground cursor-pointer font-semibold underline focus:shadow-none"
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
                    className="hover:text-foreground cursor-pointer font-semibold underline focus:shadow-none"
                  >
                    {__('here to help', 'yay-wholesale-b2b')}
                  </a>
                ),
              })}
            {setupHelpful === 'blank' && __('How was your onboarding experience?')}
          </span>
          <div>
            <Button
              variant="link"
              className="text-muted-foreground p-2.5"
              onClick={() => updateSetupWizardHelpful('yes')}
            >
              <ThumbsUp className={cn(setupHelpful === 'yes' && 'text-success')} />
            </Button>
            <Button
              variant="link"
              className="text-muted-foreground p-2.5"
              onClick={() => updateSetupWizardHelpful('no')}
            >
              <ThumbsDown className={cn(setupHelpful === 'no' && 'text-destructive')} />
            </Button>
          </div>
        </div>
        <Separator orientation="vertical" className="ml-0.5! h-10!" />
        <Button variant="link" className="text-muted-foreground" onClick={() => setSkippingHelpful(true)}>
          <X />
        </Button>
      </Card>
    </div>
  );
};

export default SetupWizardHelpful;
