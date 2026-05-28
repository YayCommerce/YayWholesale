#!/usr/bin/env bash

CONFIG="${1:-.wp-env.single.json}"

echo -e 'Activate default theme \n'
wp-env run cli --config="$CONFIG" wp theme activate brandy

echo -e 'Update URL structure \n'
wp-env run cli --config="$CONFIG" wp rewrite structure '/%postname%/' --hard

echo -e 'Install Plugin-check utility plugin \n'
wp-env run cli --config="$CONFIG" wp plugin install plugin-check --activate

echo -e 'Add Customer user \n'
wp-env run cli --config="$CONFIG" wp user create customer customer@woocommercecoree2etestsuite.com \
	--user_pass=password \
	--role=customer \
	--first_name='Jane' \
	--last_name='Smith' \
	--user_registered='2022-01-01 12:23:45' || true

echo -e 'Update Blog Name \n'
wp-env run cli --config="$CONFIG" wp option update blogname 'YayCommerce E2E Test Suite'

echo -e 'Disable WooCommerce coming soon \n'
wp-env run cli --config="$CONFIG" wp option update woocommerce_coming_soon no

echo -e 'Upload test images \n'
wp-env run cli --config="$CONFIG" wp media import './test-data/images/image-01.png' './test-data/images/image-02.png' './test-data/images/image-03.png'
