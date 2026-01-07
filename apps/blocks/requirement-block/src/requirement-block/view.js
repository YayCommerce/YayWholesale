
import { store, getConfig } from '@wordpress/interactivity';


let wcState = null;
let quantityMap = {};
const i18n = window.wp?.i18n;

const __ = i18n?.__ || ((s) => s);

const sprintf =
  i18n?.sprintf ||
  ((template, ...args) => {
    const placeholder = '__PERCENT__';
    template = template.replace(/%%/g, placeholder);
  
    template = template.replace(/%(\d+\$)?([sd])/g, (_, position, type) => {
      let val;
      if (position) {
        const index = parseInt(position.slice(0, -1), 10) - 1; // "1$" -> 0
        val = args[index];
      } else {
        val = args.shift();
      }
  
      if (type === 'd') return Number(val) ?? 0;
      return val ?? '';
    });  
    return template.replace(new RegExp(placeholder, 'g'), '%');
  }
  );

try {
  const wcStore = store(
    "woocommerce",
    {},
    {
      lock: "I acknowledge that using a private store means my plugin will inevitably break on the next store release.",
    }
  );
  wcState = wcStore?.state;

  if (! wcState.cart) {
    wcState = {
      cart : wp.data.select('wc/store/cart').getCartData(),
      restUrl: wcSettings.homeUrl + "wp-json/",
    }
  }
} catch (e) {
    console.log(e);
  // WooCommerce store not available
}

const config = getConfig("ywhs_wholesale_requirement");
const wholesaleRole = config?.wholesale ?? null;
const restBase = config?.rest_base ?? 'yay-wholesale/v1';
const currencyData = config?.currency_data ?? {
    currency: 'VND',
    symbol: '$',
    positon: '',
    thousand_sep: '.',
    decimal_sep: ',',
    num_decimals: 2
};

export function parseWPCurrency(price) {
    if (typeof price === 'string') {
      price = parseFloat(price);
    }
  
    const { symbol, position, thousand_sep, decimal_sep, num_decimals } = currencyData;
    
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

const { state } = store('ywhs_wholesale_requirement', {
    state: {
        wholesaleName: wholesaleRole.name,
        progressStyle: "width: 0",
        qtyMet: false,
        minQty: wholesaleRole.minOrderQuantity,
        count: 0,
        amountMet: false,
        subtotal: parseWPCurrency(0),
        minAmount: parseWPCurrency(wholesaleRole.minOrderAmount),
        isDiscounted: false,
        discountText: sprintf(__('%d%% Off', 'yay-wholesale'), wholesaleRole.discount)
    },
    callbacks: {
        async CheckMetRequired() {
            const cart = wcState?.cart;
            
            if (! cart) return;

            let refetch = false;
            let bodyToFetch = [];
            let actualCount = 0;

            let priceMap = localStorage.getItem("ywhs_origin_prices_map");
            if (!priceMap) {
                priceMap = {}
                refetch = true;
            }else {
                priceMap = JSON.parse(priceMap);
            }

            for (const item of cart.items) {
                if (!refetch) {
                    if (!(item.id in priceMap)) {
                        refetch = true;
                    }
                }
                bodyToFetch.push(item.id);
                quantityMap[item.id] = item.quantity;
                actualCount += item.quantity;
            }

            if (refetch) {
                const url = wcState.restUrl + restBase + "/prices";
                const nonce = window.yayWholesale.rest_nonce;
                if (!nonce) return;
                const response = await fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-WP-Nonce': nonce 
                    },
                    body: JSON.stringify({ productIds: bodyToFetch }),
                });

                if (!response.ok) return;
                
                const data = await response.json();
                priceMap = {...priceMap, ...data.data};

                localStorage.setItem("ywhs_origin_prices_map", JSON.stringify(priceMap));
            }

            let actualSubtotal = 0;
            for (const item of cart.items) {
                actualSubtotal += quantityMap[item.id] * priceMap[item.id];
            }

            let isDiscounted = actualCount >= wholesaleRole.minOrderQuantity && actualSubtotal >= wholesaleRole.minOrderAmount;
            let lackOfAmt = 0;
            let lackOfQty = 0;
            let notice = "";
            let progress = 0;

            if (isDiscounted) {
                notice = __("Great news — You’ve received the <span class='ywhs_r_notice'>wholesale price</span> 🎉", 'yay-wholesale');
                progress = 100;
            }
            else {
                lackOfAmt = wholesaleRole.minOrderAmount - actualSubtotal;
                lackOfQty = wholesaleRole.minOrderQuantity - actualCount;
                let progressOfAmt = Math.min(100, actualSubtotal / wholesaleRole.minOrderAmount * 100);
                let progressOfQty = Math.min(100, actualCount / wholesaleRole.minOrderQuantity * 100);

                progress = ((progressOfAmt + progressOfQty) / 2).toFixed(2);

                let isEmpty = true;
                let phrases = [];

                if ( lackOfQty > 0  && lackOfQty < wholesaleRole.minOrderQuantity) {
                    isEmpty  = false;
                    phrases.push(lackOfQty > 1
                    ? sprintf(__('<strong>%d products</strong>', 'yay-wholesale'), lackOfQty)
                    : __('<strong>1 product</strong>', 'yay-wholesale'));
                }

                if ( lackOfAmt > 0 && lackOfAmt < wholesaleRole.minOrderAmount) {
                    isEmpty  = false;
                    let price     = parseWPCurrency(lackOfAmt) ;
                    phrases.push(`<strong>${price}</strong>`);
                }

                if ( ! isEmpty ) {
                    let lack   = phrases.join(__(' and ', 'yay-wholesale'));
                    let sale   = wholesaleRole.discount;
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
            
            state.progressStyle= `width:${progress}%`;
            state.qtyMet = actualCount > 0  ? 'ywhs_r_notice' : '';
            state.count= actualCount;
            state.amountMet = actualSubtotal > 0  ? 'ywhs_r_notice' : '';
            state.subtotal =  parseWPCurrency(actualSubtotal);
            state.isDiscounted= isDiscounted ? 'ywhs_r_notice' : 'ywhs_r_base_notice';
            state.icon= isDiscounted ? 'ywhs_icon_discounted' : 'ywhs_icon_cart';
            jQuery('.ywhs_requirement_notice').html(notice);
            
            if (isDiscounted) {
                jQuery('.ywhs_icon_holder').html(`
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" >
					<path d="M9.85472 5.64701L5.65601 9.84737M5.65601 5.64701H5.66301M9.85472 9.84737H9.86172M2.05225 5.38105C1.95011 4.92078 1.9658 4.44216 2.09785 3.98957C2.2299 3.53698 2.47405 3.12507 2.80765 2.79203C3.14125 2.459 3.55351 2.21562 4.0062 2.08446C4.45889 1.95331 4.93735 1.93862 5.39723 2.04176C5.65034 1.64574 5.99904 1.31983 6.41118 1.09408C6.82332 0.868329 7.28563 0.75 7.7555 0.75C8.22537 0.75 8.68768 0.868329 9.09982 1.09408C9.51196 1.31983 9.86066 1.64574 10.1138 2.04176C10.5744 1.93817 11.0536 1.95279 11.507 2.08427C11.9605 2.21574 12.3733 2.4598 12.7071 2.79373C13.0409 3.12767 13.2848 3.54064 13.4163 3.99423C13.5477 4.44782 13.5623 4.92729 13.4587 5.38805C13.8546 5.64127 14.1804 5.99011 14.4061 6.40241C14.6317 6.8147 14.75 7.2772 14.75 7.74726C14.75 8.21731 14.6317 8.67981 14.4061 9.09211C14.1804 9.50441 13.8546 9.85324 13.4587 10.1065C13.5618 10.5665 13.5472 11.0452 13.4161 11.498C13.285 11.9509 13.0417 12.3633 12.7088 12.6971C12.3759 13.0308 11.9641 13.275 11.5117 13.4071C11.0593 13.5392 10.5809 13.5549 10.1208 13.4527C9.86798 13.8503 9.51901 14.1776 9.10617 14.4044C8.69333 14.6311 8.22997 14.75 7.759 14.75C7.28803 14.75 6.82466 14.6311 6.41183 14.4044C5.99899 14.1776 5.65001 13.8503 5.39723 13.4527C4.93735 13.5559 4.45889 13.5412 4.0062 13.4101C3.55351 13.2789 3.14125 13.0355 2.80765 12.7025C2.47405 12.3694 2.2299 11.9575 2.09785 11.5049C1.9658 11.0524 1.95011 10.5737 2.05225 10.1135C1.65335 9.86091 1.32477 9.51153 1.09708 9.09782C0.869396 8.68412 0.75 8.21952 0.75 7.74726C0.75 7.27499 0.869396 6.8104 1.09708 6.39669C1.32477 5.98298 1.65335 5.6336 2.05225 5.38105Z" 
					stroke="#2271B1" 
					stroke-width="1.5" 
					stroke-linecap="round" 
					stroke-linejoin="round"
					/>
				</svg>`)
            }else {
                jQuery('.ywhs_icon_holder').html(`
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M0.75 0.75H2.14721L4.00549 9.46581C4.07366 9.78501 4.25047 10.0704 4.50549 10.2727C4.76051 10.4751 5.07778 10.5818 5.40269 10.5746H12.235C12.553 10.5741 12.8613 10.4646 13.109 10.2643C13.3567 10.064 13.5289 9.78478 13.5973 9.47283L14.75 4.25878H2.89471M5.60543 14.0482C5.60543 14.4358 5.29265 14.75 4.90682 14.75C4.521 14.75 4.20822 14.4358 4.20822 14.0482C4.20822 13.6607 4.521 13.3465 4.90682 13.3465C5.29265 13.3465 5.60543 13.6607 5.60543 14.0482ZM13.2901 14.0482C13.2901 14.4358 12.9773 14.75 12.5915 14.75C12.2056 14.75 11.8929 14.4358 11.8929 14.0482C11.8929 13.6607 12.2056 13.3465 12.5915 13.3465C12.9773 13.3465 13.2901 13.6607 13.2901 14.0482Z" 
                    stroke="#2271B1" 
                    stroke-width="1.5" 
                    stroke-linecap="round" 
                    stroke-linejoin="round"/>
                </svg>
                `);
            }


            
        }
    }
})
