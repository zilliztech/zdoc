import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// Compatibility shim for tooling that still imports the former root loader.
// The active profile points directly at this generated wrapper.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const generated = require('../../../../../generated/en/sidebars/guides-byoc.sidebar');

const sidebars: SidebarsConfig = generated.default ?? generated;

export default sidebars;
