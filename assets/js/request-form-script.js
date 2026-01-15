jQuery(document).ready(() => {
    jQuery(".ywhs_request_form_error").hide();

    jQuery("#ywhs_request_form").on("submit", function (e) {
        e.preventDefault();
        const {__} = window.wp.i18n;

        var formData = jQuery(this).serialize();
        var yayWholesale = window.yayWholesale;

        jQuery("#ywhs_request_form button[type='submit']").css('opacity', '0.5');

        jQuery("#ywhs_request_form button[type='submit']").attr("disabled", "disabled");

        jQuery.ajax({
            url: `${yayWholesale.rest_url}${yayWholesale.rest_base}/requests`, 
            type: 'POST',
            beforeSend: function(xhr) {
                if (!yayWholesale || !yayWholesale.rest_nonce)
                    return;

                xhr.setRequestHeader('X-WP-Nonce', yayWholesale.rest_nonce);
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