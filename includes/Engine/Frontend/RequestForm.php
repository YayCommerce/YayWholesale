<?php

namespace Yay_Wholesale\Engine\Frontend;

use Yay_Wholesale\Helpers\SettingsHelper;
use Yay_Wholesale\Utils\SingletonTrait;

defined( 'ABSPATH' ) || exit;

/**
 * Request Form Class
 */
class RequestForm {
    use SingletonTrait;

    private $settings;
    protected $shortcode_name = 'ywhs_request_form';

    protected function __construct() {
        add_action( 'init', [ $this, 'add_shortcode_form' ] );
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
        $this->settings = SettingsHelper::get_settings();

        $attr = shortcode_atts(
            [
                'title' => 'Request Registration',
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
        ob_start();
        ?>
        <div>
            <h4><?php echo esc_html( $attr['title'] ); ?></h4>
            <form id="ywhs_request_form">
                <?php
                foreach ( $this->settings['registration_fields']['fields'] as $field ) :
                    ?>
                    <div <?php echo esc_html( $field['columnWidth'] ) === '50%' ? 'class="ywhs_half"' : 'class="ywhs_full"'; ?> >
                        <label for="<?php echo esc_html( $field['id'] ); ?>" >
                            <?php echo esc_html( $field['label'] ); ?>
                        </label>
                        <?php if ( esc_html( $field['type'] ) !== 'textarea' ) : ?>
                            <input 
                                id="<?php echo esc_html( $field['id'] ); ?>" 
                                type="<?php echo esc_html( $field['type'] ); ?>" 
                                placeholder="<?php echo esc_html( $field['placeholder'] ); ?>"
                                name="<?php echo esc_html( $this->label_to_input_name( $field['label'] ) ); ?>" 
                                />
                        <?php else : ?>
                            <textarea 
                                id="<?php echo esc_html( $field['id'] ); ?>" 
                                placeholder="<?php echo esc_html( $field['placeholder'] ); ?>" 
                                name="<?php echo esc_html( $this->label_to_input_name( $field['label'] ) ); ?>" 
                                ></textarea>
                        <?php endif ?>
                        <div id="<?php echo esc_html( $field['id'] ); ?>_error" class="input-error"><?php echo esc_html( __( 'Please fill in ', 'yay-wholesale' ) . $field['label'] ); ?></div>
                    </div>
                    <?php
                endforeach;
                ?>

                <button type="submit" ><?php echo esc_html( $this->settings['registration']['submit_button_label'] ); ?></button>
            </form>

            <h3 id="ywhs_success_notice"><?php echo esc_html( $this->settings['registration']['successful_registration_message'] ); ?></h3>
        </div>
        <?php
        return ob_get_clean();
    }

    /**
     * Return a inputinput name from an input label.
     *
     * @param string $label Input label.
     * @return string input name.
     */
    protected function label_to_input_name( string $label ): string {
        $tmp_arr = explode( ' ', strtolower( $label ) );
        return implode( '_', $tmp_arr );
    }
}
