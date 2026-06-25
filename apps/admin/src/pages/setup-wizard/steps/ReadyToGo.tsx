import { useNavigate } from 'react-router';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { Button } from '@/components/ui/button';

export default function ReadyToGo() {
  const navigate = useNavigate();

  return (
    <div className="flex w-full flex-col items-center justify-center gap-9">
      <div className="flex w-full flex-col gap-6">
        <span className="text-3xl font-bold">{__('You’re all set! 🎉', 'yay-wholesale-b2b')}</span>
        <div className="text-muted-foreground flex flex-col gap-3 text-[16px]">
          <span>{__('Create rules and discounts for your first wholesale customer group', 'yay-wholesale-b2b')}</span>
          <span>
            {createInterpolateElement(__('Need more help? Read our <docs>Documentation</docs>.', 'yay-wholesale-b2b'), {
              docs: (
                <a
                  href="https://docs.yaycommerce.com/yaywholesale/"
                  target="_blank"
                  className="text-foreground font-medium underline"
                />
              ),
            })}
          </span>
        </div>

        <div className="bg-muted flex w-full gap-4 rounded-md p-7.5">
          <img
            src={`${window.yayWholesaleB2BMeta.wholesaleMeta.assetsUrl}/images/setup_customer.svg`}
            alt="YayWholesale"
            width="36px"
            height="36px"
            className="mt-1 size-9"
          />
          <div className="flex flex-col leading-7 italic">
            <span className="text-lg">
              {__(
                '“I tried four different wholesale plugins before finding YayWholesale. Setup took minutes, and we were ready to go right away.”',
                'yay-wholesale-b2b',
              )}
            </span>
            <span className="text-[16px] font-medium">{__('— Jennifer, Store Owner', 'yay-wholesale-b2b')}</span>
          </div>
        </div>
      </div>

      <div className="flex w-full items-center justify-center gap-6">
        <Button size="lg" variant="outline" onClick={() => navigate('/roles/new')}>
          {__('Add New Role', 'yay-wholesale')}
        </Button>

        <Button size="lg" onClick={() => navigate('/')}>
          {__('Open Dashboard', 'yay-wholesale')}
        </Button>
      </div>
    </div>
  );
}
