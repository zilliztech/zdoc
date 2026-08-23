import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import {loadPublishedSidebar} from './referenceLoader';

// A generated sidebar that has not been seeded on this branch (e.g. a newly
// registered manual before its first zh-CN publish) resolves to an empty sidebar
// instead of failing the build — the mirror of the English loader.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function tryRequire(path: string): any[] {
  try { return require(path) } catch { return [] }
}

const sidebars = {
  pythonSidebar: loadPublishedSidebar("python", () => tryRequire('../../../../../generated/zh-CN/sidebars/python.sidebar'), require.resolve('../../../../../sidebar-overrides/zh-CN/python.json')),
  javaSidebar: loadPublishedSidebar("java", () => tryRequire('../../../../../generated/zh-CN/sidebars/java.sidebar'), require.resolve('../../../../../sidebar-overrides/zh-CN/java.json')),
  nodeSidebar: loadPublishedSidebar("node", () => tryRequire('../../../../../generated/zh-CN/sidebars/node.sidebar'), require.resolve('../../../../../sidebar-overrides/zh-CN/node.json')),
  goSidebar: loadPublishedSidebar("go", () => tryRequire('../../../../../generated/zh-CN/sidebars/go.sidebar'), require.resolve('../../../../../sidebar-overrides/zh-CN/go.json')),
  cppSidebar: loadPublishedSidebar("cpp", () => tryRequire('../../../../../generated/zh-CN/sidebars/cpp.sidebar'), require.resolve('../../../../../sidebar-overrides/zh-CN/cpp.json')),
  cliSidebar: loadPublishedSidebar("cli", () => tryRequire('../../../../../generated/zh-CN/sidebars/cli.sidebar'), require.resolve('../../../../../sidebar-overrides/zh-CN/cli.json')),
  restfulSidebar: loadPublishedSidebar("restful", () => tryRequire('../../../../../generated/zh-CN/sidebars/restful.sidebar'), require.resolve('../../../../../sidebar-overrides/zh-CN/restful.json')),
} satisfies SidebarsConfig;

export default sidebars;
