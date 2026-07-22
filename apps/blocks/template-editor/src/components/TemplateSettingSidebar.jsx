import { PluginSidebar } from "@wordpress/editor";
import { __ } from "@wordpress/i18n";
import {
  PanelBody,
  SelectControl,
  ToggleControl,
  CheckboxControl,
} from "@wordpress/components";
import { useSelect, useDispatch } from "@wordpress/data";
import { useState, useMemo, useEffect } from "@wordpress/element";

const DEFAULT_SETTINGS = {
  templateVisibility: {
    isActive: true,
    retailers: "enabled",
    wholesalers: "enabled",
    selected_roles: [],
  },
};

const WHOLESALE_ROLES = window.yayWholesaleMeta.wholesale_roles ?? [];

export default function TemplateSettingSidebar() {
  const templateId = useSelect((select) =>
    select("core/editor").getCurrentPostId()
  );
  // Check if we are currently editing the Yay Wholesale template in editor
  const isYayWholesaleTemplateEditor = useSelect((select) => {
    const postType = select("core/editor").getCurrentPostType();

    if (!["wp_template", "wp_template_part"].includes(postType)) {
      return false;
    }

    // Get all terms for the taxonomy
    const terms =
      select("core/editor").getCurrentPostAttribute("ywhs_taxonomies") ?? [];

    return terms.some(
      (term) =>
        term.taxonomy === "yay_wholesale_b2b" &&
        term.slug === "ywhs_shop_template"
    );
  }, []);

  const { editPost } = useDispatch("core/editor");
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [currentTemplateId, setTemplateId] = useState("");

  const meta = useSelect(
    (select) => select("core/editor").getCurrentPostAttribute("ywhs_meta"),
    []
  );

  const isShowingRolesPanel = useMemo(
    () => settings.templateVisibility.wholesalers === "enabled-selected-roles",
    [settings.templateVisibility, settings.templateVisibility.wholesalers]
  );

  const handleChange = (newSettings) => {
    const newMeta = {
      ywhs_meta: {
        ywhs_template_visibility: newSettings.templateVisibility,
      },
    };
    editPost(newMeta);
    setSettings(newSettings);
  };

  useEffect(() => {
    if (meta?.ywhs_template_visibility || currentTemplateId != templateId) {
      const templateVisibility =
        meta && meta.ywhs_template_visibility
          ? meta.ywhs_template_visibility
          : DEFAULT_SETTINGS.templateVisibility;
      if (
        templateVisibility.selected_roles.length < 1 &&
        templateVisibility.wholesalers === "enabled"
      ) {
        templateVisibility.selected_roles = WHOLESALE_ROLES.map((r) => r.slug);
      }
      setSettings({ ...settings, templateVisibility });
      setTemplateId(templateId);
    }
  }, [meta?.ywhs_template_visibility, templateId]);

  if (!isYayWholesaleTemplateEditor) {
    return null;
  }

  return (
    <PluginSidebar
      name="ywhs-template-settings"
      title="Yay Wholesale B2B Settings"
      icon="admin-generic"
    >
      <PanelBody className="block-editor-block-card">
        <div>
          <h3>{__("TEMPLATE VISIBILITY", "yay-wholesale-b2b")}</h3>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <ToggleControl
              label={__("Active", "yay-wholesale-b2b")}
              help={__("Apply this template to Shop page", "yay-wholesale-b2b")}
              checked={settings.templateVisibility.isActive}
              onChange={(value) =>
                handleChange({
                  ...settings,
                  templateVisibility: {
                    ...settings.templateVisibility,
                    isActive: !settings.templateVisibility.isActive,
                  },
                })
              }
            />
            <SelectControl
              label={__("Retailer Access", "yay-wholesale-b2b")}
              value={settings.templateVisibility.retailers}
              options={[
                {
                  value: "disabled",
                  label: __("Disabled", "yay-wholesale-b2b"),
                },
                {
                  value: "enabled",
                  label: __("Enabled", "yay-wholesale-b2b"),
                },
              ]}
              help={__(
                "Set the rule if retailers's shop page can apply this template.",
                "yay-wholesale-b2b"
              )}
              onChange={(value) =>
                handleChange({
                  ...settings,
                  templateVisibility: {
                    ...settings.templateVisibility,
                    retailers: value,
                  },
                })
              }
            />

            <SelectControl
              label={__("Wholesaler Access", "yay-wholesale-b2b")}
              value={settings.templateVisibility.wholesalers}
              options={[
                {
                  value: "disabled",
                  label: __("Disabled", "yay-wholesale-b2b"),
                },
                {
                  value: "enabled",
                  label: __("Enabled", "yay-wholesale-b2b"),
                },
                {
                  value: "enabled-selected-roles",
                  label: __("Enabled By Selected Roles", "yay-wholesale-b2b"),
                },
              ]}
              help={__(
                "Set the rule if wholesalers's shop page can apply this template.",
                "yay-wholesale-b2b"
              )}
              onChange={(value) =>
                handleChange({
                  ...settings,
                  templateVisibility: {
                    ...settings.templateVisibility,
                    wholesalers: value,
                  },
                })
              }
            />

            {isShowingRolesPanel && (
              <div>
                <h3>{__("ENABLED BY ROLES")}</h3>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "20px",
                  }}
                >
                  {WHOLESALE_ROLES.map((role) => (
                    <CheckboxControl
                      key={role.slug}
                      label={role.name}
                      checked={settings.templateVisibility.selected_roles.includes(
                        role.slug
                      )}
                      onChange={(checked) => {
                        const newSettings = {
                          ...settings,
                          templateVisibility: {
                            ...settings.templateVisibility,
                            selected_roles: checked
                              ? [
                                  ...settings.templateVisibility.selected_roles,
                                  role.slug,
                                ]
                              : settings.templateVisibility.selected_roles.filter(
                                  (rs) => rs !== role.slug
                                ),
                          },
                        };

                        handleChange(newSettings);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </PanelBody>
    </PluginSidebar>
  );
}
