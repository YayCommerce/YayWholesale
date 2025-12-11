<?php

namespace Yay_Wholesale\Engine\Frontend;

use Yay_Wholesale\Helpers\RequestsHelper;
use Yay_Wholesale\Helpers\SettingsHelper;
use Yay_Wholesale\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Request Form Class
 */
class RequestForm {
    use SingletonTrait;

    protected $shortcode_name = 'ywhs_request_form';

    protected function __construct() {
        add_action( 'init', [ $this, 'add_shortcode_form' ] );

        add_action( 'init', [ $this,'create_block_request_form_block_init' ] );
    }

    /**
     * Add the shortcode of the form
     */
    public function add_shortcode_form() {
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
                'title' => __( 'Request Registration', 'yay-wholesale' ),
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
        $settings = SettingsHelper::get_settings();
        ob_start();
        ?>
        <div>
            <h4><?php echo esc_html( $attr['title'] ); ?></h4>
            <form id="ywhs_request_form">
                <div id="ywhs_form_fields_container">
                <?php
                foreach ( $settings['registration_fields']['fields'] as $field ) :
                    ?>
                    <?php if ( ! $field['isHidden'] ) : ?>
                    <div <?php echo esc_html( $field['columnWidth'] ) === '50%' ? 'class="ywhs_half"' : 'class="ywhs_full"'; ?> >
                        <label for="<?php echo esc_html( $field['id'] ); ?>" >
                            <?php echo esc_html( $field['label'] ); ?>
                            <div style="color: red">
                            <?php
                            if ( $field['isRequired'] ) {
                                echo '*';
                            }
                            ?>
                            </div>
                        </label>
                        <?php if ( esc_html( $field['type'] ) !== 'textarea' ) : ?>
                            <input 
                                id="<?php echo esc_html( $field['id'] ); ?>" 
                                type="<?php echo esc_html( $field['type'] ); ?>" 
                                placeholder="<?php echo esc_html( $field['placeholder'] ); ?>"
                                name="<?php echo esc_html( RequestsHelper::label_to_input_name( $field['label'] ) ); ?>" 
                                <?php echo( $field['isRequired'] ? 'required' : '' ); ?>
                                />
                        <?php else : ?>
                            <textarea 
                                id="<?php echo esc_html( $field['id'] ); ?>" 
                                placeholder="<?php echo esc_html( $field['placeholder'] ); ?>" 
                                name="<?php echo esc_html( RequestsHelper::label_to_input_name( $field['label'] ) ); ?>" 
                                <?php echo( $field['isRequired'] ? 'required' : '' ); ?>
                                ></textarea>
                        <?php endif ?>
                    </div>
                        <?php
                    endif
                    ?>
                    <?php
                    endforeach;
                ?>
                </div>

                <button type="submit" ><?php echo esc_html( $settings['registration']['submit_button_label'] ); ?></button>
            </form>

            <h3 id="ywhs_success_notice"><?php echo esc_html( $settings['registration']['successful_registration_message'] ); ?></h3>
        </div>
                    <?php
                    return ob_get_clean();
    }

    public function create_block_request_form_block_init() {
        $base_dir      = YAY_WHOLESALE_PLUGIN_DIR . 'assets/dist/blocks/request-form-block/';
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
