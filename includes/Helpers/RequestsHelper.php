<?php
namespace YayWholesaleB2B\Helpers;

use Exception;
use WP_Query;
use WP_User;

/**
 * Settings Helper Class
 */
class RequestsHelper {
    public const REQUEST_POST_TYPE         = 'yay-whs-request';
    public const REQUEST_META_DATA         = 'yay-whs-request-data';
    public const REQUEST_META_DISPLAY_NAME = 'yay-whs-request-display-name';
    public const REQUEST_META_EMAIL        = 'yay-whs-request-email';
    public const REQUEST_META_STATUS       = 'yay-whs-request-status';
    public const REQUEST_META_MESSAGE      = 'yay-whs-request-message';
    public const REJECTED                  = 'rejected';
    public const PENDING                   = 'pending';
    public const APPROVED                  = 'approved';
    public const ALL                       = 'all';

    protected function __construct() {}

    /**
     * Insert new Wholesale request.
     *
     * @param int   $user_id The sender account ID .
     * @param array $form_data The form data in request.
     * @return int A new wholesale ID registered.
     */
    public static function insert_whs_request( int $user_id, array $form_data ): int {
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
                'post_type'    => self::REQUEST_POST_TYPE,
            ]
        );

        if ( is_wp_error( $new_request_id ) ) {
            return -1;
        }

        $general_setting = SettingsHelper::get_settings();

        foreach ( $general_setting['registration_fields']['fields'] as $gsetting ) {
            $key = self::label_to_input_name( $gsetting['label'] );
            if ( array_key_exists( $key, $form_data ) ) {
                if ( 'email' === $gsetting['type'] && ! $gsetting['deletable'] ) {
                    update_post_meta( $new_request_id, self::REQUEST_META_EMAIL, $form_data[ $key ] );
                } elseif ( 'textarea' === $gsetting['type'] && ! $gsetting['deletable'] ) {
                    update_post_meta( $new_request_id, self::REQUEST_META_MESSAGE, $form_data[ $key ] );
                } else {
                    $data[ $gsetting['label'] ] = [
                        'type'       => $gsetting['type'],
                        'value'      => $form_data[ $key ],
                        'is_default' => $gsetting['isDefault'],
                    ];
                }
            }
        }
        update_post_meta( $new_request_id, self::REQUEST_META_DATA, $data );

        update_post_meta( $new_request_id, self::REQUEST_META_DISPLAY_NAME, $display_name );

        update_post_meta( $new_request_id, self::REQUEST_META_STATUS, self::PENDING );

        // Trigger the email when a new wholesale account is registered.
        do_action( 'ywhs_new_account_registered', $new_request_id );

        return $new_request_id;
    }

    /**
     * Get a list of Wholesale requests.
     *
     * @param string $filter_key The search keyword .
     * @param string $status The filtered status .
     * @param int    $page The pagination page.
     * @param int    $per_page The number of items per page.
     * @return array A paginated list of Wholesale requests.
     */
    public static function get_paginated_request_post( string $filter_key, string $status, int $page, int $per_page ): array {
        $args = [
            'post_type'              => self::REQUEST_POST_TYPE,
            'update_post_meta_cache' => true,
            'meta_query'             => [
                'relation'      => 'AND',
                'status_clause' => [
                    'key'  => self::REQUEST_META_STATUS,
                    'type' => 'CHAR',
                ],
            ],
            'orderby'                => [
                'status_clause' => 'ASC',
                'date'          => 'DESC',
            ],
        ];

        if ( ! isset( $page ) || ! isset( $per_page ) ) {
            $args['posts_per_page'] = '-1';
        } else {
            $args['posts_per_page'] = $per_page;
            $args['paged']          = $page;
        }

        if ( isset( $filter_key ) ) {
            $args['meta_query'][] = [
                'relation' => 'OR',
                [
                    'key'     => self::REQUEST_META_DISPLAY_NAME,
                    'value'   => $filter_key,
                    'compare' => 'LIKE',
                    'type'    => 'CHAR',
                ],
                [
                    'key'     => self::REQUEST_META_EMAIL,
                    'value'   => $filter_key,
                    'compare' => 'LIKE',
                    'type'    => 'CHAR',
                ],
            ];
        }

        if ( isset( $status ) && ! in_array( $status, [ self::ALL, self::APPROVED ], true ) ) {
            $args['meta_query'][] = [
                'key'     => self::REQUEST_META_STATUS,
                'value'   => $status,
                'compare' => '=',
                'type'    => 'CHAR',
            ];
        }

        $args['meta_query'][] = [
            'key'     => self::REQUEST_META_STATUS,
            'value'   => self::APPROVED,
            'compare' => '!=',
            'type'    => 'CHAR',
        ];

        $query       = new WP_Query( $args );
        $data_list   = $query->posts;
        $total_pages = $query->max_num_pages;

        $cleaned = [];
        foreach ( $data_list as $data ) {
            array_push( $cleaned, self::clean_request_data( $data, true ) );
        }

        $response = [
            'currentPage' => $page,
            'totalPage'   => $total_pages,
            'data'        => $cleaned,
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
        $display_name = get_post_meta( $data->ID, self::REQUEST_META_DISPLAY_NAME, true );
        $post_meta    = get_post_meta( $data->ID, self::REQUEST_META_DATA, true );
        $email        = get_post_meta( $data->ID, self::REQUEST_META_EMAIL, true );
        $message      = get_post_meta( $data->ID, self::REQUEST_META_MESSAGE, true );
        $status       = get_post_meta( $data->ID, self::REQUEST_META_STATUS, true );

        $cleaned = [
            'id'        => $data->ID,
            'fields'    => [],
            'name'      => $display_name,
            'email'     => $email,
            'message'   => $message,
            'status'    => $status,
            'date'      => $data->post_date,
            'avatar'    => $data->post_author > 0 ? get_avatar_url( $data->post_author ) : '',
            'firstName' => '',
            'lastName'  => '',
        ];

        $last_name_phrase  = __( 'Last Name', 'yay-wholesale-b2b' );
        $first_name_phrase = __( 'First Name', 'yay-wholesale-b2b' );
        if ( $is_extra_fields ) {
            foreach ( $post_meta as $key => $field ) {
                if ( ! $field['is_default'] ) {
                    $tmp = [
                        'label' => $key,
                        'value' => $field['value'],
                        'type'  => $field['type'],
                    ];

                    $cleaned['fields'][] = $tmp;
                } else {
                    if ( preg_match( "/(?i)\b$last_name_phrase\b/", $key ) ) {
                        $cleaned['lastName'] = $field['value'];
                    }

                    if ( preg_match( "/(?i)\b$first_name_phrase\b/", $key ) ) {
                        $cleaned['firstName'] = $field['value'];
                    }
                }
            }
        }//end if

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
        if ( ! isset( $request ) || self::REQUEST_POST_TYPE !== $request->post_type ) {
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

        if ( ! isset( $request ) || self::REQUEST_POST_TYPE !== $request->post_type ) {
            return false;
        }

        $result       = true;
        $display_name = get_post_meta( $request_id, self::REQUEST_META_DISPLAY_NAME, true );
        $email        = get_post_meta( $request_id, self::REQUEST_META_EMAIL, true );
        $message      = get_post_meta( $request_id, self::REQUEST_META_MESSAGE, true );
        $status       = get_post_meta( $request_id, self::REQUEST_META_STATUS, true );

        // Save display name
        if ( array_key_exists( 'name', $args ) && $display_name !== $args['name'] ) {
            $display_name = $args['name'];
            $result       = update_post_meta( $request_id, self::REQUEST_META_DISPLAY_NAME, $display_name );
            if ( ! $result ) {
                return false;
            }
        }

        // Save post date
        if ( array_key_exists( 'date', $args ) && $request->post_date !== $args['date'] ) {
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

        // Save email
        if ( array_key_exists( 'email', $args ) && $email !== $args['email'] ) {
            $email  = $args['email'];
            $result = update_post_meta( $request_id, self::REQUEST_META_EMAIL, $email );
            if ( ! $result ) {
                return false;
            }
        }

        // Save message
        if ( array_key_exists( 'message', $args ) && $message !== $args['message'] ) {
            $message = $args['message'];
            $result  = update_post_meta( $request_id, self::REQUEST_META_MESSAGE, $message );
            if ( ! $result ) {
                return false;
            }
        }

        // Save status
        if ( array_key_exists( 'status', $args ) && $status !== $args['status'] ) {
            $status = $args['status'];
            $result = update_post_meta( $request_id, self::REQUEST_META_STATUS, $status );
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

        if ( ! isset( $request ) || self::REQUEST_POST_TYPE !== $request->post_type ) {
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

    /**
     * Set role to the the author of request
     *
     * @param int    $request_id The target request ID .
     * @param string $role_slug The target role slug .
     * @return bool
     */
    public static function add_role_to_ywhs_request_author( int $request_id, string $role_slug ): bool {
        $request = get_post( $request_id );

        if ( $request->post_author < 1 ) {
            return false;
        }

        $current_user = new WP_User( $request->post_author );

        RolesHelper::remove_ywhs_role_from_user( $current_user );

        $current_user->add_role( $role_slug );

        return true;
    }

    /**
     * Handle the process of add role/ new user with request
     *
     * @param int    $request_id The target request ID .
     * @param string $role_slug The target role slug .
     * @return void
     */
    public static function handle_ywhs_request_author( int $request_id, string $role_slug ): void {
        $request = get_post( $request_id );

        if ( $request->post_author < 1 ) {
            $display_name = get_post_meta( $request_id, self::REQUEST_META_DISPLAY_NAME, true );
            $post_meta    = get_post_meta( $request_id, self::REQUEST_META_DATA, true );
            $email        = get_post_meta( $request_id, self::REQUEST_META_EMAIL, true );
            $password     = wp_generate_password( 12, true, true );

            $request_user = wp_insert_user(
                [
                    'user_login'   => sanitize_key( $display_name ),
                    'user_pass'    => $password,
                    'display_name' => $display_name,
                    'first_name'   => $post_meta['First Name'] ?? '',
                    'last_name'    => $post_meta['Last Name'] ?? '',
                    'user_email'   => $email,
                    'role'         => $role_slug,
                ]
            );

            if ( is_wp_error( $request_user ) ) {
                throw new Exception( esc_html( $request_user->get_error_message() ) );
            }

            $result = wp_update_post(
                [
                    'ID'          => $request_id,
                    'post_author' => $request_user,
                ]
            );

            if ( is_wp_error( $result ) ) {
                throw new Exception( esc_html( $result->get_error_message() ) );
            }
        } else {
            $current_user = new WP_User( $request->post_author );

            RolesHelper::remove_ywhs_role_from_user( $current_user );

            $current_user->add_role( $role_slug );

        }//end if
    }


    /**
     * Remove role from the the author of request
     *
     * @param int $request_id The target request ID.
     * @return void
     */
    public static function remove_role_from_ywhs_request_author( int $request_id ): void {
        $request = get_post( $request_id );

        if ( $request->post_author > 0 ) {
            $current_user = new WP_User( $request->post_author );
            RolesHelper::remove_ywhs_role_from_user( $current_user );
        }
    }

    /**
     * Count the pending requests
     *
     * @return int count of the pending requests.
     */
    public static function count_pending_requests(): int {
        $args  = [
            'post_type'              => self::REQUEST_POST_TYPE,
            'update_post_meta_cache' => true,
            'posts_per_page'         => -1,
            'meta_query'             => [
                'relation' => 'AND',
                [
                    'key'     => self::REQUEST_META_STATUS,
                    'value'   => self::PENDING,
                    'compare' => '==',
                    'type'    => 'CHAR',
                ],
            ],
        ];
        $query = new WP_Query( $args );

        return $query->post_count;
    }

    /**
     * Count the pending/rejected requests
     *
     * @return int count of the pending requests.
     */
    public static function count_total_requests(): int {
        $args  = [
            'post_type'              => self::REQUEST_POST_TYPE,
            'update_post_meta_cache' => true,
            'posts_per_page'         => -1,
            'meta_query'             => [
                [
                    'key'     => self::REQUEST_META_STATUS,
                    'value'   => self::APPROVED,
                    'compare' => '!=',
                    'type'    => 'CHAR',
                ],
            ],
        ];
        $query = new WP_Query( $args );

        return $query->post_count;
    }
}
