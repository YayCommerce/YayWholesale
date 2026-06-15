import { Lock } from 'lucide-react';
import { __ } from '@wordpress/i18n';

import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia } from '@/components/ui/empty';

export default function UpgradeToUnlockPaymentShipping() {
  return (
    <div className="bg-muted-foreground/85 absolute top-0 left-0 size-full rounded-md">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon" className="bg-warning size-15 rounded-full">
            <Lock className="min-h-6 min-w-6 text-white" />
          </EmptyMedia>
          <EmptyDescription className="text-white">
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
    </div>
  );
}
