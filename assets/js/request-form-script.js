jQuery(document).ready(() => {
    jQuery("#ywhs_request_form").on("submit", function (e) {
        e.preventDefault();

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
            },
            error: (jqXHR, textStatus, errorThrown) => {
                alert("Failed");
                jQuery("#ywhs_request_form button[type='submit']").removeAttr("disabled");
                jQuery("#ywhs_request_form button[type='submit']").css('opacity', '1');
            }
        })
    });

    jQuery("#ywhs_form_fields_container textarea").on("input", function() {
        this.style.height = 'auto';
        this.style.height = this.scrollHeight + 'px';
    })
}) 