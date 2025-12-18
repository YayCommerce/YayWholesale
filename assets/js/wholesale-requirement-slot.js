const { __ } = window.wp.i18n;
const { registerPlugin } = window.wp.plugins;
const { createElement, useMemo } = window.wp.element;
const { ExperimentalOrderMeta } = window.wc.blocksCheckout;
const { useSelect } = window.wp.data;

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

const render = () => {
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
                ? __('<strong>%LOQ% products</strong>', 'yay-wholesale').replace('%LOQ%', lackOfQty)
                : __('<strong>1 product</strong>', 'yay-wholesale'));
            }

            if ( lackOfAmt > 0 ) {
                isEmpty  = false;
                price     = parseWPCurrency(lackOfAmt) ;
                phrases.push(__('<strong>%LOA%</strong>').replace("%LOA%", price));
            }

            if ( ! isEmpty ) {
                let lack   = phrases.join(__(' and ', 'yay-wholesale'));
                let sale   = wholesale.discount;
                notice = __("You're almost there! Add %LACK% more to your order and enjoy <span class='ywhs_r_notice'>%SALE%% Off </span> each products.", 'yay-wholesale');
                notice = notice.replace('%LACK%', lack).replace('%SALE%', sale )
            } else {
                notice = __('Please add items to your cart to receive wholesale pricing.', 'yay-wholesale');
            }
        }
        

        return {notice, progress, lackOfQty, lackOfAmt, actualSubtotal, actualCount, isDiscounted};
    }, [cart]);

    return createElement(
        ExperimentalOrderMeta,
        null,
        createElement(
            'div',
            { className: 'ywhs_requirement_section' },

            // Header
            createElement(
                'div',
                { className: 'ywhs_requirement_header' },
                createElement(
                    'div',
                    { className: 'ywhs_requirement_title' },
                    createElement(
                        'span',
                        null,
                        __('Wholesale Requirement', 'yay-wholesale')
                    )," ",
                    createElement(
                        'span',
                        { className: 'ywhs_badge' },
                        wholesale.name
                    )
                ),
                createElement(
                    'div',
                    { className: 'ywhs_requirement_opener ywhs_rclosed' }
                )
            ),

            // Progress bar
            createElement(
                'div',
                { className: 'ywhs_requirement_progress_bar' },
                createElement(
                    'div',
                    { className: 'ywhs_requirement_notice' },
                    createElement('span', {
                        dangerouslySetInnerHTML: { __html: notice }
                    })
                ),
                createElement(
                    'div',
                    { className: 'ywhs_r_base_bar' },
                    createElement(
                        'div',
                        {
                            className: 'ywhs_r_value_bar',
                            style: { width: `${progress}%` }
                        }
                    )
                )
            ),

            // Content
            createElement(
                'div',
                {
                    className: 'ywhs_requirement_content',
                    style: { display: 'none' }
                },

                // Min order quantity
                createElement(
                    'div',
                    { className: 'ywhs_requirement_item' },
                    createElement(
                        'span',
                        null,
                        __('Min order quantity:', 'yay-wholesale')
                    ),
                    createElement(
                        'span',
                        { className: 'ywhs_r_base_notice' },
                        createElement(
                            'span',
                            {
                                className:
                                    lackOfQty <= 0 ? 'ywhs_r_notice' : ''
                            },
                            actualCount
                        ),
                        ` /${wholesale.minOrderQuantity}`
                    )
                ),

                // Min order amount
                createElement(
                    'div',
                    { className: 'ywhs_requirement_item' },
                    createElement(
                        'span',
                        null,
                        __('Min order amount:', 'yay-wholesale')
                    ),
                    createElement(
                        'span',
                        { className: 'ywhs_r_base_notice' },
                        createElement(
                            'span',
                            {
                                className:
                                    lackOfAmt <= 0 ? 'ywhs_r_notice' : ''
                            },
                            parseWPCurrency(actualSubtotal)
                        ),
                        ' /',
                        parseWPCurrency(wholesale.minOrderAmount)    
                    )
                ),

                // Discount
                createElement(
                    'div',
                    { className: 'ywhs_requirement_item' },
                    createElement(
                        'span',
                        null,
                        __('Get discount:', 'yay-wholesale')
                    ),
                    createElement(
                        'div',
                        {
                            className: isDiscounted
                                ? 'ywhs_r_notice'
                                : 'ywhs_r_base_notice'
                        },
                        __(
                            '%DISCOUNT%% Off',
                            'yay-wholesale'
                        ).replace('%DISCOUNT%', wholesale.discount)
                    )
                )
            )
        )
    );
};

registerPlugin('ywhs-wholesale-requirement', {
    render,
    scope: 'woocommerce-checkout',
});
