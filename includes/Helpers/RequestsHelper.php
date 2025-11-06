<?php
namespace Yay_Wholesale\Helpers;

/**
 * Settings Helper Class
 */
class RequestsHelper {
    private static $yay_wholesale_request_post_type    = 'yay-whs-request';
    private static $yay_wholesale_request_meta_name    = 'yay-whs-request-meta';
    private static $yay_wholesale_request_display_name = 'yay-whs-request-display-name';
    public const REJECTED                              = 'rejected';
    public const PENDING                               = 'pending';
    public const APPROVED                              = 'approved';

    protected function __construct() {}

    public static function get_post_type(): string {
        return self::$yay_wholesale_request_post_type;
    }

    /**
     * Inser new Wholesale request.
     *
     * @param int   $user_id The sender account ID .
     * @param array $form_data The form data in request.
     * @return void A new wholesale is registered.
     */
    public static function insert_whs_request( int $user_id, array $form_data ): void {
        $name         = '';
        $display_name = '';
        if ( array_key_exists( 'name', $form_data ) ) {
            $name         = $form_data['name'];
            $display_name = $form_data['name'];
        }

        if ( array_key_exists( 'first_name', $form_data ) && array_key_exists( 'last_name', $form_data ) ) {
            $name         = $form_data['first_name'] . ' ' . $form_data['last_name'];
            $display_name = $form_data['first_name'] . ' ' . $form_data['last_name'];
        }

        if ( empty( $name ) ) {
            $name = gmdate( 'YmdHi' );
            if ( $user_id ) {
                $user         = get_user_by( 'ID', $user_id );
                $display_name = 'Request ' . gmdate( 'YmdHi' ) . ' : ' . $user->display_name;
            }
        }

        $new_request_id = wp_insert_post(
            [
                'post_title'   => $name . ' Wholesale Request',
                'post_content' => 'Yay Wholesale Request',
                'post_status'  => 'publish',
                'post_author'  => $user_id,
                'post_type'    => self::get_post_type(),
            ]
        );

        if ( $new_request_id ) {
            $form_data['avatar']  = '';
            $form_data['user_id'] = $user_id;
            $form_data['status']  = self::PENDING;

            if ( $user_id > 0 ) {
                $form_data['avatar'] = get_avatar_url( $user_id );
            }

            update_post_meta( $new_request_id, self::$yay_wholesale_request_meta_name, $form_data );

            update_post_meta( $new_request_id, self::$yay_wholesale_request_display_name, $display_name );
        }
    }

    /**
     * Get a list of Wholesale requests.
     *
     * @param string $filter_key The search keyword .
     * @param int    $page The pagination page.
     * @param int    $per_page The number of items per page.
     * @return \WP_Post[] A list of Wholesale requests.
     */
    public static function get_ywhs_request_post( string $filter_key, int $page, int $per_page ): array {
        $args = [
            'post_type'              => self::get_post_type(),
            'update_post_meta_cache' => true,
        ];

        if ( ! isset( $page ) || ! isset( $per_page ) ) {
            $args['posts_per_page'] = '-1';
        } else {
            $args['posts_per_page'] = $per_page;
            $args['paged']          = $page;
        }

        if ( isset( $filter_key ) ) {
            $args['meta_query'] = [
                [
                    'key'     => self::$yay_wholesale_request_display_name,
                    'value'   => $filter_key,
                    'compare' => 'LIKE',
                    'type'    => 'CHAR',
                ],
            ];
        }

        $datas = get_posts( $args );

        return $datas;
    }

    /**
     * Clean the wholesale requests.
     *
     * @param \WP_Post[] $data_list The raw data of wholesale requests .
     * @return array A list of Wholesale requests cleaned.
     */
    public static function clean_ywhs_request_data( $data_list ): array {
        $cleaned = [];
        foreach ( $data_list as $data ) {
            $tmp = [
                'id' => $data->ID,
            ];

            $display_name = get_post_meta( $data->ID, self::$yay_wholesale_request_display_name, true );
            $post_meta    = get_post_meta( $data->ID, self::$yay_wholesale_request_meta_name, true );

            $datetime = strtotime( $data->post_date );
            $date     = gmdate( 'M j Y, g:i a', $datetime );

            $tmp = array_merge(
                $tmp,
                [
                    'name'   => $display_name,
                    'email'  => $post_meta['email_address'],
                    'status' => $post_meta['status'],
                    'date'   => $date,
                    'avatar' => $post_meta['avatar'],
                ]
            );

            array_push( $cleaned, $tmp );
        }//end foreach

        return $cleaned;
    }
}
