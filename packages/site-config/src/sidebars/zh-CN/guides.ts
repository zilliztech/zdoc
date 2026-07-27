import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import {toDocusaurusSidebar} from '../runtime.ts';
import {insertToolsSidebarFragment} from './guides-layout.ts';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const generated = require('../../../../../generated/zh-CN/sidebars/guides.sidebar');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const generatedTools = require('../../../../../generated/zh-CN/sidebars/tools.sidebar');

const items = insertToolsSidebarFragment(
  toDocusaurusSidebar(generated.default ?? generated),
  toDocusaurusSidebar(generatedTools.default ?? generatedTools),
);

export default {default: items, tutorialSidebar: items, releasesSidebar: items} as SidebarsConfig;
