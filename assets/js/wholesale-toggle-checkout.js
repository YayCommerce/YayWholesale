window.addEventListener("load", function () {
  if (typeof wp === "undefined" || typeof wp.data === "undefined") {
    console.warn("wp.data is not available");
    return;
  }

  const { select } = wp.data;
  const wholesaleRole = window.ywhsToggleCheckout?.wholesale;
  const priceMap = window.ywhsToggleCheckout?.priceMap;
  const extraCheckoutEls = window.ywhsToggleCheckout?.checkoutElements ?? [];

  if (!wholesaleRole) {
    return;
  }

  const checkoutEls = [
    jQuery(".wp-block-woocommerce-proceed-to-checkout-block"),
    jQuery(".wc-block-components-checkout-place-order-button"),
    jQuery("a.checkout"),
    ...extraCheckoutEls.map((el) => jQuery(el)),
  ];

  let isSubscribed = false;

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

      if (shouldShow) {
        checkoutEls.forEach((ce) => {
          ce.css("display", "block");
        });
      } else {
        checkoutEls.forEach((ce) => {
          ce.css("display", "none");
        });
      }
    } catch (e) {
      console.error("Error checking cart requirements:", e);
    }
  };

  if (!isSubscribed) {
    wp.data.subscribe(checkRequirements);
    isSubscribed = true;

    setTimeout(checkRequirements, 800);
  }
});
