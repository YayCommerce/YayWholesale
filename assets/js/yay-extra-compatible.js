(function ($) {
  function cloneCss(from, to) {
    const styles = window.getComputedStyle(from);
    const css = {};

    for (let i = 0; i < styles.length; i++) {
      const prop = styles[i];
      css[prop] = styles.getPropertyValue(prop);
    }

    $(to).css(css);
  }

  ("use strict");
  $(document).ready(() => {
    /**
     * Integrate with YayExtra product total
     */
    if (!window.wp?.hooks?.addFilter) {
      return;
    }

    const { __ } = window.wp.i18n;
    const {
      wholesale_role: wholesaleRole,
      // is_discounted: isDiscounted,
      product_type: productType,
      currency_rate: currencyRate,
      regular_prices: regularPrices,
      sale_prices: salePrices,
      tax_enabled: taxEnabled,
      prices_include_tax: priceIncludeTax,
      tax_display_shop: taxDisplayShop,
      tax_rate: taxRate,
      discount_data: discountData,
    } = window.yayWholesaleExtra;

    if ($(".yayextra-total-price") && wholesaleRole) {
      let defaultHtml = $(".yayextra-total-price").html();
      let appendHtml = "<br/>";
      appendHtml += `<span class="total-price-title">${__(
        "Total wholesale price:"
      )}</span>`;
      appendHtml += `<span id="ywhs-extra-total-price"></span`;
      $(".yayextra-total-price").html(defaultHtml + appendHtml);
      cloneCss($(".total-price")[0], $("#ywhs-extra-total-price")[0]);
    }

    window.wp.hooks.addFilter(
      "yaye_total_price_hook",
      "ywhs",
      function (html, quantityProduct, totalPriceOriginalData) {
        let productIds = [];

        if (!wholesaleRole) return;

        if (productType !== "grouped") {
          productIds[0] = 0;
          if (
            $('button[name="add-to-cart"').length &&
            "" != $('button[name="add-to-cart"').val()
          ) {
            // regular product
            productIds[0] = parseInt($('button[name="add-to-cart"').val());
          } else if (
            $('input[name="variation_id"').length &&
            "" != $('input[name="variation_id"').val()
          ) {
            // variation product
            productIds[0] = parseInt($('input[name="variation_id"').val());
          }
        } else {
          productIds = Object.keys(regularPrices);
        }

        let optionExtra =
          parseFloat(totalPriceOriginalData.total_options_original) *
          currencyRate;
        let linkedProductExtra =
          parseFloat(
            totalPriceOriginalData.total_linked_product_original ?? 0
          ) * currencyRate;

        // Pricing handle
        let total = 0;
        productIds.forEach((productId) => {
          let quantity;
          if (productType !== "grouped") {
            quantity = parseInt(quantityProduct);
          } else {
            quantity =
              $(`#product-${productId} input[type=number]`).val() ?? "0";
            quantity = parseInt(quantity == "" ? "0" : quantity);
          }

          // Handle Wholesale price
          let productTotal = 0;
          if (productId > 0) {
            if (discountData[productId].wholesale_discount_type === "rate") {
              productTotal =
                wholesaleRole &&
                wholesaleRole["applyToSalePrice"] &&
                salePrices[productId] > 0
                  ? parseFloat(productId > 0 ? salePrices[productId] : 0)
                  : parseFloat(productId > 0 ? regularPrices[productId] : 0);
              let discount =
                parseFloat(discountData[productId].wholesale_discount_value) /
                100;
              productTotal = Math.max(0, productTotal * (1 - discount));
            } else {
              productTotal =
                parseFloat(discountData[productId].wholesale_discount_value) *
                currencyRate;
            }
          }

          // Handle Extra Price
          if (productTotal != 0) {
            let extraTotal = optionExtra + linkedProductExtra;
            let discount = wholesaleRole["discount"]
              ? wholesaleRole["discount"] / 100
              : 0;
            extraTotal = Math.max(0, extraTotal * (1 - discount));

            //Handle total price
            let unitTotal = productTotal + extraTotal;
            let finalProductTotal = unitTotal * quantity;

            // Excluding / Including tax - shop display mode
            if (taxEnabled === "1" && parseFloat(taxRate) > 0) {
              rate = parseFloat(taxRate) / 100;

              if (priceIncludeTax === "1" && taxDisplayShop === "excl") {
                finalProductTotal = finalProductTotal / (1 + rate);
              }

              if (priceIncludeTax !== "1" && taxDisplayShop === "incl") {
                finalProductTotal = finalProductTotal * (1 + rate);
              }
            }

            total += finalProductTotal;
          }
        });
        $("#ywhs-extra-total-price").text(parseWPCurrency(total));

        return html;
      }
    );
  });
})(jQuery);
