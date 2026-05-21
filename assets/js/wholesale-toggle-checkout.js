(function ($) {
  "use strict";

  let isSubscribed = false;

  const initWholesaleToggle = () => {
    if (typeof wp === "undefined" || typeof wp.data === "undefined") {
      console.warn("wp.data is not available");
      return;
    }

    const { select } = wp.data;
    const wholesaleRole = window.ywhsToggleCheckout?.wholesale;
    const priceMap = window.ywhsToggleCheckout?.priceMap;
    const extraCheckoutEls = window.ywhsToggleCheckout?.checkoutElements ?? [];

    if (!wholesaleRole) return;

    const checkoutEls = [
      $(".wp-block-woocommerce-proceed-to-checkout-block"),
      $(".wc-block-components-checkout-place-order-button"),
      $("a.checkout"),
      ...extraCheckoutEls.map((el) => $(el)),
    ];

    const checkRequirements = () => {
      try {
        const cart = select("wc/store/cart").getCartData?.();
        if (!cart || !cart.items) return;

        let subtotal = 0;
        let quantity = 0;

        cart.items.forEach((item) => {
          quantity += item.quantity || 0;
          const price = priceMap?.[item.key] || item.prices?.price || 0;
          subtotal += price * (item.quantity || 0);
        });

        const shouldShow =
          quantity >= (wholesaleRole.minOrderQuantity || 0) &&
          subtotal >= (wholesaleRole.minOrderAmount || 0);

        checkoutEls.forEach((ce) => {
          if (shouldShow) {
            ce.show();
          } else {
            ce.hide();
          }
        });
      } catch (e) {
        console.error("Error checking cart requirements:", e);
      }
    };

    // Subscribe to WooCommerce Blocks store (for Blocks-based cart)
    if (!isSubscribed) {
      wp.data.subscribe(checkRequirements);
      isSubscribed = true;
    }

    // Run immediately
    checkRequirements();

    // Re-run after delay
    setTimeout(checkRequirements, 600);
  };

  // ====================== RUN ON PAGE LOAD ======================
  $(document).ready(initWholesaleToggle);

  // ====================== AJAX EVENTS (Mini Cart) ======================
  $(document.body).on(
    "wc_fragments_refreshed wc_fragments_loaded added_to_cart removed_from_cart updated_cart_totals woocommerce_update_cart",
    function () {
      setTimeout(initWholesaleToggle, 150);
    }
  );
})(jQuery);
