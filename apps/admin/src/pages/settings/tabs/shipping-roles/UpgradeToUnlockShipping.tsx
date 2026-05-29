import { Truck } from 'lucide-react';
import { __ } from '@wordpress/i18n';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { TableCell, TableRow } from '@/components/ui/table';

export function UpgradeToUnlockShipping() {
  return (
    <TableRow>
      <TableCell colSpan={2} className="h-24 text-center">
        <Empty className="my-5">
          <EmptyHeader>
            <EmptyMedia variant="icon" className="h-15 w-15 rounded-full">
              <Truck className="min-h-6 min-w-6" />
            </EmptyMedia>
            <EmptyTitle className="flex items-center gap-1.5 font-bold">
              {__('Yay Wholesale B2B', 'yay-wholesale-b2b')}
              <Badge variant="warning" className="text-white">
                {__('Pro', 'yay-wholesale-b2b')}
              </Badge>
            </EmptyTitle>
            <EmptyDescription>{__('Upgrade to PRO to unlock this feature now', 'yay-wholesale-b2b')}</EmptyDescription>
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
      </TableCell>
    </TableRow>
  );
}
