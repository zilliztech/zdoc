import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// Generated sidebar files are produced by `docusaurus fetch-lark-docs`.
// Run `docusaurus fetch-lark-docs --manual <name> --pubTarget zilliz` to regenerate.
// To customise without regenerating, edit the corresponding file in sidebar-overrides/en/.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tryRequire(path: string): any[] {
  try { return require(path) } catch { return [] }
}
// eslint-disable-next-line @typescript-eslint/no-var-requires
const applyOverrides = require('../../../../../config/applyOverrides')

const sidebars: SidebarsConfig = {
  // SDK reference sidebars — generated from Feishu drive/wiki sources
  pythonSidebar:  applyOverrides(tryRequire('../../../../../generated/en/sidebars/python.sidebar'), require.resolve('../../../../../sidebar-overrides/en/python.json')),
  javaSidebar:    applyOverrides(tryRequire('../../../../../generated/en/sidebars/java.sidebar'),   require.resolve('../../../../../sidebar-overrides/en/java.json')),
  nodeSidebar:    applyOverrides(tryRequire('../../../../../generated/en/sidebars/node.sidebar'),   require.resolve('../../../../../sidebar-overrides/en/node.json')),
  goSidebar:      applyOverrides(tryRequire('../../../../../generated/en/sidebars/go.sidebar'),     require.resolve('../../../../../sidebar-overrides/en/go.json')),
  cliSidebar:     applyOverrides(tryRequire('../../../../../generated/en/sidebars/cli.sidebar'),    require.resolve('../../../../../sidebar-overrides/en/cli.json')),
  // REST API reference sidebar — generated from Apifox specifications
  restfulSidebar: applyOverrides(tryRequire('../../../../../generated/en/sidebars/restful.sidebar'), require.resolve('../../../../../sidebar-overrides/en/restful.json')),
};

export default sidebars;
