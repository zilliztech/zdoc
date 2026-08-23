import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const applyOverrides = require('../../../../../config/applyOverrides');

type PublishedSidebar = Extract<SidebarsConfig[string], readonly unknown[]>;

export function loadPublishedSidebar(
  name: string,
  load: () => unknown,
  overridePath: string,
): PublishedSidebar {
  let loaded: unknown;
  try {
    loaded = load();
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error);
    throw new Error(`[zh-CN reference] ${name} generated sidebar could not be loaded: ${detail}`, {cause: error});
  }
  const sidebar = loaded && typeof loaded === 'object' && !Array.isArray(loaded) && 'default' in loaded
    ? (loaded as {default: unknown}).default
    : loaded;
  if (!Array.isArray(sidebar)) {
    throw new Error(`[zh-CN reference] ${name} generated sidebar must export a non-empty array`);
  }
  if (sidebar.length === 0) {
    // A reference whose translation has not landed yet yields a valid but empty
    // generated sidebar (`module.exports = []`), e.g. a newly added manual such as
    // cpp before its zh-CN translation is published. Tolerate it as an absent
    // reference — Docusaurus renders no navigation for an empty sidebar — while
    // still failing closed on a missing or non-array artifact above.
    return sidebar as PublishedSidebar;
  }
  const overridden = applyOverrides(sidebar, overridePath) as unknown;
  if (!Array.isArray(overridden) || overridden.length === 0) {
    throw new Error(`[zh-CN reference] ${name} sidebar overrides produced an empty or invalid sidebar`);
  }
  return overridden as PublishedSidebar;
}
