import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import {loadPublishedSidebar} from './referenceLoader';

const sidebars = {
  pythonSidebar: loadPublishedSidebar('python', () => require('../../../../../generated/zh-CN/sidebars/python.sidebar'), require.resolve('../../../../../sidebar-overrides/zh-CN/python.json')),
  javaSidebar: loadPublishedSidebar('java', () => require('../../../../../generated/zh-CN/sidebars/java.sidebar'), require.resolve('../../../../../sidebar-overrides/zh-CN/java.json')),
  nodeSidebar: loadPublishedSidebar('node', () => require('../../../../../generated/zh-CN/sidebars/node.sidebar'), require.resolve('../../../../../sidebar-overrides/zh-CN/node.json')),
  goSidebar: loadPublishedSidebar('go', () => require('../../../../../generated/zh-CN/sidebars/go.sidebar'), require.resolve('../../../../../sidebar-overrides/zh-CN/go.json')),
  restfulSidebar: loadPublishedSidebar('restful', () => require('../../../../../generated/zh-CN/sidebars/restful.sidebar'), require.resolve('../../../../../sidebar-overrides/zh-CN/restful.json')),
  cliSidebar: loadPublishedSidebar('cli', () => require('../../../../../generated/zh-CN/sidebars/cli.sidebar'), require.resolve('../../../../../sidebar-overrides/zh-CN/cli.json')),
} satisfies SidebarsConfig;

export default sidebars;
