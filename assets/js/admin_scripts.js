(function ($) {
  ("use strict");

  // #region Custom Pricing (Category-based, Product-based)
  $(document).ready(() => {
    const handler = () => {
      const allLoaded = checkRequiredElementsLoaded([
        ".ywhs_wholesale_rules",
        ".ywhs_discount_rule_default",
        ".ywhs_discount_rule_custom",
        ".ywhs_discount_type_switch",
      ]);

      if (!allLoaded) return;

      generalCustomPricingSetting();
      discountTypePricingSetting();
    };

    $(document).on(
      "woocommerce_variations_loaded woocommerce_variations_saved",
      handler
    );

    handler();
  });

  // general Product-based, Category-based pricing behaviours
  function generalCustomPricingSetting() {
    const discountDefaultRule = $(".ywhs_discount_rule_default");
    const discountCustomRule = $(".ywhs_discount_rule_custom");

    discountDefaultRule.each(function () {
      const isChecked = $(this).is(":checked");
      const discountValue = $(this)
        .closest(".ywhs_field")
        .siblings(".ywhs_discount_values");
      if (isChecked) {
        discountValue.css("display", "none");
      } else {
        discountValue.css("display", "flex");
      }
    });

    discountDefaultRule.on("change", function () {
      const isChecked = $(this).is(":checked");
      const discountValue = $(this)
        .closest(".ywhs_field")
        .siblings(".ywhs_discount_values");

      if (isChecked) {
        discountValue.stop(true, true).slideUp(300);
      }
    });

    discountCustomRule.on("change", function () {
      const isChecked = $(this).is(":checked");
      const discountValue = $(this)
        .closest(".ywhs_field")
        .siblings(".ywhs_discount_values");

      if (isChecked) {
        discountValue
          .css("display", "flex")
          .stop(true, true)
          .hide()
          .slideDown(300);
      }
    });

    $(".ywhs_value_input").on("change", function () {
      const input = $(this).find("input");
      const value = parseFloat(input.val());

      if (value < 0) {
        input.val(value * -1);
      }

      const max = parseFloat(input.attr("max") ?? "0");
      if (max === 0.0) {
        return;
      }

      if (value > max) {
        input.val(max);
      } else if (value % 1 !== 0) {
        input.val(value.toFixed(2));
      }
    });
  }

  function discountTypePricingSetting() {
    const switchEl = $(".ywhs_discount_type_switch");
    if (switchEl.length < 1) {
      return;
    }

    const handleToggle = (el) => {
      const input = $(el)
        .closest(".ywhs_discount_value_header")
        .siblings(".ywhs_discount_type");

      const rates = $(el)
        .closest(".ywhs_discount_value_header")
        .siblings(".ywhs_discount_roles_value")
        .find(".ywhs_discount_rate_value");

      const fixed = $(el)
        .closest(".ywhs_discount_value_header")
        .siblings(".ywhs_discount_roles_value")
        .find(".ywhs_discount_fixed_value");

      const checked = $(el).is(":checked");
      if (checked) {
        input.val("fixed");
        rates.hide();
        fixed.show();
      } else {
        input.val("rate");
        fixed.hide();
        rates.show();
      }
    };

    switchEl.each(function () {
      handleToggle(this);
    });

    switchEl.on("change", function (e) {
      handleToggle(this);
    });
  }
  // #endregion

  // #region Order Customer in Recalculate
  $(document).ready(() => {
    const allLoaded = checkRequiredElementsLoaded([
      "#customer_user",
      "#woocommerce-order-items",
    ]);

    if (!allLoaded) return;
    let orderCustomer = $("#customer_user").val();

    $("#woocommerce-order-items").on(
      "woocommerce_order_meta_box_add_items_ajax_data woocommerce_order_meta_box_recalculate_ajax_data woocommerce_order_meta_box_save_line_items_ajax_data",
      (event, data) => {
        const customer = $("#customer_user").val();

        if (customer) {
          data.ywhs_customer = customer;
        }

        return data;
      }
    );

    $("#customer_user").on("change", (event) => {
      customerHasChanged = $("#customer_user").val() !== orderCustomer;
      orderCustomer = $("#customer_user").val();

      if ($("#woocommerce-order-items #order_line_items tr").length > 0) {
        $("#woocommerce-order-items button.calculate-action").trigger("click");
      }
    });
  });
  // #endregion

  // #region Access rule (Category-based, Product-based)
  $(document).ready(() => {
    const handler = () => {
      const allLoaded = checkRequiredElementsLoaded([
        ".ywhs_access_rule_all",
        ".ywhs_access_rule_specific",
        ".ywhs_access_enable_by_role",
        ".ywhs_access_rule_wholesaler",
        ".ywhs_access_selected_roles",
      ]);

      if (!allLoaded) return;

      enableByRoleAccessRuleSetting();
      selectedWholesalerRoleAccessRuleSetting();
    };

    $(document).on(
      "woocommerce_variations_loaded woocommerce_variations_saved",
      handler
    );

    handler();
  });
  // #region Enabled By Role toggle
  function enableByRoleAccessRuleSetting() {
    const accessAllRule = $(".ywhs_access_rule_all");
    const accessSpecificRule = $(".ywhs_access_rule_specific");

    accessAllRule.each(function () {
      const isChecked = $(this).is(":checked");
      const enableByRole = $(this)
        .closest(".ywhs_field")
        .siblings(".ywhs_access_enable_by_role");
      if (isChecked) {
        enableByRole.css("display", "none");
      } else {
        enableByRole.css("display", "flex");
      }
    });

    accessAllRule.on("change", function () {
      const isChecked = $(this).is(":checked");
      const enableByRole = $(this)
        .closest(".ywhs_field")
        .siblings(".ywhs_access_enable_by_role");
      if (isChecked) {
        enableByRole.stop(true, true).slideUp(300);
      }
    });

    accessSpecificRule.on("change", function () {
      const isChecked = $(this).is(":checked");
      const enableByRole = $(this)
        .closest(".ywhs_field")
        .siblings(".ywhs_access_enable_by_role");

      if (isChecked) {
        enableByRole
          .css("display", "flex")
          .stop(true, true)
          .hide()
          .slideDown(300);
      }
    });
  }
  // #endregion

  // #region Selected Role toggle
  function selectedWholesalerRoleAccessRuleSetting() {
    const accessRuleWholesaler = $(".ywhs_access_rule_wholesaler");

    accessRuleWholesaler.each(function () {
      const isShowing = $(this).val() === "enabled-selected-roles";
      const selectedRoles = $(this)
        .closest(".ywhs_field")
        .siblings(".ywhs_access_selected_roles");
      if (!isShowing) {
        selectedRoles.css("display", "none");
      } else {
        selectedRoles.css("display", "flex");
      }
    });

    accessRuleWholesaler.on("change", function () {
      const isShowing = $(this).val() === "enabled-selected-roles";
      const selectedRoles = $(this)
        .closest(".ywhs_field")
        .siblings(".ywhs_access_selected_roles");

      if (isShowing) {
        selectedRoles
          .css("display", "flex")
          .stop(true, true)
          .hide()
          .slideDown(300);
      } else {
        selectedRoles.stop(true, true).slideUp(300);
      }
    });
  }
  // #endregion

  // #endregion

  // #region Helpers
  function checkRequiredElementsLoaded(requiredSelectors) {
    for (let i = 0; i < requiredSelectors.length; i++) {
      if ($(requiredSelectors[i]).length < 1) {
        return false;
      }
    }

    return true;
  }
  // #endregion
})(jQuery);
