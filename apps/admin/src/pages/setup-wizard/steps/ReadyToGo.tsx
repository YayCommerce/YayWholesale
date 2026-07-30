import { useNavigate } from 'react-router';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';

import { Button } from '@/components/ui/button';

export default function ReadyToGo() {
  const navigate = useNavigate();

  return (
    <div className="flex w-full flex-col items-center justify-center gap-9">
      <div className="flex w-full flex-col gap-6">
        <span className="flex gap-0.5">
          <span className="text-3xl font-bold">{__('You’re all set!', 'yay-wholesale-b2b')}</span>
          <img
            src={`${window.yayWholesaleB2BMeta.wholesaleMeta.assetsUrl}/images/setup-wizard/partying_face.svg`}
            alt="YayWholesale"
          />
        </span>
        <div className="text-muted-foreground flex flex-col text-base/6.5">
          <span>
            {__(
              'Start selling wholesale your way—flexible pricing, tailored roles, and full control at your fingertips.',
              'yay-wholesale-b2b',
            )}
          </span>
          <span>
            {createInterpolateElement(__('Need more help? Read our <docs>Documentation</docs>.', 'yay-wholesale-b2b'), {
              docs: (
                <a
                  href="https://docs.yaycommerce.com/yaywholesale/"
                  target="_blank"
                  className="text-foreground font-medium underline underline-offset-3"
                />
              ),
            })}
          </span>
        </div>
      </div>

      <div className="flex w-full items-center justify-between gap-6">
        <Button
          size="lg"
          variant="secondary"
          className="px-8 py-6"
          onClick={() => window.open('https://yaycommerce.com/support/', 'blank')}
        >
          {__('Get Support', 'yay-wholesale')}
        </Button>
        <div className="flex items-center gap-6">
          <Button size="lg" variant="outline" className="px-8 py-6" onClick={() => navigate('/roles/new')}>
            {__('Add New Role', 'yay-wholesale')}
          </Button>

          <Button size="lg" className="px-8 py-6" onClick={() => navigate('/')}>
            {__('Open Dashboard', 'yay-wholesale')}
          </Button>
        </div>
      </div>
    </div>
  );
}
