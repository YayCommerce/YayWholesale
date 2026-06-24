PROJECT_PATH=$(pwd)
IS_PRO="false"
BUILD_PATH="${PROJECT_PATH}/build"
# Detect OS
os=$(uname -s)

for param in "$@"
do
    case $param in
        IS_PRO=*)
            IS_PRO="${param#*=}"
            ;;
        OUTPUT_PATH=*)
            BUILD_PATH="${param#*=}"

            # Convert '\' to '/'
            BUILD_PATH="${BUILD_PATH//\\//}"

            # Adapt build path to runtime environment
            if [ "${os#CYGWIN}" != "$os" ] || [ "${os#MINGW}" != "$os" ] || [ "${os#MSYS}" != "$os" ]; then
                # Windows-like environments (Cygwin, Git Bash)
                if command -v cygpath >/dev/null 2>&1; then
                    # Use cygpath if available
                    BUILD_PATH=$(cygpath "$BUILD_PATH")
                else
                    # Manual conversion: drive letter to lowercase + prepend /
                    drive=$(echo "${BUILD_PATH%%:*}" | tr 'A-Z' 'a-z')
                    rest="${BUILD_PATH#*:}"
                    BUILD_PATH="/$drive$rest"
                fi
            else
                # Linux/macOS: remove ':' if it has
                BUILD_PATH="${BUILD_PATH//:/}"
            fi
            ;;
        *)
            echo "Unknown parameter: $param"
            ;;
    esac
done

if [ "$IS_PRO" = "true" ]; then
    BUILD_PATH="${BUILD_PATH}/pro"
    PLUGIN_SLUG="yay-wholesale-b2b-pro"
else
    BUILD_PATH="${BUILD_PATH}/lite"
    PLUGIN_SLUG="yay-wholesale-b2b"
fi

DEST_PATH="$BUILD_PATH/$PLUGIN_SLUG"

if [ ! -d "$BUILD_PATH" ]; then
    echo "directory $BUILD_PATH does not exist. Creating..."
    mkdir -p "$BUILD_PATH"
fi

echo "Generating build directory..."
rm -rf "$BUILD_PATH"
mkdir -p "$DEST_PATH"

#
# 1) Build Admin App
#
echo "Installing Admin App dependencies..."
pnpm install
cd "$PROJECT_PATH/apps/admin"
echo "Running JS Build..."
if [ "$IS_PRO" = "true" ]; then
    pnpm build:pro
else
    pnpm build:lite
fi
cd "$PROJECT_PATH"

#
# 2) Build Request Form Block, Requirement Slot Fill, Requirement Block
#
echo "Build Request Form Block, Requirement Slot Fill, Requirement Block..."
pnpm --filter @yay-wholesale-blocks/* build
cd "$PROJECT_PATH"

#
# 5) Update License Handler core
#
set -euo pipefail
# cd "$(dirname "$0")/.."
if [ "${os#CYGWIN}" != "$os" ] || [ "${os#MINGW}" != "$os" ] || [ "${os#MSYS}" != "$os" ]; then
    sh "$PROJECT_PATH/vendor/bin/yaycommerce-prerelease"
else
    ./vendor/bin/yaycommerce-prerelease
fi

#
# 6) Copy files
#
echo "Syncing files..."
rsync -rc --exclude-from="$PROJECT_PATH/.distignore" "$PROJECT_PATH/" "$DEST_PATH/" --delete --delete-excluded
rsync "$PROJECT_PATH/vendor/autoload.php" "$DEST_PATH/vendor/"
rsync -r "$PROJECT_PATH/vendor/composer" "$DEST_PATH/vendor/"

#
# 7) Convert if endline is CRLF -> LF
#
if [ "${os#CYGWIN}" != "$os" ] || [ "${os#MINGW}" != "$os" ] || [ "${os#MSYS}" != "$os" ]; then
find "$DEST_PATH" \( -name "*.js" -o -name "*.css" -o -name "*.php" -o -name "*.json" \) -type f | while read -r file; do
    tr -d '\r' < "$file" > "$file.tmp" && mv "$file.tmp" "$file"
done
fi

#
# 8) Delete Pro folder if building Lite ver
#
if [ "$IS_PRO" = "false" ]; then
    TARGET="$DEST_PATH/includes/Pro"
    if [ -d "$TARGET" ]; then
        rm -rf "$TARGET" && echo "Removed: $TARGET (and its content)"
    fi

    TARGET="$DEST_PATH/assets/pro"
    if [ -d "$TARGET" ]; then
        rm -rf "$TARGET" && echo "Removed: $TARGET (and its content)"
    fi
else
    cp "$DEST_PATH/assets/pro/yay-wholesale-b2b-pro.php" "$DEST_PATH/"
    rm "$DEST_PATH/assets/pro/yay-wholesale-b2b-pro.php"
    rm "$DEST_PATH/yay-wholesale-b2b.php"
fi

#
# 9) Remove development-only code
#
rm -rf "$DEST_PATH/includes/Engine/Register/RegisterDev.php"

#
# 10) Generate ZIP
#
echo "Generating zip file..."
cd "$BUILD_PATH" || exit
zip -q -r "../${PLUGIN_SLUG}.zip" "$PLUGIN_SLUG/"
rm -rf "$BUILD_PATH"
echo "${PLUGIN_SLUG}.zip file generated!"

echo "Build done!"
