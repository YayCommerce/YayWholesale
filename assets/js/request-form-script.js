jQuery(document).ready(() => {
    jQuery("#ywhs_request_form").on("submit", function (e) {
        e.preventDefault();

        var formData = jQuery(this).serialize();
        var yayWholesale = window.yayWholesale;

        var inputs = jQuery("#ywhs_request_form input");

        let isError = false
        for(var i = 0; i<inputs.length; i++){
            if (!jQuery(inputs[i]).val().trim()) {
                let id = jQuery(inputs[i]).attr("id");
                jQuery(`#${id}_error`).show();
                if (!isError) {
                    jQuery(inputs[i]).trigger("focus");
                    isError = true;
                }
            }
        }

        if (isError) return;

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
                jQuery("#ywhs_request_form button[type='submit']").attr("disabled", "");
            }
        })
    });

    jQuery("#ywhs_request_form input").on("focus", function(e) {
        jQuery(this).siblings(".input-error").hide();
    })
}) 