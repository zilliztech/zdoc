import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import {toDocusaurusSidebar} from '../runtime.ts';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const generated = require('../../../../../generated/zh-CN/sidebars/guides.sidebar');
const items = toDocusaurusSidebar(generated.default ?? generated);

export default {default: items, tutorialSidebar: items, releasesSidebar: items} as SidebarsConfig;
