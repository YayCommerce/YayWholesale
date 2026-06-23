import { __ } from '@wordpress/i18n';

import { Button } from '@/components/ui/button';

type WelcomeProps = {
  setStep: (step: number) => void;
};

export default function Welcome({ setStep }: WelcomeProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-7 pt-30">
      <div className="border-border h-full rounded-2xl bg-[#FFF5DB] px-0.75 pt-0.75">
        <img
          src={`${window.yayWholesaleB2BMeta.wholesaleMeta.assetsUrl}/images/favicon.svg`}
          alt="YayWholesale"
          className="size-30"
        />
      </div>
      <h3 className="text-2xl font-bold">{__('Welcome to Yay Wholesale B2B')}</h3>
      <p className="text-muted-foreground w-120 text-center text-lg">
        {__(
          'The easiest way to manage wholesale pricing, customer tiers, minimum order quantities / amount, and B2B features for your WooCommerce store.',
          'yay-wholesale-b2b',
        )}
      </p>
      <div className="mt-4 flex flex-col gap-4">
        <Button size="lg" className="w-60" onClick={() => setStep(1)}>
          {__('Get started', 'yay-wholesale')}
        </Button>
        <Button size="lg" className="text-muted-foreground w-60 font-normal" variant="ghost">
          {__('Skip for now', 'yay-wholesale')}
        </Button>
      </div>
    </div>
  );
}
