<?php
namespace Yay_Wholesale\Helpers;

use WP_Query;
use WpOrg\Requests\Response;

/**
 * Settings Helper Class
 */
class RequestsHelper {
    private const REQUEST_POST_TYPE    = 'yay-whs-request';
    private const REQUEST_META_NAME    = 'yay-whs-request-meta';
    private const REQUEST_DISPLAY_NAME = 'yay-whs-request-display-name';
    private const REQUEST_META_SETTING = 'yay-whs-request-meta-setting';
    public const REJECTED              = 'rejected';
    public const PENDING               = 'pending';
    public const APPROVED              = 'approved';

    protected function __construct() {}

    public static function get_post_type(): string {
        return self::REQUEST_POST_TYPE;
    }

    /**
     * Insert new Wholesale request.
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
            $form_data['avatar'] = '';
            $form_data['status'] = self::PENDING;

            if ( $user_id > 0 ) {
                $form_data['avatar'] = get_avatar_url( $user_id );
            }

            $general_setting = SettingsHelper::get_settings();
            $setting         = [
                'email_field'   => '',
                'message_field' => '',
                'custom_fields' => [],
            ];

            foreach ( $general_setting['registration_fields']['fields'] as $gsetting ) {
                $key = self::label_to_input_name( $gsetting['label'] );
                if ( array_key_exists( $key, $form_data ) ) {
                    if ( 'email' === $gsetting['type'] && ! $gsetting['deletable'] ) {
                        $setting['email_field'] = $key;
                    }

                    if ( 'textarea' === $gsetting['type'] && ! $gsetting['deletable'] ) {
                        $setting['message_field'] = $key;
                    }

                    if ( $gsetting['deletable'] ) {
                        $setting['custom_fields'][ $key ] = [
                            'label' => $gsetting['label'],
                            'type'  => $gsetting['type'],
                        ];
                    }
                }
            }

            update_post_meta( $new_request_id, self::REQUEST_META_NAME, $form_data );

            update_post_meta( $new_request_id, self::REQUEST_DISPLAY_NAME, $display_name );

            update_post_meta( $new_request_id, self::REQUEST_META_SETTING, $setting );
        }//end if
    }

    /**
     * Get a list of Wholesale requests.
     *
     * @param string $filter_key The search keyword .
     * @param int    $page The pagination page.
     * @param int    $per_page The number of items per page.
     * @return array A paginated list of Wholesale requests.
     */
    public static function get_paginated_request_post( string $filter_key, int $page, int $per_page ): array {
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
                    'key'     => self::REQUEST_DISPLAY_NAME,
                    'value'   => $filter_key,
                    'compare' => 'LIKE',
                    'type'    => 'CHAR',
                ],
            ];
        }

        $query       = new WP_Query( $args );
        $data_list   = $query->posts;
        $total_pages = $query->max_num_pages;
        $first_page  = $total_pages > 0 ? 1 : 0;

        $cleaned = [];
        foreach ( $data_list as $data ) {
            array_push( $cleaned, self::clean_request_data( $data, false ) );
        }

        $response = [
            'curPage'   => $page,
            'firstPage' => $first_page,
            'lastPage'  => $total_pages,
            'canNext'   => $page < $total_pages,
            'canPre'    => $page > $first_page,
            'data_list' => $cleaned,
        ];
        return $response;
    }

    /**
     * Clean the wholesale request.
     *
     * @param \WP_Post $data The raw data of wholesale request .
     * @param bool     $is_extra_fields The Flag to determine to get extra fields .
     * @return array A  Wholesale requests cleaned.
     */
    public static function clean_request_data( \WP_Post $data, bool $is_extra_fields ): array {
        $cleaned = [
            'id'     => $data->ID,
            'fields' => [],
        ];

        $display_name = get_post_meta( $data->ID, self::REQUEST_DISPLAY_NAME, true );
        $post_meta    = get_post_meta( $data->ID, self::REQUEST_META_NAME, true );
        $meta_setting = get_post_meta( $data->ID, self::REQUEST_META_SETTING, true );

        $cleaned = array_merge(
            $cleaned,
            [
                'name'    => $display_name,
                'email'   => $post_meta[ $meta_setting['email_field'] ],
                'message' => $post_meta[ $meta_setting['message_field'] ],
                'status'  => $post_meta['status'],
                'date'    => $data->post_date ,
                'avatar'  => $post_meta['avatar'],
            ]
        );

        if ( $is_extra_fields ) {
            $exclude = [ $meta_setting['email_field'] ];
            foreach ( $post_meta as $key => $val ) {
                if ( ! in_array( $key, $exclude, true ) && isset( $meta_setting['custom_fields'][ $key ] ) ) {
                    $tmp                 = [
                        'label' => $meta_setting['custom_fields'][ $key ]['label'],
                        'value' => $val,
                        'type'  => $meta_setting['custom_fields'][ $key ]['type'],
                    ];
                    $cleaned['fields'][] = $tmp;
                }
            }
        }

        return $cleaned;
    }

    /**
     * Get the wholesale request by ID.
     *
     * @param int $id The id of wholesale request .
     * @return array A Wholesale requests cleaned.
     */
    public static function get_request_by_id( int $id ): array {
        $request = get_post( $id );
        if ( ! isset( $request ) || self::get_post_type() !== $request->post_type ) {
            return [];
        }
        $cleaned = self::clean_request_data( $request, true );

        return $cleaned;
    }

    /**
     * Return a input name from an input label.
     *
     * @param string $label Input label.
     * @return string input name.
     */
    public static function label_to_input_name( string $label ): string {
        $tmp_arr = explode( ' ', strtolower( $label ) );
        return implode( '_', $tmp_arr );
    }

    /**
     * Update a wholesaler request by ID
     *
     * @param int   $request_id The target request ID .
     * @param array $args The key-value arguments.
     * @return bool A wholesale request updated status.
     */
    public static function update_whs_request( int $request_id, array $args ): bool {
        $request = get_post( $request_id );

        if ( ! isset( $request ) || self::get_post_type() !== $request->post_type ) {
            return false;
        }

        $result       = true;
        $display_name = get_post_meta( $request_id, self::REQUEST_DISPLAY_NAME, true );
        $post_meta    = get_post_meta( $request_id, self::REQUEST_META_NAME, true );

        // Save display name
        if ( $display_name !== $args['name'] ) {
            $display_name = $args['name'];
            $result       = update_post_meta( $request_id, self::REQUEST_DISPLAY_NAME, $display_name );
            if ( ! $result ) {
                return false;
            }
        }

        // Save post date
        if ( $request->post_date !== $args['date'] ) {
            $result = wp_update_post(
                [
                    'ID'        => $request_id,
                    'post_date' => $args['date'],
                ]
            );

            if ( is_wp_error( $result ) ) {
                return false;
            }
        }

        // Save meta data
        $exclude        = [ 'name', 'date' ];
        $is_update_meta = false;
        foreach ( $args as $key => $val ) {
            if ( ! array_key_exists( $key, $exclude ) && $val !== $post_meta[ $key ] ) {
                $is_update_meta    = true;
                $post_meta[ $key ] = $val;
            }
        }

        if ( $is_update_meta ) {
            $result = update_post_meta( $request_id, self::REQUEST_META_NAME, $post_meta );
            if ( ! $result ) {
                return false;
            }
        }

        return true;
    }

    /**
     * Delete a wholesaler request by ID
     *
     * @param int $request_id The target request ID .
     * @return bool A wholesale request deleted status.
     */
    public static function delete_whs_request( int $request_id ): bool {
        $request = get_post( $request_id );

        if ( ! isset( $request ) || self::get_post_type() !== $request->post_type ) {
            return false;
        }
        $meta        = get_post_meta( $request_id );
        $backup      = [];
        $is_rollback = false;

        foreach ( $meta as $key => $val ) {
            $backup[ $key ] = get_post_meta( $request_id, $key, true );
            $result         = delete_post_meta( $request_id, $key );
            if ( ! $result ) {
                $is_rollback = true;
                break;
            }
        }

        if ( $is_rollback ) {
            foreach ( $backup as $key => $val ) {
                update_post_meta( $request_id, $key, $val );
            }
            return false;
        }

        wp_cache_delete( $request_id, 'post-meta' );

        $result = wp_delete_post( $request_id );

        if ( ! $result ) {
            foreach ( $backup as $key => $val ) {
                update_post_meta( $request_id, $key, $val );
            }
            return false;
        }

            return true;
    }
}
