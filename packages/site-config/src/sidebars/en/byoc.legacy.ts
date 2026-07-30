import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';
import {toDocusaurusSidebar} from '../runtime.ts';

// Compatibility shim for tooling that still imports the former root loader.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const generated = require('../../../../../generated/en/sidebars/guides-byoc.sidebar');

const items = toDocusaurusSidebar(generated.default ?? generated);
const sidebars = {default: items, tutorialSidebar: items} as SidebarsConfig;

export default sidebars;
