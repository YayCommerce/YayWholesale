


composer global require squizlabs/php_codesniffer wp-coding-standards/wpcs phpcompatibility/phpcompatibility-wp -W

// Default: Lite version at plugin/build/lite folder
sh release.sh

// Pro version at plugin/build/pro folder
sh release.sh IS_PRO="true"

// Output path (No need to add suffix pro/lite, automatically generated) - Lite version at D:/test/lite 
sh release.sh OUTPUT_PATH="D:/test"

// Complete
sh release IS_PRO="true" OUTPUT_PATH="D:/test"
sh release IS_PRO="false" OUTPUT_PATH="D:/test"