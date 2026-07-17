const TARGET_BLOCKS = ["woocommerce/cart"];

// Add attrs
function addRequirementBarToggle(settings, name) {
  if (typeof settings.attributes !== "undefined") {
    if (TARGET_BLOCKS.includes(name)) {
      settings.attributes = {
        ...settings.attributes,
        requirementBarEnabled: {
          type: "boolean",
          default: false,
        },
      };
    }
  }
  return settings;
}

wp.hooks.addFilter(
  "blocks.registerBlockType",
  "ywhs/custom-attribute-editor",
  addRequirementBarToggle
);

// Render Props
const coverAdvancedControls = wp.compose.createHigherOrderComponent(
  (BlockEdit) => {
    return (props) => {
      const { Fragment } = wp.element;
      const { ToggleControl } = wp.components;
      const { InspectorControls } = wp.blockEditor;
      const { attributes, setAttributes, isSelected } = props;
      return (
        <Fragment>
          <BlockEdit {...props} />
          {isSelected && TARGET_BLOCKS.includes(props.name) && (
            <InspectorControls>
              <ToggleControl
                className="block-editor-block-card"
                label={wp.i18n.__("Requirement Bar", "yay-wholesale-b2b")}
                checked={!!attributes.requirementBarEnabled}
                onChange={(newval) =>
                  setAttributes({
                    requirementBarEnabled: !attributes.requirementBarEnabled,
                  })
                }
                help={wp.i18n.__(
                  "Display a requirement bar to inform customers whether their cart meets the wholesale requirement.",
                  "yay-wholesale-b2b"
                )}
              />
            </InspectorControls>
          )}
        </Fragment>
      );
    };
  },
  "coverAdvancedControls"
);

wp.hooks.addFilter(
  "editor.BlockEdit",
  "ywhs/custom-attribute-editor",
  coverAdvancedControls
);
