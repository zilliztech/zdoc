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
  if (!Array.isArray(sidebar) || sidebar.length === 0) {
    throw new Error(`[zh-CN reference] ${name} generated sidebar must export a non-empty array`);
  }
  const overridden = applyOverrides(sidebar, overridePath) as unknown;
  if (!Array.isArray(overridden) || overridden.length === 0) {
    throw new Error(`[zh-CN reference] ${name} sidebar overrides produced an empty or invalid sidebar`);
  }
  return overridden as PublishedSidebar;
}
