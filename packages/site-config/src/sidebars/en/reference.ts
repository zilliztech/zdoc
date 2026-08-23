import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// Generated sidebar files are produced through the docs-tooling manual pipeline.
// Run `pnpm docs-tooling fetch|validate|publish --manual <name> --group <group> --site en --stage <dir>`.
// To customise without regenerating, edit the corresponding file in sidebar-overrides/en/.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tryRequire(path: string): any[] {
  try { return require(path) } catch { return [] }
}
// sidebar-overrides/en is a dev-owned path, so a newly registered manual has no
// override placeholder on master. Resolve tolerantly: a missing override falls
// through to applyOverrides, which returns the sidebar unchanged.
function tryResolve(path: string): string {
  try { return require.resolve(path) } catch { return path }
}
// eslint-disable-next-line @typescript-eslint/no-var-requires
const applyOverrides = require('../../../../../config/applyOverrides')

const sidebars: SidebarsConfig = {
  // SDK reference sidebars — generated from Feishu drive/wiki sources
  pythonSidebar: applyOverrides(tryRequire('../../../../../generated/en/sidebars/python.sidebar'), tryResolve('../../../../../sidebar-overrides/en/python.json')),
  javaSidebar: applyOverrides(tryRequire('../../../../../generated/en/sidebars/java.sidebar'), tryResolve('../../../../../sidebar-overrides/en/java.json')),
  nodeSidebar: applyOverrides(tryRequire('../../../../../generated/en/sidebars/node.sidebar'), tryResolve('../../../../../sidebar-overrides/en/node.json')),
  goSidebar: applyOverrides(tryRequire('../../../../../generated/en/sidebars/go.sidebar'), tryResolve('../../../../../sidebar-overrides/en/go.json')),
  cppSidebar: applyOverrides(tryRequire('../../../../../generated/en/sidebars/cpp.sidebar'), tryResolve('../../../../../sidebar-overrides/en/cpp.json')),
  cliSidebar: applyOverrides(tryRequire('../../../../../generated/en/sidebars/cli.sidebar'), tryResolve('../../../../../sidebar-overrides/en/cli.json')),
  // REST API reference sidebar — generated from Apifox specifications
  restfulSidebar: applyOverrides(tryRequire('../../../../../generated/en/sidebars/restful.sidebar'), tryResolve('../../../../../sidebar-overrides/en/restful.json')),
};

export default sidebars;
