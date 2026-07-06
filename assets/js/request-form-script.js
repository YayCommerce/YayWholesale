jQuery(document).ready(() => {
    const { __, sprintf } = window.wp.i18n;

    jQuery(".ywhs_request_form_error").hide();

    const clearAttachmentFieldError = ($attachment) => {
        $attachment.removeClass("ywhs_registration_form_attachment--invalid");
        $attachment.find(".ywhs_registration_form_field_error").attr("hidden", true).text("");
    };

    const setAttachmentFieldError = ($attachment, message) => {
        $attachment.addClass("ywhs_registration_form_attachment--invalid");
        $attachment.find(".ywhs_registration_form_field_error").removeAttr("hidden").text(message);
    };

    const getFileExtension = (fileName) => {
        const parts = fileName.split(".");

        if (parts.length < 2) {
            return "";
        }

        return parts.pop().toLowerCase();
    };

    const validateAttachmentField = ($attachment) => {
        const $input = $attachment.find(".ywhs_registration_form_file_input");
        const file = $input[0]?.files?.[0];
        const maxFileSizeMb = parseFloat($attachment.data("maxFileSize"));
        const allowedExtensions = $attachment.data("allowedExtensions") || [];

        clearAttachmentFieldError($attachment);

        if (!file) {
            return true;
        }

        const extension = getFileExtension(file.name);

        if (!allowedExtensions.includes(extension)) {
            setAttachmentFieldError(
                $attachment,
                __("The selected file type is not allowed.", "yay-wholesale-b2b")
            );
            return false;
        }

        if (!Number.isNaN(maxFileSizeMb) && file.size > maxFileSizeMb * 1024 * 1024) {
            setAttachmentFieldError(
                $attachment,
                sprintf(
                    /* translators: %s: maximum file size in megabytes */
                    __("The selected file must be smaller than %s MB.", "yay-wholesale-b2b"),
                    maxFileSizeMb
                )
            );
            return false;
        }

        return true;
    };

    const validateAttachmentFields = ($form) => {
        let isValid = true;

        $form.find(".ywhs_registration_form_attachment").each(function () {
            if (!validateAttachmentField(jQuery(this))) {
                isValid = false;
            }
        });

        return isValid;
    };

    const showFormError = ($form, message) => {
        $form.siblings(".ywhs_request_form_error").show();
        $form.siblings(".ywhs_request_form_error").find(".ywhs_form_error_msg").text(message);
    };

    const hideFormError = ($form) => {
        $form.siblings(".ywhs_request_form_error").hide();
    };

    jQuery(document).on("change", ".ywhs_registration_form_file_input", function () {
        const $attachment = jQuery(this).closest(".ywhs_registration_form_attachment");
        const fileName = this.files?.[0]?.name || __("No file chosen", "yay-wholesale-b2b");

        $attachment.find(".ywhs_registration_form_file_name").text(fileName);
        validateAttachmentField($attachment);
    });

    jQuery("#ywhs_request_form").on("submit", function (e) {
        e.preventDefault();

        const $form = jQuery(this);
        const formElement = this;
        const { restRoot, restBase, restNonce } = window.yayWholesaleB2BMeta.wpMeta;

        hideFormError($form);
        $form.find(".ywhs_registration_form_attachment").each(function () {
            clearAttachmentFieldError(jQuery(this));
        });

        if (!formElement.checkValidity()) {
            formElement.reportValidity();
            return;
        }

        if (!validateAttachmentFields($form)) {
            const firstError = $form.find(".ywhs_registration_form_field_error:not([hidden])").first().text();

            if (firstError) {
                showFormError($form, firstError);
            }

            return;
        }

        const formData = new FormData(formElement);
        const $submitButton = $form.find("button[type='submit']");

        $submitButton.css("opacity", "0.5");
        $submitButton.attr("disabled", "disabled");

        jQuery.ajax({
            url: `${restRoot}${restBase}/requests`,
            type: "POST",
            beforeSend(xhr) {
                xhr.setRequestHeader("X-WP-Nonce", restNonce);
            },
            data: formData,
            processData: false,
            contentType: false,
            success: () => {
                jQuery("#ywhs_success_notice").show();
                $form.hide();
                hideFormError($form);
            },
            error: (jqXHR) => {
                $submitButton.removeAttr("disabled");
                $submitButton.css("opacity", "1");

                const defaultMsg = __("Unexpected Error Occured", "yay-wholesale-b2b");

                try {
                    const data = JSON.parse(jqXHR.responseText);
                    showFormError($form, data.message ? data.message : defaultMsg);
                } catch {
                    showFormError($form, defaultMsg);
                }
            },
        });
    });

    jQuery("#ywhs_form_fields_container textarea").on("input", function () {
        this.style.height = "auto";
        this.style.height = `${this.scrollHeight}px`;
    });
});

const parseWPCurrency = (price) => {
    if (typeof price === "string") {
        price = parseFloat(price);
    }

    const { symbol, position, thousand_sep, decimal_sep, num_decimals } =
        window.yayWholesaleB2BMeta.wcMeta.currency_data;

    const formattedPrice = price
        .toFixed(num_decimals)
        .replace(/\B(?=(\d{3})+(?!\d))/g, thousand_sep)
        .replace(/(\d+)\.(\d{2})$/, `$1${decimal_sep}$2`);

    switch (position) {
        case "left":
            return `${symbol}${formattedPrice}`;
        case "right":
            return `${formattedPrice}${symbol}`;
        case "left_space":
            return `${symbol} ${formattedPrice}`;
        case "right_space":
            return `${formattedPrice} ${symbol}`;
    }
};
