const applyOverrides = require('../../../config/applyOverrides');
const items = require('./guides-byoc.items');

const sidebars = {
  default: applyOverrides(items, require.resolve('../../../sidebar-overrides/en/guides-byoc.json')),
};

Object.defineProperty(exports, '__esModule', {value: true});
exports.default = sidebars;
