function cloneCss(from, to) {
	const styles = window.getComputedStyle(from);
	const css = {};

	for (let i = 0; i < styles.length; i++) {
		const prop = styles[i];
		css[prop] = styles.getPropertyValue(prop);
	}

	jQuery(to).css(css);
}


jQuery(document).ready(() => {
    /**
   * Integrate with YayExtra product total
   */
  if (!window.wp?.hooks?.addFilter) {
    return;
  }

  const { __ } = window.wp.i18n;
  const {wholesale_role: wholesaleRole, is_discounted: isDiscounted, currency_rate: currencyRate, regular_price:regularPrice, price: salePrice } = window.yayWholesaleExtra;

  if (jQuery(".yayextra-total-price") && wholesaleRole) {
    let defaultHtml = jQuery(".yayextra-total-price").html();
    let appendHtml = "<br/>"
    appendHtml +=  `<span class="total-price-title">${__("Total wholesale price:")}</span>`;
    appendHtml +=  `<span id="ywhs-extra-total-price"></span`;
    jQuery(".yayextra-total-price").html(defaultHtml + appendHtml);
    cloneCss(jQuery(".total-price")[0], jQuery('#ywhs-extra-total-price')[0]);
  }

  window.wp.hooks.addFilter(
    "yaye_total_price_hook",
    "ywhs",
    function (html, quantityProduct, totalPriceOriginalData) {
      console.log(totalPriceOriginalData);
        let optionExtra = parseFloat(totalPriceOriginalData.total_options_original) * currencyRate;
        let linkedProductExtra = parseFloat(totalPriceOriginalData.total_linked_product_original) * currencyRate;
        
        let base = (wholesaleRole['applyToSalePrice'] && salePrice < regularPrice) ? parseFloat(salePrice) : parseFloat(regularPrice);
        let totalUnit = base + optionExtra + linkedProductExtra;
        let total;
        if (isDiscounted === "1" && wholesaleRole) {
            let discount = wholesaleRole['discount'] ? (wholesaleRole['discount']/100) : 0;
            total = Math.max(0, totalUnit * (1 - discount)) * parseInt(quantityProduct);
        }
        else {
            total = totalUnit * parseInt(quantityProduct);
        }
        jQuery("#ywhs-extra-total-price").text(parseWPCurrency(total));

        return html;
    }
  );
})