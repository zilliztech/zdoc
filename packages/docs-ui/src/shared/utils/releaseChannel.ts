import {useEffect, useState} from 'react';
import type {PropSidebarItem} from '@docusaurus/plugin-content-docs';

export type ReleaseChannel = 'current' | 'next' | 'retire-in-next';

interface ZdocEnvLike {
  RELEASE_CHANNEL?: unknown;
}

/** Only an explicit NEXT or RETIRE-IN-NEXT value selects that channel;
 * anything else — including a missing runtime injection — falls back to
 * CURRENT, so an unset environment fails closed for NEXT pages (unreleased
 * content stays hidden). RETIRE-IN-NEXT is the mirror: the page stays served
 * wherever the runtime channel is unknown, which only ever exposes content
 * that is already live in production. */
export function normalizeReleaseChannel(value: unknown): ReleaseChannel {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (normalized === 'next') return 'next';
  if (normalized === 'retire-in-next') return 'retire-in-next';
  return 'current';
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

export function isRetiredChannelSidebarItem(item: PropSidebarItem): boolean {
  return sidebarItemChannel(item) === 'retire-in-next';
}

/** Removes blocked items for the deployment's hidden channel: NEXT items on
 * CURRENT deployments, RETIRE-IN-NEXT items on NEXT deployments. A category
 * is dropped when its own landing page is blocked (the writer annotates the
 * whole category) or when filtering emptied children that previously existed;
 * pre-existing empty categories keep their current behavior.
 *
 * Change tracking, not a child-count comparison: a category whose own child
 * list is untouched can still hold a filtered descendant (the SSO leaf sits
 * three levels down), and the ancestors of that leaf keep the same direct child
 * count. Returning the rebuilt children only when the subtree actually changed
 * keeps unfiltered categories reference-identical for React. */
function filterChannelBlockedItems(
  items: readonly PropSidebarItem[],
  isBlocked: (item: PropSidebarItem) => boolean,
): {items: PropSidebarItem[]; changed: boolean} {
  const filtered: PropSidebarItem[] = [];
  let changed = false;
  for (const item of items) {
    if (isBlocked(item)) {
      changed = true;
      continue;
    }
    if (item.type === 'category') {
      const children = filterChannelBlockedItems(item.items, isBlocked);
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
  return filterChannelBlockedItems(items, isNextChannelSidebarItem).items;
}

export function filterRetiredChannelSidebarItems(items: readonly PropSidebarItem[]): PropSidebarItem[] {
  return filterChannelBlockedItems(items, isRetiredChannelSidebarItem).items;
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

/** Whether the sidebar entry resolving to `pathname` is on the hidden channel
 * for this predicate — used by the docs shell to swap in the shared 404 page
 * before any doc chrome mounts. Page-exact by design: a CURRENT page below a
 * NEXT category still renders. */
function sidebarPathIsChannelBlocked(
  items: readonly PropSidebarItem[],
  pathname: string,
  isBlocked: (item: PropSidebarItem) => boolean,
): boolean {
  const target = normalizeSidebarPath(pathname);
  for (const item of items) {
    if (isBlocked(item)) {
      const href = sidebarItemHref(item);
      if (href && normalizeSidebarPath(href) === target) return true;
    }
    if (item.type === 'category' && sidebarPathIsChannelBlocked(item.items, pathname, isBlocked)) {
      return true;
    }
  }
  return false;
}

export function sidebarPathIsNextChannel(
  items: readonly PropSidebarItem[],
  pathname: string,
): boolean {
  return sidebarPathIsChannelBlocked(items, pathname, isNextChannelSidebarItem);
}

export function sidebarPathIsRetiredChannel(
  items: readonly PropSidebarItem[],
  pathname: string,
): boolean {
  return sidebarPathIsChannelBlocked(items, pathname, isRetiredChannelSidebarItem);
}

/** Pagination links (previous/next) follow the sidebar order, so a deployment
 * must drop the targets its sidebar hides and the nginx gate 404s: CURRENT
 * drops NEXT targets, NEXT drops RETIRE-IN-NEXT targets. Docusaurus stores
 * only `{title, permalink}`, hence the lookup by permalink. Callers skip this
 * entirely instead of passing an empty sidebar, so a missing sidebar never
 * reads as "nothing to filter". */
function filterChannelBlockedPaginationLinks<T extends {permalink: string}>(
  previous: T | undefined,
  next: T | undefined,
  sidebarItems: readonly PropSidebarItem[] | undefined,
  isPathBlocked: (items: readonly PropSidebarItem[], pathname: string) => boolean,
): {previous: T | undefined; next: T | undefined} {
  if (!sidebarItems) return {previous, next};
  const isBlocked = (link: T | undefined): boolean =>
    !!link && isPathBlocked(sidebarItems, link.permalink);
  return {
    previous: isBlocked(previous) ? undefined : previous,
    next: isBlocked(next) ? undefined : next,
  };
}

export function filterNextChannelPaginationLinks<T extends {permalink: string}>(
  previous: T | undefined,
  next: T | undefined,
  sidebarItems: readonly PropSidebarItem[] | undefined,
): {previous: T | undefined; next: T | undefined} {
  return filterChannelBlockedPaginationLinks(previous, next, sidebarItems, sidebarPathIsNextChannel);
}

export function filterRetiredChannelPaginationLinks<T extends {permalink: string}>(
  previous: T | undefined,
  next: T | undefined,
  sidebarItems: readonly PropSidebarItem[] | undefined,
): {previous: T | undefined; next: T | undefined} {
  return filterChannelBlockedPaginationLinks(previous, next, sidebarItems, sidebarPathIsRetiredChannel);
}
