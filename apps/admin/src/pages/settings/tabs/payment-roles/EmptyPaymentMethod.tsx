import { WalletCards } from 'lucide-react';
import { __ } from '@wordpress/i18n';

import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { TableCell, TableRow } from '@/components/ui/table';

export function EmptyPaymentMethod() {
  return (
    <TableRow>
      <TableCell colSpan={2} className="h-24 text-center">
        <Empty className="my-5">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="h-15 w-15 rounded-full">
              <WalletCards className="min-h-6 min-w-6" />
            </EmptyMedia>
            <EmptyTitle className="font-bold">{__('No Enabled Payment Methods Found', 'yay-wholesale-b2b')}</EmptyTitle>
            <EmptyDescription>
              {__(
                "You haven't enabled any payment methods. Get started with Woocommerce Payments.",
                'yay-wholesale-b2b',
              )}
            </EmptyDescription>
            <EmptyContent>
              <Button
                onClick={() => {
                  window.open(window.yayWholesaleB2BMeta.wcMeta.setting_urls.payment);
                }}
              >
                {__('Configure', 'yay-wholesale-b2b')}
              </Button>
            </EmptyContent>
          </EmptyHeader>
        </Empty>
      </TableCell>
    </TableRow>
  );
}
