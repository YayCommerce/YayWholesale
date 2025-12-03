const { __ } = window.wp.i18n;
const { registerPlugin } = window.wp.plugins;
const { createElement } = window.wp.element;
const { ExperimentalOrderMeta } = window.wc.blocksCheckout;

const render = () => {
    const { wholesale, isDiscounted, cartCount, cartSubtotal, minCount } = window.ywhsRequirement;
    return createElement(
        ExperimentalOrderMeta,
        null,
        createElement(
            'div',
            { className: 'ywhs_requirement_section' },
            createElement(
                'div',
                { className: 'ywhs_requirement_title' },
                __('Wholesale Requirement: ', 'yay-wholesale') + wholesale.name
            ),
            createElement(
                'div',
                { className: 'ywhs_requirement_content' },
                // Min Order Quantity
                createElement(
                    'div',
                    { className: 'ywhs_requirement_item' },
                    createElement('span', null, __('Min Order Quantity:', 'yay-wholesale')),
                    createElement('span', null, `${cartCount} / ${wholesale.minOrderQuantity}`)
                ),
                // Min Order Amount
                createElement(
                    'div',
                    { className: 'ywhs_requirement_item' },
                    createElement('span', null, __('Min Order Amount:', 'yay-wholesale')),
                    createElement(
                        'span',
                        null,
                        createElement('span', {
                          dangerouslySetInnerHTML: { __html: cartSubtotal }
                        }),
                        ' / ',
                        createElement('span', {
                          dangerouslySetInnerHTML: { __html: minCount }
                        })
                      )
                ),
                // Discount
                createElement(
                    'div',
                    { className: 'ywhs_requirement_item' },
                    createElement('span', null, __('Discount:', 'yay-wholesale')),
                    createElement('div', null, `${wholesale.discount}% Per Product`)
                ),
                // Status
                createElement(
                    'div',
                    { className: 'ywhs_requirement_item' },
                    createElement('span', null, __('Status:', 'yay-wholesale')),
                    createElement(
                        'div',
                        { className: `ywhs_rbadge ${isDiscounted ? 'ywhs_rb_qualified' : 'ywhs_rb_not_qualified'}` },
                        isDiscounted ? __('Qualified', 'yay-wholesale') : __('Not Qualified', 'yay-wholesale')
                    )
                )
            )
        )
    );
};

registerPlugin('ywhs-wholesale-requirement', {
    render,
    scope: 'woocommerce-checkout',
});
