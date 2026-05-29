import { QuestionIcon } from '@phosphor-icons/react';
import { __ } from '@wordpress/i18n';

import { isPro } from '@/lib/utils';
import { WholeSaleToolTip } from '@/components/ui/custom/WholeSaleToolTip';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { EmptyShippingMethod } from '@/pages/settings/tabs/shipping-roles/EmptyShippingMethod';
import { ShippingRows } from '@/pages/settings/tabs/shipping-roles/ShippingRows';
import { UpgradeToUnlockShipping } from '@/pages/settings/tabs/shipping-roles/UpgradeToUnlockShipping';

export default function ShippingRolesTab() {
  return (
    <div className="flex flex-col gap-4 overflow-x-auto">
      <div>
        <h3 className="text-foreground text-[16px] font-semibold">{__('Shipping Roles', 'yay_wholesale_b2b')}</h3>
        <p className="text-muted-foreground text-[14px] font-normal">
          {__('Select which roles can use each shipping method.', 'yay_wholesale_b2b')}
        </p>
      </div>

      <div className="overflow-x-auto rounded-lg border bg-white shadow-xs">
        <Table>
          <TableHeader className="text-foreground bg-muted-400 h-10">
            <TableRow className="text-[14px] font-semibold">
              <TableHead className="w-90">
                <span>{__('Shipping Methods', 'yay_wholesale_b2b')}</span>
              </TableHead>
              <TableHead>
                <span className="flex items-center gap-2">
                  {__('Roles', 'yay_wholesale_b2b')}
                  <WholeSaleToolTip
                    className="w-57"
                    trigger={<QuestionIcon className="h-4 w-4" />}
                    content={__(
                      'The shipping method is only available to users with the selected roles.',
                      'yay_wholesale_b2b',
                    )}
                  />
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!isPro ? (
              <UpgradeToUnlockShipping />
            ) : wooShippingMethods.length === 0 ? (
              <EmptyShippingMethod />
            ) : (
              <ShippingRows />
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

const wooShippingMethods = window.yayWholesaleB2BMeta.wcMeta.shipping_methods_info;
