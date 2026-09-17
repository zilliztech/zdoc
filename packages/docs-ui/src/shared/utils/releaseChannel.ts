import type {PropSidebarItem} from '@docusaurus/plugin-content-docs';
import useIsBrowser from '@docusaurus/useIsBrowser';

export type ReleaseChannel = 'current' | 'next';

interface ZdocEnvLike {
  RELEASE_CHANNEL?: unknown;
}

/** Only an explicit NEXT value selects the next channel; anything else —
 * including a missing runtime injection — falls back to CURRENT so an unset
 * environment fails closed (unreleased pages stay hidden). */
export function normalizeReleaseChannel(value: unknown): ReleaseChannel {
  return String(value ?? '').trim().toLowerCase() === 'next' ? 'next' : 'current';
}

export function frontMatterReleaseChannel(
  frontMatter: Record<string, unknown> | undefined | null,
): ReleaseChannel {
  const record = (frontMatter ?? {}) as {channel?: unknown};
  return normalizeReleaseChannel(record.channel);
}

export function isNextReleaseChannel(channel: ReleaseChannel): boolean {
  return channel === 'next';
}

/** Reads the deployment channel injected at container start by the runtime
 * entrypoint into window.__ZDOC_ENV__.RELEASE_CHANNEL (env.js). */
export function runtimeReleaseChannel(): ReleaseChannel {
  if (typeof window === 'undefined') return 'current';
  const env = (window as {__ZDOC_ENV__?: ZdocEnvLike}).__ZDOC_ENV__;
  return normalizeReleaseChannel(env?.RELEASE_CHANNEL);
}

/** Hydration-safe channel: returns CURRENT during SSR/prerender and during
 * React hydration, then switches to the injected runtime channel on the
 * client (env.js is a blocking head script, so it is set before mount). */
export function useRuntimeReleaseChannel(): ReleaseChannel {
  const isBrowser = useIsBrowser();
  return isBrowser ? runtimeReleaseChannel() : 'current';
}

function sidebarItemChannel(item: PropSidebarItem): ReleaseChannel {
  const customProps = (item as {customProps?: {channel?: unknown}}).customProps;
  return normalizeReleaseChannel(customProps?.channel);
}

export function isNextChannelSidebarItem(item: PropSidebarItem): boolean {
  return sidebarItemChannel(item) === 'next';
}

/** Removes NEXT-channel items for CURRENT deployments. A category is dropped
 * when its own landing page is NEXT (the writer annotates the whole category)
 * or when filtering emptied children that previously existed; pre-existing
 * empty categories keep their current behavior. */
export function filterNextChannelSidebarItems(items: readonly PropSidebarItem[]): PropSidebarItem[] {
  const filtered: PropSidebarItem[] = [];
  for (const item of items) {
    if (isNextChannelSidebarItem(item)) continue;
    if (item.type === 'category') {
      const children = filterNextChannelSidebarItems(item.items);
      if (children.length === 0 && item.items.length > 0) continue;
      filtered.push(children.length === item.items.length ? item : {...item, items: children});
      continue;
    }
    filtered.push(item);
  }
  return filtered;
}
