import { store, getConfig } from "@wordpress/interactivity";

let wcState = null;
let isNeedSubcribing = false;
const i18n = window.wp?.i18n;

const __ = i18n?.__ || ((s) => s);

const sprintf =
	i18n?.sprintf ||
	((template, ...args) => {
		const placeholder = "__PERCENT__";
		template = template.replace(/%%/g, placeholder);

		template = template.replace(/%(\d+\$)?([sd])/g, (_, position, type) => {
			let val;
			if (position) {
				const index = parseInt(position.slice(0, -1), 10) - 1; // "1$" -> 0
				val = args[index];
			} else {
				val = args.shift();
			}

			if (type === "d") return Number(val) ?? 0;
			return val ?? "";
		});
		return template.replace(new RegExp(placeholder, "g"), "%");
	});

try {
	const wcStore = store(
		"woocommerce",
		{},
		{
			lock: "I acknowledge that using a private store means my plugin will inevitably break on the next store release.",
		}
	);
	wcState = wcStore?.state;

	if (!wcState.cart) {
		isNeedSubcribing = true;
		wcState = {
			cart: wp.data.select("wc/store/cart").getCartData(),
			restUrl: wcSettings.homeUrl + "wp-json/",
		};
	}
} catch (e) {
	console.log(e);
	// WooCommerce store not available
}

const config = getConfig("ywhs_wholesale_requirement");
const wholesaleRole = config?.wholesale ?? null;
const adminUrl = config?.admin_url ?? "";
const isUsingDefaultCurrency = config?.is_using_defaut_currency ?? false;
const currency = config?.currency ?? "";
const nonce = config?.nonce ?? "";
const isHiddenQuantity = wholesaleRole && wholesaleRole.minOrderQuantity == 0;
const isHiddenAmount = wholesaleRole && wholesaleRole.minOrderAmount == 0;
const pluginUrl = config?.plugin_url ?? "";

const { state, callbacks } = store("ywhs_wholesale_requirement", {
	state: {
		wholesaleName: wholesaleRole?.name ?? "",
		progressStyle: "width: 0",
		qtyMet: false,
		minQty: wholesaleRole?.minOrderQuantity ?? 0,
		count: 0,
		amountMet: false,
		subtotal: parseWPCurrency(0),
		minAmount: parseWPCurrency(wholesaleRole?.minOrderAmount ?? 0),
		isDiscounted: false,
		discountText: sprintf(
			__("%d%% Off", "yay-wholesale-b2b"),
			wholesaleRole?.discount ?? 0
		),
	},
	callbacks: {
		async getPriceMap() {
			let priceMap = JSON.parse(
				sessionStorage.getItem("ywhs_origin_prices_map")
			);

			if (
				priceMap &&
				(isUsingDefaultCurrency !== priceMap["isUsingDefaultCurrency"] ||
					currency !== priceMap["currency"])
			) {
				sessionStorage.removeItem("ywhs_origin_prices_map");
			}
		},
		async checkMetRequired() {
			if (!wholesaleRole) {
				return;
			}

			const cart = wcState?.cart;

			if (!cart) return;

			let refetch = false;

			let priceMap = sessionStorage.getItem("ywhs_origin_prices_map");
			if (!priceMap) {
				priceMap = {};
			} else {
				priceMap = JSON.parse(priceMap);
			}

			for (const item of cart.items) {
				if (!refetch) {
					if (!(item.key in priceMap)) {
						refetch = true;
						break;
					}
				}
			}

			if (refetch) {
				if (!nonce) return;
				const payload = {
					nonce: nonce,
					default_currency: isUsingDefaultCurrency,
				};
				try {
					const res = await fetch(
						`${adminUrl}?action=ywhs_get_original_price_in_cart`,
						{
							method: "POST",
							headers: {
								"Content-Type": "application/json",
							},
							credentials: "same-origin",
							body: JSON.stringify(payload),
						}
					);

					const data = await res.json();
					priceMap = {
						...priceMap,
						...data.data,
						isUsingDefaultCurrency,
						currency,
					};

					sessionStorage.setItem(
						"ywhs_origin_prices_map",
						JSON.stringify(priceMap)
					);
				} catch (e) {
					console.error(e);
				}
			}

			let actualSubtotal = 0;
			let actualCount = 0;
			for (const item of cart.items) {
				actualSubtotal += item.quantity * priceMap[item.key];
				actualCount += item.quantity;
			}

			let isDiscounted =
				actualCount >= wholesaleRole.minOrderQuantity &&
				actualSubtotal >= wholesaleRole.minOrderAmount;
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
				lackOfAmt = wholesaleRole.minOrderAmount - actualSubtotal;
				lackOfQty = wholesaleRole.minOrderQuantity - actualCount;
				let progressOfAmt = Math.min(
					100,
					(actualSubtotal / Math.max(wholesaleRole.minOrderAmount, 1)) * 100
				);
				let progressOfQty = Math.min(
					100,
					(actualCount / Math.max(wholesaleRole.minOrderQuantity, 1)) * 100
				);

				progress = ((progressOfAmt + progressOfQty) / 2).toFixed(2);

				let isEmpty = true;
				let phrases = [];

				if (lackOfQty > 0 && lackOfQty < wholesaleRole.minOrderQuantity) {
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

				if (lackOfAmt > 0 && lackOfAmt < wholesaleRole.minOrderAmount) {
					isEmpty = false;
					let price = parseWPCurrency(lackOfAmt);
					phrases.push(`<strong>${price}</strong>`);
				}

				if (!isEmpty) {
					let lack = phrases.join(__(" and ", "yay-wholesale-b2b"));
					let sale = wholesaleRole.discount;
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

			state.progressStyle = `width:${progress}%`;
			state.qtyMet = isDiscounted ? "ywhs_r_notice" : "";
			state.count = actualCount;
			state.amountMet = isDiscounted ? "ywhs_r_notice" : "";
			state.subtotal = parseWPCurrency(actualSubtotal);
			state.isDiscounted = isDiscounted
				? "ywhs_r_notice"
				: "ywhs_r_base_notice";
			state.icon = isDiscounted ? "ywhs_icon_discounted" : "ywhs_icon_cart";
			jQuery(".ywhs_requirement_notice_block").html(notice);

			if (isDiscounted) {
				jQuery(".ywhs_icon_holder_block").html(
					`<img src="${pluginUrl}/assets/images/icon/discount.svg" width="14" height="14" />`
				);
			} else {
				jQuery(".ywhs_icon_holder_block").html(
					`<img src="${pluginUrl}/assets/images/icon/cart.svg" width="14" height="14" />`
				);
			}
		},
	},
});

if (isNeedSubcribing) {
	wp.data.subscribe(() => {
		const currentCart = wp.data.select("wc/store/cart").getCartData();
		// Re-run check whenever cart changes
		wcState.cart = currentCart;
		callbacks.checkMetRequired();
	});
}
