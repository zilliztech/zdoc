import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import {toDocusaurusSidebar} from '../runtime.ts';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const generated = require('../../../../../generated/zh-CN/sidebars/guides.sidebar');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const generatedTools = require('../../../../../generated/zh-CN/sidebars/tools.sidebar');

const TOOLS_NAV_POSITION = 5;

export function insertToolsSidebarFragment<T>(base: readonly T[], fragment: readonly T[]): T[] {
  const items = [...base];
  items.splice(Math.min(TOOLS_NAV_POSITION, items.length), 0, ...fragment);
  return items;
}

const items = insertToolsSidebarFragment(
  toDocusaurusSidebar(generated.default ?? generated),
  toDocusaurusSidebar(generatedTools.default ?? generatedTools),
);

export default {default: items, tutorialSidebar: items, releasesSidebar: items} as SidebarsConfig;
