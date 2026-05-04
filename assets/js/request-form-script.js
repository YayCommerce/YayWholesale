jQuery(document).ready(() => {
    jQuery(".ywhs_request_form_error").hide();

    jQuery("#ywhs_request_form").on("submit", function (e) {
        e.preventDefault();
        const {__} = window.wp.i18n;
        const formData = jQuery(this).serialize();
        const {restRoot, restBase, restNonce} = window.yayWholesaleB2BMeta.wpMeta;

        jQuery("#ywhs_request_form button[type='submit']").css('opacity', '0.5');

        jQuery("#ywhs_request_form button[type='submit']").attr("disabled", "disabled");

        jQuery.ajax({
            url: `${restRoot}${restBase}/requests`, 
            type: 'POST',
            beforeSend: function(xhr) {
                xhr.setRequestHeader('X-WP-Nonce', restNonce);
              },
            data: formData,
            success: (response) => {
                    jQuery("#ywhs_success_notice").show();
                    jQuery("#ywhs_request_form").hide();
                    jQuery(this).siblings(".ywhs_request_form_error").hide();
            },
            error: (jqXHR, textStatus, errorThrown) => {
                jQuery("#ywhs_request_form button[type='submit']").removeAttr("disabled");
                jQuery("#ywhs_request_form button[type='submit']").css('opacity', '1');
                jQuery(this).siblings(".ywhs_request_form_error").show();
                const defautMsg  = __("Unexpected Error Occured", "yay-wholesale-b2b");
                try {
                    data = JSON.parse(jqXHR.responseText);
                    jQuery(this).siblings(".ywhs_request_form_error").find(".ywhs_form_error_msg").text(data.message ? data.message : defautMsg);
                }
                catch {
                    jQuery(this).siblings(".ywhs_request_form_error").find(".ywhs_form_error_msg").text(defautMsg);
                }
            }
        })
    });

    jQuery("#ywhs_form_fields_container textarea").on("input", function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    })
})

const parseWPCurrency = (price) => {
    if (typeof price === 'string') {
      price = parseFloat(price);
    }
  
    const { symbol, position, thousand_sep, decimal_sep, num_decimals } =
      window.yayWholesaleB2BMeta.wcMeta.currency_data;
  
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