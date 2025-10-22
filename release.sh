PLUGIN_SLUG="yay-wholesale-pro"
PROJECT_PATH=$(pwd)
BUILD_PATH="${PROJECT_PATH}/build"
DEST_PATH="$BUILD_PATH/$PLUGIN_SLUG"

echo "Generating build directory..."
rm -rf "$BUILD_PATH"
mkdir -p "$DEST_PATH"

echo "Installing PHP and JS dependencies..."
cd apps/
pnpm install
echo "Running JS Build..."
pnpm build
cd ../


echo "Syncing files..."
rsync -rc --exclude-from="$PROJECT_PATH/.distignore" "$PROJECT_PATH/" "$DEST_PATH/" --delete --delete-excluded

# Check if tools directory exists before running lint
if [ -d "tools" ]; then
    echo "Run lint"
    cd tools
    composer run cbf ../build
    cd ..
fi

# Remove Development files
sed -i "" "/'YAY_WHOLESALE_IS_DEVELOPMENT', true/d" "$DEST_PATH/yay-wholesale.php"
rm -rf "$DEST_PATH/includes/Engine/Register/RegisterDev.php"

echo "Generating zip file..."
cd "$BUILD_PATH" || exit
zip -q -r "${PLUGIN_SLUG}.zip" "$PLUGIN_SLUG/"
rm -rf "$PLUGIN_SLUG"
echo "${PLUGIN_SLUG}.zip file generated!"

echo "Build done!"
