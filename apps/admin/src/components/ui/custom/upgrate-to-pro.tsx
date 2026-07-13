import { ChevronRight } from 'lucide-react';
import { __ } from '@wordpress/i18n';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { WholeSaleToolTip } from '@/components/ui/custom/WholeSaleToolTip';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';

const yayWholesaleProUrl = 'https://yaycommerce.com/yay-wholesale-b2b-for-woocommerce/';

export function UpgradeToProBadge() {
  return (
    <WholeSaleToolTip
      trigger={
        <Badge
          variant="warning"
          className="text-3 h-4.5 cursor-pointer rounded-sm p-1.5 pr-0.75 leading-6 text-white"
          onClick={() => {
            window.open(yayWholesaleProUrl);
          }}
        >
          {__('Pro', 'yay-wholesale-b2b')}
          <ChevronRight className="h-0.75 w-1.25" />
        </Badge>
      }
      content={__('Unlock this feature')}
    />
  );
}

export function UpgradeToProOverlay() {
  return (
    <Empty className="my-5">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="size-15 bg-[#FFF5DB]">
          <img
            src={`${window.yayWholesaleB2BMeta.wholesaleMeta.assetsUrl}/images/logo/favicon.svg`}
            alt="YayWholesale"
            className="size-13"
          />
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
              window.open(yayWholesaleProUrl);
            }}
          >
            {__('Upgrade', 'yay-wholesale-b2b')}
          </Button>
        </EmptyContent>
      </EmptyHeader>
    </Empty>
  );
}
