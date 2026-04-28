import { __ } from '@wordpress/i18n';
import { ShoppingCart } from 'lucide-react';

import { cn } from '@/lib/utils';

function ProductImageSkeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('bg-muted relative h-62.5 w-62.5 rounded-md', className)}
      {...props}
    >
      <div className="absolute top-2.5 left-2.5 h-6 w-fit rounded-xs bg-white px-[9px] py-[3px] font-semibold text-[#B6BFCC]">
        {__('Sale', 'yay-wholesale-b2b')}
      </div>

      <div className="absolute top-22.5 left-[89.61px] h-[32.58px] w-[32.58px] rounded-full bg-white" />

      <svg
        width="100"
        height="73"
        viewBox="0 0 100 73"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-[117.6px] left-20"
      >
        <path
          d="M98.4347 45.6518L83.3501 10.3742C80.6031 3.91624 76.5067 0.25354 71.8319 0.0125727C67.2054 -0.228395 62.7234 3.00057 59.3016 9.16933L50.1449 25.6033C48.2171 29.0732 45.4701 31.1455 42.4821 31.3865C39.4459 31.6757 36.4098 30.0853 33.9519 26.9527L32.8916 25.6033C29.4699 21.3141 25.2289 19.2418 20.8915 19.6755C16.5541 20.1092 12.8432 23.0972 10.3853 27.9648L2.04785 44.5915C-0.940144 50.6157 -0.650983 57.6037 2.86714 63.2906C6.38526 68.9774 12.5058 72.3991 19.2047 72.3991H80.6995C87.1574 72.3991 93.1816 69.1702 96.7479 63.7725C100.411 58.3748 100.989 51.5796 98.4347 45.6518Z"
          fill="white"
        />
      </svg>
    </div>
  );
}

function AddToCartSkeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        'bg-muted flex h-8.5 w-34 items-center justify-center gap-1.5 rounded-md py-2',
        className,
      )}
      {...props}
    >
      <svg
        width="15"
        height="17"
        viewBox="0 0 15 17"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M5.0175 16.6667C4.44333 16.6667 3.97166 16.2 3.97166 15.625C3.97166 15.05 4.43416 14.5833 5.00916 14.5833H5.0175C5.5925 14.5833 6.05916 15.05 6.05916 15.625C6.05916 16.2 5.5925 16.6667 5.0175 16.6667ZM12.7258 15.625C12.7258 15.05 12.2592 14.5833 11.6842 14.5833H11.6758C11.1008 14.5833 10.6383 15.05 10.6383 15.625C10.6383 16.2 11.1092 16.6667 11.6842 16.6667C12.2592 16.6667 12.7258 16.2 12.7258 15.625ZM14.9666 5.09167L14.125 10.2417C13.9083 11.425 13.4167 12.2917 11.6667 12.2917H4.77498C3.94165 12.2917 3.24167 11.6833 3.125 10.8583L1.87419 2.15167C1.79919 1.62667 1.36584 1.25 0.841675 1.25H0.625C0.28 1.25 0 0.97 0 0.625C0 0.28 0.28 0 0.625 0H0.841675C1.99417 0 2.94836 0.828332 3.11086 1.97L3.28501 3.125H13.3333C14.3667 3.125 15.1583 4.06667 14.9666 5.09167ZM10.4225 6.155C10.1783 5.91083 9.78254 5.91083 9.53837 6.155L7.75747 7.935L7.08832 7.26583C6.84415 7.02166 6.44829 7.02166 6.20412 7.26583C5.95996 7.50999 5.95996 7.90583 6.20412 8.15L7.31496 9.26084C7.43246 9.37834 7.59082 9.44416 7.75665 9.44416C7.92249 9.44416 8.08168 9.37834 8.19834 9.26084L10.4208 7.03833C10.6667 6.795 10.6666 6.39917 10.4225 6.155Z"
          fill="white"
        />
      </svg>

      <div className="h-2 w-12.5 rounded-[6px] bg-white" />
    </div>
  );
}

export { ProductImageSkeleton, AddToCartSkeleton };
