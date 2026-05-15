(function ($) {
  ("use strict");
  $(document).ready(() => {
    productBasedBehavioursSetting();

    $(document).on(
      "woocommerce_variations_loaded",
      productBasedBehavioursSetting
    );
    $(document).on(
      "woocommerce_variations_saved",
      productBasedBehavioursSetting
    );
  });

  // Product-based behaviors
  function productBasedBehavioursSetting() {
    // Toggle the Inputs by Discount mode
    $(".ywhs_product_based_discount_mode").each((index, el) => {
      const input = $(el).find("input");
      const inputs_container = $(el)
        .parent()
        .siblings(".ywhs_product_based_discount_inputs");
      if (input.is(":checked")) {
        inputs_container.show();
      } else {
        inputs_container.hide();
      }

      input.on("change", function () {
        if ($(this).is(":checked")) {
          inputs_container.slideDown(300);
        } else {
          inputs_container.slideUp(300);
        }
      });
    });

    //Toggle the value input by Discount rule
    $(".ywhs_product_based_rule_fixed, .ywhs_product_based_rule_rate").each(
      function () {
        const block = $(this);
        const radios = block.find("input[type='radio']");

        const inputsContainer = block
          .parent()
          .parent()
          .siblings(".ywhs_product_based_discount_value_inputs")
          .first();

        const fixedInput = inputsContainer.find(
          ".ywhs_product_based_discount_fixed"
        );
        const rateInput = inputsContainer.find(
          ".ywhs_product_based_discount_rate"
        );

        function toggleFields() {
          const checkedRadio = radios.filter(":checked").val();

          if (checkedRadio === "fixed") {
            fixedInput.show();
            rateInput.hide();
          }

          if (checkedRadio === "rate") {
            fixedInput.hide();
            rateInput.show();
          }
        }

        // Initial
        toggleFields();

        // On Radio checked change
        radios.on("change", toggleFields);
      }
    );

    $(".ywhs_product_based_discount_rate").on("change", function () {
      const input = $(this).find("input");
      const value = parseFloat(input.val());
      if (value > 100) {
        // if the rate is over 100 then make it 100 for maximum rate
        input.val(100);
      } else if (value % 1 !== 0) {
        // if the value has decimals then fix it to 2 decimals
        input.val(value.toFixed(2));
      }
    });
  }
})(jQuery);
