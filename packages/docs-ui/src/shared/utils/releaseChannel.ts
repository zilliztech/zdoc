import {useEffect, useState} from 'react';
import type {PropSidebarItem} from '@docusaurus/plugin-content-docs';

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
 * React hydration (matching the prerendered HTML exactly), then switches to
 * the injected runtime channel after mount. env.js is a blocking head script,
 * so the runtime value is already present when the switch happens. */
export function useRuntimeReleaseChannel(): ReleaseChannel {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted ? runtimeReleaseChannel() : 'current';
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
 * empty categories keep their current behavior.
 *
 * Change tracking, not a child-count comparison: a category whose own child
 * list is untouched can still hold a filtered descendant (the SSO leaf sits
 * three levels down), and the ancestors of that leaf keep the same direct child
 * count. Returning the rebuilt children only when the subtree actually changed
 * keeps unfiltered categories reference-identical for React. */
function filterNextChannelItems(
  items: readonly PropSidebarItem[],
): {items: PropSidebarItem[]; changed: boolean} {
  const filtered: PropSidebarItem[] = [];
  let changed = false;
  for (const item of items) {
    if (isNextChannelSidebarItem(item)) {
      changed = true;
      continue;
    }
    if (item.type === 'category') {
      const children = filterNextChannelItems(item.items);
      if (children.items.length === 0 && item.items.length > 0) {
        changed = true;
        continue;
      }
      if (children.changed) changed = true;
      filtered.push(children.changed ? {...item, items: children.items} : item);
      continue;
    }
    filtered.push(item);
  }
  return {items: filtered, changed};
}

export function filterNextChannelSidebarItems(items: readonly PropSidebarItem[]): PropSidebarItem[] {
  return filterNextChannelItems(items).items;
}

function normalizeSidebarPath(path: string): string {
  return path.replace(/\/+$/, '');
}

function sidebarItemHref(item: PropSidebarItem): string | undefined {
  if (item.type === 'link') return item.href;
  // Runtime doc/ref items carry their resolved href even though the public
  // type does not declare it; categories expose their landing link the same way.
  return (item as {href?: string}).href;
}

/** Whether the sidebar entry resolving to `pathname` is NEXT-channel — used by
 * the docs shell to swap in the shared 404 page before any doc chrome mounts.
 * Page-exact by design: a CURRENT page below a NEXT category still renders. */
export function sidebarPathIsNextChannel(
  items: readonly PropSidebarItem[],
  pathname: string,
): boolean {
  const target = normalizeSidebarPath(pathname);
  for (const item of items) {
    if (isNextChannelSidebarItem(item)) {
      const href = sidebarItemHref(item);
      if (href && normalizeSidebarPath(href) === target) return true;
    }
    if (item.type === 'category' && sidebarPathIsNextChannel(item.items, pathname)) {
      return true;
    }
  }
  return false;
}

/** Pagination links (previous/next) follow the sidebar order, so a CURRENT
 * deployment must drop the targets the sidebar hides and the nginx gate 404s.
 * Docusaurus stores only `{title, permalink}`, hence the lookup by permalink.
 * Callers on NEXT deployments skip this entirely instead of passing an empty
 * sidebar, so a missing sidebar never reads as "nothing to filter". */
export function filterNextChannelPaginationLinks<T extends {permalink: string}>(
  previous: T | undefined,
  next: T | undefined,
  sidebarItems: readonly PropSidebarItem[] | undefined,
): {previous: T | undefined; next: T | undefined} {
  if (!sidebarItems) return {previous, next};
  const isBlocked = (link: T | undefined): boolean =>
    !!link && sidebarPathIsNextChannel(sidebarItems, link.permalink);
  return {
    previous: isBlocked(previous) ? undefined : previous,
    next: isBlocked(next) ? undefined : next,
  };
}
