import { __ } from '@wordpress/i18n';

import { Button, LoadingButton } from '@/components/ui/button';

export type SingleSetupStepProps = {
  setStep: (step: number) => void;
  skip: () => void;
  isPendingSkip: boolean;
};

export default function Welcome({ setStep, skip, isPendingSkip }: SingleSetupStepProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className="border-border flex size-17.5 items-center justify-center rounded-full bg-[#F2FAFF]">
        <img
          src={`${window.yayWholesaleB2BMeta.wholesaleMeta.assetsUrl}/images/setup-wizard/waving_hand.svg`}
          alt="YayWholesale"
          className="size-10"
        />
      </div>
      <div className="flex w-full flex-col items-center gap-6">
        <h3 className="text-3xl font-bold">{__('Start selling wholesale in minutes')}</h3>
        <p className="text-muted-foreground text-center text-base/6.5">
          {__(
            'The easiest way to manage wholesale pricing, customer tiers, minimum order quantities / amount, and B2B features for your WooCommerce store.',
            'yay-wholesale-b2b',
          )}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <Button size="lg" className="w-79" onClick={() => setStep(1)}>
          {__('Get started', 'yay-wholesale')}
        </Button>
        <LoadingButton
          size="lg"
          className="text-muted-foreground hover:text-foreground w-79 font-semibold"
          variant="ghost"
          loading={isPendingSkip}
          onClick={skip}
        >
          {__('Skip for Now', 'yay-wholesale')}
        </LoadingButton>
      </div>
    </div>
  );
}
