import { sprintf, __ } from "@wordpress/i18n";
import { useMemo } from "@wordpress/element";
import { useSelect } from "@wordpress/data";

const Render = () => {
  if (!window.wc.blocksCheckout) {
    return null;
  }

  const { ExperimentalOrderMeta } = window.wc.blocksCheckout;
  const { wholesale, priceMap, pluginUrl } = window.ywhsRequirement;

  if (!wholesale) {
    return null;
  }

  const isHiddenQuantity = wholesale.minOrderQuantity == 0;
  const isHiddenAmount = wholesale.minOrderAmount == 0;

  const { cart, isLoading } = useSelect((select) => {
    const store = select("wc/store/cart");

    return {
      cart: store.getCartData(),
      isLoading: !store.hasFinishedResolution("getCartData"),
    };
  }, []);

  const { notice, progress, actualSubtotal, actualCount, isDiscounted } =
    useMemo(() => {
      let actualCount = cart.itemsCount;
      let actualSubtotal = 0;
      cart.items.forEach((item) => {
        actualSubtotal += item.quantity * priceMap[item.key];
      });

      let isDiscounted =
        actualCount >= wholesale.minOrderQuantity &&
        actualSubtotal >= wholesale.minOrderAmount;
      let lackOfAmt = 0;
      let lackOfQty = 0;
      let notice = "";
      let progress = 0;

      if (isDiscounted) {
        notice = __(
          "Great news — You’ve received the <span class='ywhs_r_notice'>wholesale price</span> 🎉",
          "yay-wholesale-b2b"
        );
        progress = 100;
      } else {
        lackOfAmt = wholesale.minOrderAmount - actualSubtotal;
        lackOfQty = wholesale.minOrderQuantity - actualCount;
        let progressOfAmt = Math.min(
          100,
          (actualSubtotal / Math.max(wholesale.minOrderAmount, 1)) * 100
        );
        let progressOfQty = Math.min(
          100,
          (actualCount / Math.max(wholesale.minOrderQuantity, 1)) * 100
        );

        progress = ((progressOfAmt + progressOfQty) / 2).toFixed(2);

        let isEmpty = true;
        let phrases = [];

        if (lackOfQty > 0 && lackOfQty < wholesale.minOrderQuantity) {
          isEmpty = false;
          phrases.push(
            lackOfQty > 1
              ? sprintf(
                  __("<strong>%d products</strong>", "yay-wholesale-b2b"),
                  lackOfQty
                )
              : __("<strong>1 product</strong>", "yay-wholesale-b2b")
          );
        }

        if (lackOfAmt > 0 && lackOfAmt < wholesale.minOrderAmount) {
          isEmpty = false;
          let price = parseWPCurrency(lackOfAmt);
          phrases.push(`<strong>${price}</strong>`);
        }

        if (!isEmpty) {
          let lack = phrases.join(__(" and ", "yay-wholesale-b2b"));
          let sale = wholesale.discount;
          /* translators: 1: amount remaining, 2: discount percentage */
          notice = sprintf(
            __(
              "You're almost there! Add %1$s more to receive wholesale pricing with <span class='ywhs_r_notice'>%2$d%% Off</span> value.",
              "yay-wholesale-b2b"
            ),
            lack,
            sale
          );
        } else {
          notice = __(
            "Please add items to your cart to receive wholesale pricing.",
            "yay-wholesale-b2b"
          );
        }
      }

      return { notice, progress, actualSubtotal, actualCount, isDiscounted };
    }, [cart]);

  return (
    <ExperimentalOrderMeta>
      <div className="ywhs_requirement_section">
        {/* Header */}
        <div className="ywhs_requirement_header">
          <div className="ywhs_requirement_title">
            <span>{__("Wholesale Requirement", "yay-wholesale-b2b")}</span>{" "}
            <span className="ywhs_badge">{wholesale.name}</span>
          </div>
          <div className="ywhs_requirement_opener ywhs_rclosed"></div>
        </div>

        {/* Progress bar */}
        <div className="ywhs_requirement_notice_section">
          <div className="ywhs_icon_holder">
            {!isDiscounted ? (
              <img
                src={pluginUrl + "/assets/images/icon/cart.svg"}
                width="14"
                height="14"
              />
            ) : (
              <img
                src={pluginUrl + "/assets/images/icon/discount.svg"}
                width="14"
                height="14"
              />
            )}
          </div>

          <div className="ywhs_requirement_progress_bar">
            <div className="ywhs_requirement_notice">
              <span dangerouslySetInnerHTML={{ __html: notice }} />
            </div>
            <div className="ywhs_r_base_bar">
              <div
                className="ywhs_r_value_bar"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="ywhs_requirement_content" style={{ display: "none" }}>
          {/* Min order quantity */}
          {!isHiddenQuantity && (
            <div className="ywhs_requirement_item">
              <span>{__("Min order quantity:", "yay-wholesale-b2b")}</span>
              <span className="ywhs_r_base_notice">
                <span className={isDiscounted ? "ywhs_r_notice" : ""}>
                  {actualCount}
                </span>
                /{wholesale.minOrderQuantity}
              </span>
            </div>
          )}

          {/* Min order amount */}
          {!isHiddenAmount && (
            <div className="ywhs_requirement_item">
              <span>{__("Min order amount:", "yay-wholesale-b2b")}</span>
              <span className="ywhs_r_base_notice">
                <span className={isDiscounted ? "ywhs_r_notice" : ""}>
                  {parseWPCurrency(actualSubtotal)}
                </span>
                /{parseWPCurrency(wholesale.minOrderAmount)}
              </span>
            </div>
          )}

          {/* Discount */}
          <div className="ywhs_requirement_item">
            <span>{__("Get discount:", "yay-wholesale-b2b")}</span>
            <div
              className={isDiscounted ? "ywhs_r_notice" : "ywhs_r_base_notice"}
            >
              {sprintf(__("%d%% Off", "yay-wholesale-b2b"), wholesale.discount)}
            </div>
          </div>
        </div>
      </div>
    </ExperimentalOrderMeta>
  );
};

export default Render;
