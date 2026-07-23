// import RequirementSettings, {
//   addAttributesToBlocks,
// } from "./components/RequirementSetting";
import TemplateSettingSidebar from "./components/TemplateSettingSidebar";
import { registerPlugin } from "@wordpress/plugins";

// #region Requiremnt Setting
// Add Attributes
// wp.hooks.addFilter(
//   "blocks.registerBlockType",
//   "ywhs/requirement-toggle",
//   addAttributesToBlocks
// );

// // Render UI
// wp.hooks.addFilter(
//   "editor.BlockEdit",
//   "ywhs/requirement-toggle",
//   RequirementSettings
// );
// #endregion

// #region Template Setting Sidebar
registerPlugin("ywhs-template-settings", {
  render: TemplateSettingSidebar,
});
// #endregion
