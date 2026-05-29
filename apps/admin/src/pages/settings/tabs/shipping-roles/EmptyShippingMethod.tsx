import { Truck } from 'lucide-react';
import { __ } from '@wordpress/i18n';

import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { TableCell, TableRow } from '@/components/ui/table';

export function EmptyShippingMethod() {
  return (
    <TableRow>
      <TableCell colSpan={2} className="h-24 text-center">
        <Empty className="my-5">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="h-15 w-15 rounded-full">
              <Truck className="min-h-7 min-w-7" />
            </EmptyMedia>
            <EmptyTitle className="font-bold">
              {__('No Enabled Shipping Methods Found', 'yay-wholesale-b2b')}
            </EmptyTitle>
            <EmptyDescription>
              {__(
                "You haven't enabled any shipping methods. Get started with Woocommerce Shippings.",
                'yay-wholesale-b2b',
              )}
            </EmptyDescription>
            <EmptyContent>
              <Button
                onClick={() => {
                  window.open(window.yayWholesaleB2BMeta.wcMeta.setting_urls.shipping);
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
