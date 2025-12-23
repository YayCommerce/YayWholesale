import { registerPlugin } from "@wordpress/plugins";
import Render from './render'

registerPlugin('ywhs-wholesale-requirement', {
    render: Render,
    scope: 'woocommerce-checkout',
});