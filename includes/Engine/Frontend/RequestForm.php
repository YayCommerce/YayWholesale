<?php

namespace YayWholesaleB2B\Engine\Frontend;

use YayWholesaleB2B\Helpers\RegistrationFieldsHelper;
use YayWholesaleB2B\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Request Form Class
 */
class RequestForm {
    use SingletonTrait;

    protected $shortcode_name = 'ywhs_request_form';

    protected function __construct() {
        add_action( 'init', [ $this, 'add_ywhs_shortcode_form' ] );

        add_action( 'init', [ $this,'create_ywhs_block_request_form_block_init' ] );
    }

    /**
     * Add the shortcode of the form
     */
    public function add_ywhs_shortcode_form() {
        if ( ! shortcode_exists( $this->shortcode_name ) ) {
            add_shortcode( $this->shortcode_name, [ $this, 'ywhs_request_form_shortcode' ] );
        }
    }

    /**
     * The [ywhs_request_form_shortcode] shortcode.
     *
     * Display a request form.
     *
     * @param array $attr Shortcode attributes. Default empty.
     * @return string Form ouput.
     */
    public function ywhs_request_form_shortcode( array $attr = [] ): string {
        $attr = shortcode_atts(
            [
                'title' => __( 'Request Registration', 'yay-wholesale-b2b' ),
            ],
            $attr,
            $this->shortcode_name
        );

        return $this->ywhs_request_form_html( $attr );
    }


    /**
     * Return a HTML Form of request form.
     *
     * @param array $attr Shortcode attributes. Default empty.
     * @return string Form HTML ouput.
     */
    protected function ywhs_request_form_html( array $attr = [] ): string {
        if ( empty( $_COOKIE['yaywholesaleb2b_cid'] ) ) {
            $cid = wp_generate_uuid4();
            setcookie( 'yaywholesaleb2b_cid', $cid, time() + MONTH_IN_SECONDS, COOKIEPATH, COOKIE_DOMAIN, is_ssl(), true );
        }
        ob_start();
        ?>
        <div>
            <h4><?php echo esc_html( $attr['title'] ); ?></h4>
            <?php RegistrationFieldsHelper::render_form(); ?>
        </div>
        <?php
        return ob_get_clean();
    }

    public function create_ywhs_block_request_form_block_init() {
        $base_dir      = YAYWHOLESALEB2B_PLUGIN_DIR . 'assets/dist/blocks/request-form-block/';
        $manifest_file = $base_dir . 'blocks-manifest.php';

        if ( ! file_exists( $manifest_file ) ) {
            return;
        }

        $manifest_data = require $manifest_file;

        foreach ( array_keys( $manifest_data ) as $block_type ) {
            $block_dir = $base_dir . $block_type;

            if ( file_exists( $block_dir . '/block.json' ) ) {
                \register_block_type_from_metadata( $block_dir );
            }
        }
    }
}
