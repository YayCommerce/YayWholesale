jQuery(document).ready(() => {
    jQuery(".ywhs_request_form_error").hide();

    jQuery("#ywhs_request_form").on("submit", function (e) {
        e.preventDefault();
        const {__} = window.wp.i18n;

        var formData = jQuery(this).serialize();
        var yayWholesaleB2B = window.yayWholesaleB2B;

        jQuery("#ywhs_request_form button[type='submit']").css('opacity', '0.5');

        jQuery("#ywhs_request_form button[type='submit']").attr("disabled", "disabled");

        jQuery.ajax({
            url: `${yayWholesaleB2B.rest_url}${yayWholesaleB2B.rest_base}/register-request`, 
            type: 'POST',
            beforeSend: function(xhr) {
                if (!yayWholesaleB2B || !yayWholesaleB2B.rest_nonce)
                    return;

                xhr.setRequestHeader('X-WP-Nonce', yayWholesaleB2B.rest_nonce);
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
      window.yayWholesaleB2B.currency_data;
  
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