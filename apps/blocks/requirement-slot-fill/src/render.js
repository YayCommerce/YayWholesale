import { sprintf, __ } from  "@wordpress/i18n";
import { useMemo } from "@wordpress/element";
import { useSelect } from "@wordpress/data";

const { ExperimentalOrderMeta } = window.wc.blocksCheckout;

const parseWPCurrency = (price) => {
    if (typeof price === 'string') {
      price = parseFloat(price);
    }
  
    const { symbol, position, thousand_sep, decimal_sep, num_decimals } =
      window.ywhsRequirement.currency_data;
  
    const formattedPrice = price
      .toFixed(num_decimals)
      .replace(/\B(?=(\d{3})+(?!\d))/g, thousand_sep)
      .replace(/(\d+)\.(\d{2})$/, `$1${decimal_sep}$2`);
  
    switch (position) {
      case 'left':
        return `${symbol}${formattedPrice}`;
      case 'right':
        return `${formattedPrice}${symbol}`;
      case 'left_space':
        return `${symbol} ${formattedPrice}`;
      case 'right_space':
        return `${formattedPrice} ${symbol}`;
    }
  }

const Render = () => {
    const {
        wholesale,
        minAmountPrice,
        priceMap
    } = window.ywhsRequirement;

    const { cart, isLoading } = useSelect(
        (select) => {
          const store = select('wc/store/cart');
    
          return {
            cart: store.getCartData(),
            isLoading: !store.hasFinishedResolution('getCartData'),
          };
        },
        []
    );

    const {notice, progress, lackOfQty, lackOfAmt, actualSubtotal, actualCount, isDiscounted } = useMemo(() => {
        let actualCount = cart.itemsCount;
        let actualSubtotal = 0;
        
        cart.items.forEach(item => {
            actualSubtotal += item.quantity * priceMap[item.id];
        });

        let isDiscounted = actualCount >= wholesale.minOrderQuantity && actualSubtotal >= wholesale.minOrderAmount;
        let lackOfAmt = 0;
        let lackOfQty = 0;
        let notice = "";
        let progress = 0;

        if (isDiscounted) {
            notice = __("Great news — You’ve received the <span class='ywhs_r_notice'>wholesale price</span> 🎉", 'yay-wholesale');
            progress = 100;
        }
        else {
            lackOfAmt = wholesale.minOrderAmount - actualSubtotal;
            lackOfQty = wholesale.minOrderQuantity - actualCount;
            let progressOfAmt = Math.min(100, actualSubtotal / wholesale.minOrderAmount * 100);
            let progressOfQty = Math.min(100, actualCount / wholesale.minOrderQuantity * 100);

            progress = ((progressOfAmt + progressOfQty) / 2).toFixed(2);

            let isEmpty = true;
            let phrases = [];

            if ( lackOfQty > 0 ) {
                isEmpty  = false;
                phrases.push(lackOfQty > 1
                ? sprintf(__('<strong>%d products</strong>', 'yay-wholesale'), lackOfQty)
                : __('<strong>1 product</strong>', 'yay-wholesale'));
            }

            if ( lackOfAmt > 0 ) {
                isEmpty  = false;
                let price     = parseWPCurrency(lackOfAmt) ;
                phrases.push(`<strong>${price}</strong>`);
            }

            if ( ! isEmpty ) {
                let lack   = phrases.join(__(' and ', 'yay-wholesale'));
                let sale   = wholesale.discount;
                /* translators: 1: amount remaining, 2: discount percentage */
                notice = sprintf(
                    __(
                        "You're almost there! Add %1$s more to your order and enjoy <span class='ywhs_r_notice'>%2$d%% Off</span> each product.",
                        'yay-wholesale'
                    ),
                    lack,
                    sale
                );
            } else {
                notice = __('Please add items to your cart to receive wholesale pricing.', 'yay-wholesale');
            }
        }
        

        return {notice, progress, lackOfQty, lackOfAmt, actualSubtotal, actualCount, isDiscounted};
    }, [cart]);

    return (
        <ExperimentalOrderMeta>
            <div className="ywhs_requirement_section">
    
                {/* Header */}
                <div className="ywhs_requirement_header">
                    <div className="ywhs_requirement_title">
                        <span>{__('Wholesale Requirement', 'yay-wholesale')}</span>{' '}
                        <span className="ywhs_badge">{wholesale.name}</span>
                    </div>
                    <div className="ywhs_requirement_opener ywhs_rclosed"></div>
                </div>
    
                {/* Progress bar */}
                <div className="ywhs_requirement_progress_bar">
                    <div className="ywhs_requirement_notice">
                        <span dangerouslySetInnerHTML={{ __html: notice }} />
                    </div>
                    <div className="ywhs_r_base_bar">
                        <div
                            className="ywhs_r_value_bar"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
    
                {/* Content */}
                <div
                    className="ywhs_requirement_content"
                    style={{ display: 'none' }}
                >
                    {/* Min order quantity */}
                    <div className="ywhs_requirement_item">
                        <span>{__('Min order quantity:', 'yay-wholesale')}</span>
                        <span className="ywhs_r_base_notice">
                            <span className={lackOfQty <= 0 ? 'ywhs_r_notice' : ''}>
                                {actualCount}
                            </span>
                            /{wholesale.minOrderQuantity}
                        </span>
                    </div>
    
                    {/* Min order amount */}
                    <div className="ywhs_requirement_item">
                        <span>{__('Min order amount:', 'yay-wholesale')}</span>
                        <span className="ywhs_r_base_notice">
                            <span className={lackOfAmt <= 0 ? 'ywhs_r_notice' : ''}>
                                {parseWPCurrency(actualSubtotal)}
                            </span>
                            /{parseWPCurrency(wholesale.minOrderAmount)}
                        </span>
                    </div>
    
                    {/* Discount */}
                    <div className="ywhs_requirement_item">
                        <span>{__('Get discount:', 'yay-wholesale')}</span>
                        <div
                            className={isDiscounted ? 'ywhs_r_notice' : 'ywhs_r_base_notice'}
                        >
                            {sprintf(__('%d%% Off', 'yay-wholesale'), wholesale.discount)}
                        </div>
                    </div>
                </div>
    
            </div>
        </ExperimentalOrderMeta>
    );
};

export default Render;