<?php
namespace YayWholesaleB2B\Helpers;

use WP_Query;
use WP_User;
use WP_Error;

/**
 * Settings Helper Class
 */
class RequestsHelper {
    public const REQUEST_POST_TYPE         = 'ywhs_request';
    public const REQUEST_META_DATA         = 'ywhs_request_data';
    public const REQUEST_META_DISPLAY_NAME = 'ywhs_request_display_name';
    public const REQUEST_META_EMAIL        = 'ywhs_request_email';
    public const REQUEST_META_STATUS       = 'ywhs_request_status';
    public const REQUEST_META_MESSAGE      = 'ywhs_request_message';

    public const STATUS_PENDING  = 'pending';
    public const STATUS_APPROVED = 'approved';
    public const STATUS_REJECTED = 'rejected';

    public const USER_META_REQUEST = 'ywhs_user_request_approved';

    /**
     * Insert new Wholesale request.
     *
     * @param int    $user_id The sender account ID .
     * @param array  $body_params The form data in request.
     * @param string $request_status The status of the request.
     * @return int|WP_Error A new wholesale ID registered.
     */
    public static function insert_whs_request( int $user_id, array $body_params, string $request_status = self::STATUS_PENDING ) {
        $name         = '';
        $display_name = '';

        if ( array_key_exists( 'first_name', $body_params ) && array_key_exists( 'last_name', $body_params ) ) {
            $name         = $body_params['first_name'] . ' ' . $body_params['last_name'];
            $display_name = $body_params['first_name'] . ' ' . $body_params['last_name'];
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
            return $new_request_id;
        }

        $general_setting = SettingsHelper::get_settings();
        $request_data    = [];

        foreach ( $general_setting['registration_fields']['fields'] as $gsetting ) {
            $key = $gsetting['inputName'];
            if ( array_key_exists( $key, $body_params ) ) {
                $request_data[ $gsetting['label'] ] = [
                    'type'       => $gsetting['type'],
                    'is_default' => isset( $gsetting['isDefault'] ) ? $gsetting['isDefault'] : false,
                    'key'        => $key,
                ];

                if ( 'email_address' === $key ) {
                    update_post_meta( $new_request_id, self::REQUEST_META_EMAIL, $body_params[ $key ] );
                } elseif ( 'message' === $key ) {
                    update_post_meta( $new_request_id, self::REQUEST_META_MESSAGE, $body_params[ $key ] );
                } else {
                    $request_data[ $gsetting['label'] ]['value'] = $body_params[ $key ];
                }
            }
        }
        update_post_meta( $new_request_id, self::REQUEST_META_DATA, $request_data );

        update_post_meta( $new_request_id, self::REQUEST_META_DISPLAY_NAME, $display_name );

        update_post_meta( $new_request_id, self::REQUEST_META_STATUS, $request_status );

        return $new_request_id;
    }

    /**
     * Get a list of Wholesale requests.
     *
     * @param string $search The search keyword .
     * @param int    $page The pagination page.
     * @param int    $per_page The number of items per page.
     * @param string $status The filtered status .
     * @return array A paginated list of Wholesale requests.
     */
    public static function get_paginated_request_post( string $search, int $page, int $per_page, string $status = 'all' ): array {
        $args = [
            'post_type'              => self::REQUEST_POST_TYPE,
            'posts_per_page'         => $per_page,
            'paged'                  => $page,
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

        if ( ! empty( $search ) ) {
            $args['meta_query'][] = [
                'relation' => 'OR',
                [
                    'key'     => self::REQUEST_META_DISPLAY_NAME,
                    'value'   => $search,
                    'compare' => 'LIKE',
                    'type'    => 'CHAR',
                ],
                [
                    'key'     => self::REQUEST_META_EMAIL,
                    'value'   => $search,
                    'compare' => 'LIKE',
                    'type'    => 'CHAR',
                ],
            ];
        }

        if ( $status === 'all' || empty( $status ) ) {
            $args['meta_query'][] = [
                'key'     => self::REQUEST_META_STATUS,
                'value'   => self::STATUS_APPROVED,
                'compare' => '!=',
                'type'    => 'CHAR',
            ];
        } else {
            $args['meta_query'][] = [
                'key'     => self::REQUEST_META_STATUS,
                'value'   => $status,
                'compare' => '=',
                'type'    => 'CHAR',
            ];
        }

        $query     = new WP_Query( $args );
        $data_list = $query->posts;

        $response = [];
        foreach ( $data_list as $data ) {
            array_push( $response, self::make_request_response( $data, true ) );
        }

        return [
            'currentPage' => $page,
            'totalPage'   => $query->max_num_pages,
            'totalItems'  => $query->found_posts,
            'data'        => $response,
        ];
    }

    /**
     * Clean the wholesale request.
     *
     * @param \WP_Post $data The raw data of wholesale request .
     * @param bool     $is_extra_fields The Flag to determine to get extra fields .
     * @return array A  Wholesale requests cleaned.
     */
    public static function make_request_response( \WP_Post $data, bool $is_extra_fields ): array {
        $display_name = get_post_meta( $data->ID, self::REQUEST_META_DISPLAY_NAME, true );
        $post_meta    = get_post_meta( $data->ID, self::REQUEST_META_DATA, true );
        $email        = get_post_meta( $data->ID, self::REQUEST_META_EMAIL, true );
        $message      = get_post_meta( $data->ID, self::REQUEST_META_MESSAGE, true );
        $status       = get_post_meta( $data->ID, self::REQUEST_META_STATUS, true );

        $cleaned = [
            'id'                 => $data->ID,
            'fields'             => [],
            'name'               => $display_name,
            'email'              => $email,
            'message'            => $message,
            'status'             => $status,
            'date'               => $data->post_date,
            'avatar'             => $data->post_author > 0 ? get_avatar_url( $data->post_author ) : '',
            'firstName'          => '',
            'lastName'           => '',
            'defaultFieldLabels' => [
                'firstName' => __( 'First Name', 'yay-wholesale-b2b' ),
                'lastName'  => __( 'Last Name', 'yay-wholesale-b2b' ),
                'email'     => __( 'Email address', 'yay-wholesale-b2b' ),
                'message'   => __( 'Message', 'yay-wholesale-b2b' ),
            ],
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
                    if ( isset( $field['key'] ) && 'first_name' === $field['key'] ) {
                        $cleaned['firstName']                       = $field['value'];
                        $cleaned['defaultFieldLabels']['firstName'] = $key;
                    } elseif ( preg_match( "/(?i)\b$first_name_phrase\b/", $key ) ) {
                        $cleaned['firstName']                       = $field['value'];
                        $cleaned['defaultFieldLabels']['firstName'] = $key;
                    }

                    if ( isset( $field['key'] ) && 'last_name' === $field['key'] ) {
                        $cleaned['lastName']                       = $field['value'];
                        $cleaned['defaultFieldLabels']['lastName'] = $key;
                    } elseif ( preg_match( "/(?i)\b$last_name_phrase\b/", $key ) ) {
                        $cleaned['lastName']                       = $field['value'];
                        $cleaned['defaultFieldLabels']['lastName'] = $key;
                    }

                    if ( isset( $field['key'] ) && 'email_address' === $field['key'] ) {
                        $cleaned['defaultFieldLabels']['email'] = $key;
                    }

                    if ( isset( $field['key'] ) && 'message' === $field['key'] ) {
                        $cleaned['defaultFieldLabels']['message'] = $key;
                    }
                }//end if
            }//end foreach
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
        $cleaned = self::make_request_response( $request, true );

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
     * @return bool|WP_Error A wholesale request deleted status.
     */
    public static function delete_whs_request( int $request_id ) {
        $request = get_post( $request_id );

        if ( ! isset( $request ) || self::REQUEST_POST_TYPE !== $request->post_type ) {
            return new WP_Error( 'not_found', 'Request not found', [ 'status' => 404 ] );
        }

        $result = wp_delete_post( $request_id, true );

        if ( $result === false || $result === null ) {
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
     * @return void|WP_Error
     */
    public static function approve_request( int $request_id, string $role_slug ) {
        $request   = get_post( $request_id );
        $post_meta = get_post_meta( $request_id, self::REQUEST_META_DATA, true );
        $message   = get_post_meta( $request_id, self::REQUEST_META_MESSAGE, true );
        $user_id   = 0;

        if ( $request->post_author < 1 ) {
            $display_name = get_post_meta( $request_id, self::REQUEST_META_DISPLAY_NAME, true );
            $email        = get_post_meta( $request_id, self::REQUEST_META_EMAIL, true );
            $password     = wp_generate_password( 12, true, true );

            $request_user = wp_insert_user(
                [
                    'user_login'   => sanitize_key( remove_accents( $display_name ) ),
                    'user_pass'    => $password,
                    'display_name' => $display_name,
                    'user_email'   => $email,
                    'role'         => $role_slug,
                ]
            );

            if ( is_wp_error( $request_user ) ) {
                return $request_user;
            }

            $user_id = $request_user;

            update_user_meta( $user_id, 'description', $message );

            $result = wp_update_post(
                [
                    'ID'          => $request_id,
                    'post_author' => $request_user,
                ]
            );

            if ( is_wp_error( $result ) ) {
                return $result;
            }
        } else {
            $user = get_user_by( 'ID', $request->post_author );
            if ( $user === false ) {
                return new WP_Error( 'not_found', 'User not found', [ 'status' => 404 ] );
            }

            $user_id = $user->ID;

            RolesHelper::remove_ywhs_role_from_user( $user );
            $user->add_role( $role_slug );
        }//end if

        if ( $user_id > 0 ) {
            self::apply_billing_field_mappings_on_approval( $user_id, $post_meta );
            update_user_meta( $user_id, self::USER_META_REQUEST, $request_id );
        }

        update_post_meta( $request_id, self::REQUEST_META_STATUS, self::STATUS_APPROVED );
        do_action( 'ywhs_account_registration_approved', $request_id );
    }

    public static function reject_request( int $request_id ) {
        update_post_meta( $request_id, self::REQUEST_META_STATUS, self::STATUS_REJECTED );
        do_action( 'ywhs_account_registration_rejected', $request_id );
    }

    public static function count_requests_by_status( bool $force_recalc = false ): array {
        if ( ! $force_recalc ) {
            $cached = get_transient( 'yaywholesaleb2b_count_requests_by_status' );
            if ( $cached ) {
                return $cached;
            }
        }

        $count_pending  = self::count_pending_requests();
        $count_rejected = self::count_rejected_requests();
        $count          = [
            'pending'  => $count_pending,
            'rejected' => $count_rejected,
            'total'    => $count_pending + $count_rejected,
        ];

        set_transient( 'yaywholesaleb2b_count_requests_by_status', $count, 2 * HOUR_IN_SECONDS );
        return $count;
    }

    public static function count_pending_requests(): int {
        $args  = [
            'post_type'              => self::REQUEST_POST_TYPE,
            'update_post_meta_cache' => true,
            'meta_query'             => [
                [
                    'key'     => self::REQUEST_META_STATUS,
                    'value'   => self::STATUS_PENDING,
                    'compare' => '==',
                    'type'    => 'CHAR',
                ],
            ],
        ];
        $query = new WP_Query( $args );

        return $query->post_count;
    }

    public static function count_rejected_requests(): int {
        $args  = [
            'post_type'              => self::REQUEST_POST_TYPE,
            'update_post_meta_cache' => true,
            'meta_query'             => [
                [
                    'key'     => self::REQUEST_META_STATUS,
                    'value'   => self::STATUS_REJECTED,
                    'compare' => '==',
                    'type'    => 'CHAR',
                ],
            ],
        ];
        $query = new WP_Query( $args );

        return $query->post_count;
    }

    public static function apply_billing_field_mappings_on_approval( int $user_id, array $request_data ): void {
        self::apply_billing_field_mappings( $user_id, $request_data );
        self::update_billing_data_for_user( $user_id, $request_data );
    }

    protected static function apply_billing_field_mappings( int $user_id, array $request_data ): void {
        $settings      = SettingsHelper::get_settings();
        $fields_config = $settings['registration_fields']['fields'] ?? [];
        $config_by_key = [];

        foreach ( $fields_config as $field_config ) {
            if ( empty( $field_config['inputName'] ) ) {
                continue;
            }

            $config_by_key[ $field_config['inputName'] ] = $field_config;
        }

        foreach ( $request_data as $field_data ) {
            if ( ! is_array( $field_data ) || empty( $field_data['key'] ) || ! array_key_exists( 'value', $field_data ) ) {
                continue;
            }

            $input_name = $field_data['key'];
            if ( ! isset( $config_by_key[ $input_name ] ) ) {
                continue;
            }

            $field_config    = $config_by_key[ $input_name ];
            $billing_mapping = $field_config['billingMapping'] ?? '';

            if ( empty( $billing_mapping ) || 'none' === $billing_mapping ) {
                continue;
            }

            $value = $field_data['value'];

            if ( 'custom' === $billing_mapping ) {
                $meta_key = trim( $field_config['customBillingMetaKey'] ?? '' );
                if ( empty( $meta_key ) ) {
                    continue;
                }

                update_user_meta( $user_id, $meta_key, $value );
                continue;
            }

            if ( 'billing_country_state' === $billing_mapping ) {
                self::update_billing_country_state_meta( $user_id, $value );
                continue;
            }

            update_user_meta( $user_id, $billing_mapping, $value );
        }//end foreach
    }

    protected static function update_billing_country_state_meta( int $user_id, $value ): void {
        $country = '';
        $state   = '';

        if ( is_array( $value ) ) {
            $country = isset( $value[0] ) ? (string) $value[0] : '';
            $state   = isset( $value[1] ) ? (string) $value[1] : '';
        } else {
            $string_value = trim( (string) $value );
            if ( '' !== $string_value ) {
                if ( preg_match( '/^([^|:,]+)\s*[|:,]\s*(.+)$/', $string_value, $matches ) ) {
                    $country = trim( $matches[1] );
                    $state   = trim( $matches[2] );
                } else {
                    $country = $string_value;
                }
            }
        }

        if ( '' !== $country ) {
            update_user_meta( $user_id, 'billing_country', $country );
        }

        if ( '' !== $state ) {
            update_user_meta( $user_id, 'billing_state', $state );
        }
    }

    protected static function update_billing_data_for_user( int $user_id, array $request_data ) {
        $settings           = SettingsHelper::get_settings();
        $fields_config      = $settings['registration_fields']['fields'] ?? [];
        $mapped_input_names = [];

        foreach ( $fields_config as $field_config ) {
            $billing_mapping = $field_config['billingMapping'] ?? '';
            if ( ! empty( $billing_mapping ) && 'none' !== $billing_mapping && ! empty( $field_config['inputName'] ) ) {
                $mapped_input_names[] = $field_config['inputName'];
            }
        }

        $customer    = new \WC_Customer( $user_id );
        $updated_map = [];
        foreach ( $request_data as $key => $val ) {
            if ( ! empty( $val['key'] ) && in_array( $val['key'], $mapped_input_names, true ) ) {
                continue;
            }

            if ( 'first_name' === $val['key'] ) {
                $customer->set_first_name( $val['value'] );
                $customer->set_billing_first_name( $val['value'] );
            }

            if ( 'last_name' === $val['key'] ) {
                $customer->set_last_name( $val['value'] );
                $customer->set_billing_last_name( $val['value'] );
            }

            if ( ! $val['is_default'] ) {
                if ( str_contains( strtolower( $key ), 'company name' ) &&
                ! in_array( 'company', $updated_map, true ) ) {
                    $customer->set_billing_company( $val['value'] );
                    $updated_map[] = 'company';
                }

                if ( str_contains( strtolower( $key ), 'address' ) &&
                ! str_contains( 'email', strtolower( $key ) ) &&
                ! in_array( 'address', $updated_map, true ) ) {
                    $customer->set_billing_address( $val['value'] );
                    $updated_map[] = 'address';
                }

                if ( ( str_contains( strtolower( $key ), 'phone' ) || 'phone' === $val['type'] ) &&
                ! in_array( 'phone', $updated_map, true ) ) {
                    $customer->set_billing_phone( $val['value'] );
                    $updated_map[] = 'phone';
                }

                if ( str_contains( strtolower( $key ), 'city' ) &&
                ! in_array( 'city', $updated_map, true ) ) {
                    $customer->set_billing_city( $val['value'] );
                    $updated_map[] = 'city';
                }
            }//end if
        }//end foreach

        $customer->save();
    }

    public static function get_the_last_approved_request_id_of_user( int $user_id ) {
        $args = [
            'post_type'      => self::REQUEST_POST_TYPE,
            'author'         => $user_id,
            'posts_per_page' => 1,
            'orderby'        => 'modified',
            'order'          => 'DESC',
            'fields'         => 'ids',
            'meta_query'     => [
                [
                    'key'     => self::REQUEST_META_STATUS,
                    'value'   => self::STATUS_APPROVED,
                    'compare' => '==',
                    'type'    => 'CHAR',
                ],
            ],
        ];

        $query = new WP_Query( $args );

        return $query->posts[0] ?? 0;
    }
}
