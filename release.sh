PLUGIN_SLUG="yay-wholesale-b2b"
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
else
    BUILD_PATH="${BUILD_PATH}/lite"
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
cd "$PROJECT_PATH/apps/admin"
pnpm install
echo "Running JS Build..."
if [ "$IS_PRO" = "true" ]; then
    if [ "${os#CYGWIN}" != "$os" ] || [ "${os#MINGW}" != "$os" ] || [ "${os#MSYS}" != "$os" ]; then
        pnpm build:window:pro
    else
        pnpm build:macos:pro
    fi
else
    pnpm build
fi
cd "$PROJECT_PATH"

#
# 2) Build Request Form Block
#
cd "$PROJECT_PATH/apps/blocks/request-form-block"
pnpm install
echo "Running Request Form Block JS Build..."
pnpm build
cd "$PROJECT_PATH"

#
# 3) Build Requirement Slot Fill
#
cd "$PROJECT_PATH/apps/blocks/requirement-slot-fill"
pnpm install
echo "Running Reqirement Slot Fill JS Build..."
pnpm build
cd "$PROJECT_PATH"

# 4) Build Requirement Block
#
cd "$PROJECT_PATH/apps/blocks/requirement-block"
pnpm install
echo "Running Requirement Block JS Build..."
pnpm build
cd "$PROJECT_PATH"

#
# 5) Copy files
#
echo "Syncing files..."
rsync -rc --exclude-from="$PROJECT_PATH/.distignore" "$PROJECT_PATH/" "$DEST_PATH/" --delete --delete-excluded

#
# 6) Run code formatter if tools directory exists before running lint
#
if [ -d "$PROJECT_PATH/tools" ]; then
    echo "Running PHP Code Beautifier..."
    cd "$PROJECT_PATH/tools"
    composer run cbf ../build
    cd "$PROJECT_PATH"
fi

#
# 7) Remove development-only code
#
sed -i "/'YAY_WHOLESALE_B2B_IS_DEVELOPMENT', true/d" "$DEST_PATH/yay-wholesale-b2b.php"
rm -rf "$DEST_PATH/includes/Engine/Register/RegisterDev.php"

#
# 8) Generate ZIP
#
echo "Generating zip file..."
cd "$BUILD_PATH" || exit
zip -q -r "${PLUGIN_SLUG}.zip" "$PLUGIN_SLUG/"
rm -rf "$PLUGIN_SLUG"
echo "${PLUGIN_SLUG}.zip file generated!"

echo "Build done!"
