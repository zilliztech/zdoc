import {useEffect} from 'react';

const RECENT_KEY = 'zdoc-recent-searches';

type RecentItem = {
  title: string;
  query?: string;
  href?: string;
  meta?: string;
  kind?: 'doc' | 'section' | 'blog' | 'query';
};

const SUGGESTED = [
  {title: 'Getting Started', meta: 'Zilliz-Managed Cloud / Quick Start', href: '/docs/create-cluster'},
  {title: 'Search Guide', meta: 'Zilliz-Managed Cloud / Search', href: '/docs/single-vector-search'},
  {title: 'API Reference', meta: 'API & SDK / REST API', href: '/reference/restful'},
  {title: 'Python SDK', meta: 'API & SDK / Python SDK', href: '/reference/python'},
];

const CATEGORY_META = new Set(['docs', 'guides', 'byoc', 'reference', 'support', 'partners', 'event', 'glossary', 'cloud']);

function normalizeHref(value: unknown) {
  if (typeof value !== 'string') return undefined;
  const href = value.trim();
  if (!href) return undefined;
  try {
    return new URL(href, window.location.origin).pathname.replace(/\/$/, '') || '/';
  } catch {
    return href.replace(/\/$/, '') || '/';
  }
}

// A single top-level section tag (Docs / Reference) shown as a small chip in
// place of the full breadcrumb path.
function sectionTag(href?: string): string | undefined {
  const path = normalizeHref(href);
  if (!path) return undefined;
  if (path.startsWith('/reference')) return 'Reference';
  if (path.startsWith('/docs')) return 'Docs';
  return undefined;
}

function inferBreadcrumbMeta(title: string, href?: string) {
  const path = normalizeHref(href);
  const suggested = SUGGESTED.find(item =>
    item.title.toLowerCase() === title.toLowerCase() ||
    normalizeHref(item.href) === path
  );
  if (suggested) return suggested.meta;

  if (!path) return undefined;
  if (path.startsWith('/reference/restful')) return 'API & SDK / REST API';
  if (path.startsWith('/reference/python')) return 'API & SDK / Python SDK';
  if (path.startsWith('/reference/java')) return 'API & SDK / Java SDK';
  if (path.startsWith('/reference/go')) return 'API & SDK / Go SDK';
  if (path.startsWith('/reference/node')) return 'API & SDK / Node SDK';
  if (path.startsWith('/reference')) return 'API & SDK';
  if (path.startsWith('/docs/byoc')) return 'Bring Your Own Cloud';
  if (path.includes('/search') || title.toLowerCase().includes('search')) return 'Zilliz-Managed Cloud / Search';
  if (path.startsWith('/docs')) return 'Zilliz-Managed Cloud';
  return undefined;
}

function normalizeRecentItem(item: unknown): RecentItem | null {
  if (typeof item === 'string') {
    const title = item.trim();
    return title ? {title, query: title} : null;
  }
  if (!item || typeof item !== 'object') return null;
  const record = item as Partial<RecentItem>;
  const title = typeof record.title === 'string' ? record.title.trim() : '';
  if (!title) return null;
  const href = typeof record.href === 'string' ? record.href.trim() : undefined;
  // Re-infer from the href first so renamed sections (e.g. Cloud Guides →
  // Zilliz-Managed Cloud) update; fall back to any stored meta only if we can't.
  const meta = inferBreadcrumbMeta(title, href) || normalizeBreadcrumbMeta(record.meta);
  return {
    title,
    query: typeof record.query === 'string' ? record.query.trim() : undefined,
    href,
    meta,
    kind: record.kind === 'doc' || record.kind === 'section' || record.kind === 'blog' || record.kind === 'query'
      ? record.kind
      : undefined,
  };
}

function readRecent(): RecentItem[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(RECENT_KEY) || '[]');
    return Array.isArray(parsed)
      ? parsed
        .map(normalizeRecentItem)
        .filter((item): item is RecentItem => Boolean(item?.href))
        .slice(0, 3)
      : [];
  } catch {
    return [];
  }
}

function writeRecent(item: RecentItem | string) {
  const nextItem = normalizeRecentItem(item);
  if (!nextItem) return;
  const key = (nextItem.href || nextItem.query || nextItem.title).toLowerCase();
  const next = [
    nextItem,
    ...readRecent().filter(record =>
      (record.href || record.query || record.title).toLowerCase() !== key
    ),
  ].slice(0, 3);
  window.localStorage.setItem(RECENT_KEY, JSON.stringify(next));
}

const forwardedInputEvents = new WeakSet<Event>();
const pendingSearchTimers = new WeakMap<HTMLInputElement, number>();
const askAiInterceptedRoots = new WeakSet<ShadowRoot>();
const SEARCH_TRIGGER_DELAY_MS = 1200;
const IME_SEARCH_TRIGGER_DELAY_MS = 700;
const MIN_SEARCH_QUERY_LENGTH = 2;

function dispatchForwardedInput(input: HTMLInputElement) {
  const event = new Event('input', {bubbles: true});
  forwardedInputEvents.add(event);
  input.dispatchEvent(event);
}

function setSearchInputValue(input: HTMLInputElement, value: string, notify = true) {
  const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;
  setter?.call(input, value);
  if (notify) dispatchForwardedInput(input);
}

function fillSearchInput(input: HTMLInputElement, value: string) {
  setSearchInputValue(input, value);
  input.focus();
}

function clearPendingSearch(input: HTMLInputElement) {
  const timer = pendingSearchTimers.get(input);
  if (timer) window.clearTimeout(timer);
  pendingSearchTimers.delete(input);
}

function flushPendingSearch(root: ShadowRoot, input: HTMLInputElement) {
  clearPendingSearch(input);
  delete input.dataset.zdocSearchPending;
  delete input.dataset.zdocImeComposing;
  if (input.value.trim()) input.dataset.zdocSearchAwaiting = 'true';
  dispatchForwardedInput(input);
  syncEmptyState(root);
  syncLoadingState(root);
}

function scheduleSearch(root: ShadowRoot, input: HTMLInputElement, delay = SEARCH_TRIGGER_DELAY_MS) {
  clearPendingSearch(input);
  const query = input.value.trim();
  if (!query) {
    flushPendingSearch(root, input);
    return;
  }
  if (query.length < MIN_SEARCH_QUERY_LENGTH) {
    input.dataset.zdocSearchPending = 'true';
    delete input.dataset.zdocSearchAwaiting;
    syncEmptyState(root);
    syncLoadingState(root);
    return;
  }
  delete input.dataset.zdocSearchPending;
  input.dataset.zdocSearchAwaiting = 'true';
  syncEmptyState(root);
  syncLoadingState(root);
  const timer = window.setTimeout(() => {
    if (!input.isConnected || input.dataset.zdocImeComposing === 'true') return;
    flushPendingSearch(root, input);
  }, delay);
  pendingSearchTimers.set(input, timer);
}

function resetSearchRoot(root: ShadowRoot) {
  const input = root.querySelector<HTMLInputElement>('.ikp-ai-search-input');
  if (!input) return;
  clearPendingSearch(input);
  delete input.dataset.zdocSearchPending;
  delete input.dataset.zdocImeComposing;
  delete input.dataset.zdocSearchAwaiting;
  if (input.value) setSearchInputValue(input, '', false);
  root.querySelectorAll<HTMLElement>('.ikp-ai-search-results__item, .ikp-ai-search-results__loading').forEach(item => item.remove());
  syncEmptyState(root);
  syncLoadingState(root);
}

function itemIcon(kind: 'doc' | 'section' | 'blog' | 'query') {
  if (kind === 'query') {
    return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M20 20l-3.8-3.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.5"/></svg>';
  }
  if (kind === 'section') {
    return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 9h14" stroke="currentColor" stroke-width="1.45" stroke-linecap="round"/><path d="M5 15h14" stroke="currentColor" stroke-width="1.45" stroke-linecap="round"/><path d="M10 4.5 8.25 19.5" stroke="currentColor" stroke-width="1.45" stroke-linecap="round"/><path d="M15.75 4.5 14 19.5" stroke="currentColor" stroke-width="1.45" stroke-linecap="round"/></svg>';
  }
  if (kind === 'blog') {
    return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="8.25" stroke="currentColor" stroke-width="1.35"/><path d="M4 12h16" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/><path d="M12 3.75c2.1 2.15 3.15 4.9 3.15 8.25S14.1 18.1 12 20.25" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/><path d="M12 3.75c-2.1 2.15-3.15 4.9-3.15 8.25s1.05 6.1 3.15 8.25" stroke="currentColor" stroke-width="1.35" stroke-linecap="round"/></svg>';
  }
  return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 5.5h6.2c1 0 1.8.8 1.8 1.8v11.2c0-1.1-.9-2-2-2H4V5.5Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/><path d="M20 5.5h-6.2c-1 0-1.8.8-1.8 1.8v11.2c0-1.1.9-2 2-2h6V5.5Z" stroke="currentColor" stroke-width="1.35" stroke-linejoin="round"/></svg>';
}

function normalizeBreadcrumbMeta(value: unknown) {
  const meta = typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';
  if (!meta) return undefined;
  if (CATEGORY_META.has(meta.toLowerCase())) return undefined;
  return meta;
}

function getResultBreadcrumbMeta(item: HTMLElement) {
  const breadcrumbs = normalizeBreadcrumbMeta(
    item.querySelector<HTMLElement>('.ikp-ai-search-results__item-breadcrumbs')?.textContent,
  );
  if (breadcrumbs) return breadcrumbs;

  const description = item.querySelector<HTMLElement>('.ikp-ai-search-results__item-description');
  const rawDescription = description?.textContent?.replace(/\s+/g, ' ').trim() || '';
  const parts = rawDescription.split(/\s+\|\s+/).map(part => part.trim()).filter(Boolean);
  if (description && parts.length > 1) {
    description.textContent = parts[0];
    return normalizeBreadcrumbMeta(parts.slice(1).join(' / '));
  }

  return undefined;
}

function createItem(root: ShadowRoot, options: {
  title: string;
  meta?: string;
  href?: string;
  query?: string;
  kind: 'doc' | 'section' | 'blog' | 'query';
  recent?: boolean;
}) {
  const item = root.ownerDocument.createElement('button');
  item.type = 'button';
  item.className = `zdoc-empty-search-item${options.recent ? ' zdoc-empty-search-item--recent' : ''}`;
  const tag = options.recent ? undefined : sectionTag(options.href);
  const meta = options.recent ? options.meta : undefined;
  item.innerHTML = `
    <span class="zdoc-empty-search-icon">${itemIcon(options.kind)}</span>
    <span class="zdoc-empty-search-title">${options.title}</span>
    ${meta ? `<span class="zdoc-empty-search-meta">${meta}</span>` : ''}
    ${tag ? `<span class="zdoc-empty-search-tag">${tag}</span>` : ''}
  `;
  item.addEventListener('click', () => {
    if (options.href) {
      writeRecent({
        title: options.title,
        href: options.href,
        meta: options.meta,
        kind: options.kind,
      });
      window.location.href = options.href;
      return;
    }
    if (options.query) {
      const input = root.querySelector<HTMLInputElement>('.ikp-ai-search-input');
      if (input) fillSearchInput(input, options.query);
    }
  });
  return item;
}

function buildEmptyState(root: ShadowRoot, extraClassName = '') {
  const wrapper = root.ownerDocument.createElement('div');
  wrapper.className = `zdoc-empty-search${extraClassName ? ` ${extraClassName}` : ''}`;

  const recent = readRecent();
  if (recent.length) {
    wrapper.classList.add('zdoc-empty-search--has-recent');
    const recentSection = root.ownerDocument.createElement('div');
    recentSection.className = 'zdoc-empty-search-section zdoc-empty-search-section--recent';
    recentSection.innerHTML = '<p class="zdoc-empty-search-heading">Recent</p>';
    recent.forEach(item => recentSection.appendChild(createItem(root, {
      title: item.title,
      meta: item.meta,
      href: item.href,
      query: item.href ? undefined : item.query || item.title,
      kind: item.kind || (item.href ? 'doc' : 'query'),
      recent: true,
    })));
    wrapper.appendChild(recentSection);
  }

  const suggested = root.ownerDocument.createElement('div');
  suggested.className = 'zdoc-empty-search-section';
  suggested.innerHTML = '<p class="zdoc-empty-search-heading">Suggested</p>';
  SUGGESTED.forEach(item => suggested.appendChild(createItem(root, {
    title: item.title,
    meta: item.meta,
    href: item.href,
    kind: 'doc',
  })));
  wrapper.appendChild(suggested);

  return wrapper;
}

function ensureStyles(root: ShadowRoot) {
  if (root.getElementById('zdoc-empty-search-styles')) return;
  const style = root.ownerDocument.createElement('style');
  style.id = 'zdoc-empty-search-styles';
  style.textContent = `
    .ikp-ai-search-root[data-zdoc-search-has-query='true']:not([data-zdoc-search-loading='true']):not([data-zdoc-search-awaiting='true']) .ikp-ai-search-content,
    .ikp-ai-search-root[data-zdoc-search-has-query='true']:not([data-zdoc-search-loading='true']):not([data-zdoc-search-awaiting='true']) .ikp-ai-search-results,
    .ikp-ai-search-root[data-zdoc-search-has-query='true']:not([data-zdoc-search-loading='true']):not([data-zdoc-search-awaiting='true']) .ikp-ai-search-results__scroll-area,
    .ikp-ai-search-root[data-zdoc-search-has-query='true']:not([data-zdoc-search-loading='true']):not([data-zdoc-search-awaiting='true']) .ikp-ai-search-results__list {
      flex: 0 1 auto !important;
      height: auto !important;
      min-height: 0 !important;
    }
    .ikp-ai-search-root[data-zdoc-search-has-query='true']:not([data-zdoc-search-loading='true']):not([data-zdoc-search-awaiting='true']) .ikp-ai-search-results {
      max-height: 414px !important;
      overflow-y: auto !important;
    }
    .ikp-ai-search-root[data-zdoc-search-has-query='true'][data-zdoc-search-has-results='false']:not([data-zdoc-search-loading='true']):not([data-zdoc-search-awaiting='true']) .ikp-ai-search-results {
      display: none !important;
      padding: 0 !important;
    }
    .ikp-ai-search-root:has(.zdoc-ask-ai-query):not([data-zdoc-search-loading='true']):not([data-zdoc-search-awaiting='true']) .ikp-ai-search-content,
    .ikp-ai-search-root:has(.zdoc-ask-ai-query):not([data-zdoc-search-loading='true']):not([data-zdoc-search-awaiting='true']) .ikp-ai-search-results,
    .ikp-ai-search-root:has(.zdoc-ask-ai-query):not([data-zdoc-search-loading='true']):not([data-zdoc-search-awaiting='true']) .ikp-ai-search-results__scroll-area,
    .ikp-ai-search-root:has(.zdoc-ask-ai-query):not([data-zdoc-search-loading='true']):not([data-zdoc-search-awaiting='true']) .ikp-ai-search-results__list {
      flex: 0 1 auto !important;
      height: auto !important;
      min-height: 0 !important;
    }
    .ikp-ai-search-root:has(.zdoc-ask-ai-query):not([data-zdoc-search-loading='true']):not([data-zdoc-search-awaiting='true']) .ikp-ai-search-results {
      max-height: 414px !important;
      overflow-y: auto !important;
    }
    .ikp-ai-search-root:has(.zdoc-ask-ai-query):not([data-zdoc-search-loading='true']):not([data-zdoc-search-awaiting='true']) .ikp-ai-search-results:not(:has(.ikp-ai-search-results__item)) {
      display: none !important;
      padding: 0 !important;
    }
    .ikp-ai-search-root:has(.zdoc-ask-ai-query):not([data-zdoc-search-loading='true']):not([data-zdoc-search-awaiting='true']) .ikp-ai-ask-ai-trigger {
      display: flex !important;
      align-items: center !important;
      gap: 10px !important;
      height: 42px !important;
      min-height: 42px !important;
      width: calc(100% - 24px) !important;
      margin: 8px 12px 0 !important;
      padding: 9px 14px !important;
      border: 0 !important;
      border-radius: 12px !important;
      background: #e5faf8 !important;
      color: #111827 !important;
      box-shadow: none !important;
      opacity: 1 !important;
      visibility: visible !important;
    }
    .ikp-ai-search-root:has(.zdoc-ask-ai-query):not([data-zdoc-search-loading='true']):not([data-zdoc-search-awaiting='true']) .ikp-ai-ask-ai-trigger:hover {
      background: #d9f5f2 !important;
    }
    .ikp-ai-search-root:has(.zdoc-ask-ai-query):not([data-zdoc-search-loading='true']):not([data-zdoc-search-awaiting='true']) .ikp-ai-ask-ai-trigger::before {
      content: "" !important;
      display: inline-block !important;
      width: 8px !important;
      height: 14px !important;
      flex: 0 0 auto !important;
      background: #111827 !important;
      mask: url("data:image/svg+xml,%3Csvg%20width='8'%20height='14'%20viewBox='0%200%208%2014'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3E%3Cpath%20d='M0%208.55556L5.6%200L4.8%205.64912H8L1.6%2014L3.2%208.55556H0Z'%20fill='black'/%3E%3C/svg%3E") center / contain no-repeat !important;
      -webkit-mask: url("data:image/svg+xml,%3Csvg%20width='8'%20height='14'%20viewBox='0%200%208%2014'%20fill='none'%20xmlns='http://www.w3.org/2000/svg'%3E%3Cpath%20d='M0%208.55556L5.6%200L4.8%205.64912H8L1.6%2014L3.2%208.55556H0Z'%20fill='black'/%3E%3C/svg%3E") center / contain no-repeat !important;
    }
    .ikp-ai-search-root:has(.zdoc-ask-ai-query):not([data-zdoc-search-loading='true']):not([data-zdoc-search-awaiting='true']) .ikp-ai-ask-ai-trigger__icon,
    .ikp-ai-search-root:has(.zdoc-ask-ai-query):not([data-zdoc-search-loading='true']):not([data-zdoc-search-awaiting='true']) .ikp-ai-ask-ai-trigger__indicator,
    .ikp-ai-search-root:has(.zdoc-ask-ai-query):not([data-zdoc-search-loading='true']):not([data-zdoc-search-awaiting='true']) .ikp-ai-ask-ai-trigger__indicator-text {
      display: none !important;
    }
    .ikp-ai-search-root:has(.zdoc-ask-ai-query):not([data-zdoc-search-loading='true']):not([data-zdoc-search-awaiting='true']) .ikp-ai-ask-ai-trigger__label,
    .ikp-ai-search-root:has(.zdoc-ask-ai-query):not([data-zdoc-search-loading='true']):not([data-zdoc-search-awaiting='true']) .ikp-ai-ask-ai-trigger__label * {
      color: #111827 !important;
      background: transparent !important;
      font-size: 14px !important;
      line-height: 20px !important;
      font-weight: 500 !important;
    }
    .ikp-ai-search-root:has(.zdoc-ask-ai-query):not([data-zdoc-search-loading='true']):not([data-zdoc-search-awaiting='true']) .ikp-ai-ask-ai-trigger__label .zdoc-ask-ai-query {
      font-weight: 600 !important;
    }
    .zdoc-empty-search {
      box-sizing: border-box;
      width: 100%;
      padding: 8px 0 10px;
    }
    .zdoc-pending-empty-search {
      display: none;
      padding: 11px 20px 10px;
      border-bottom: 0;
    }
    .zdoc-empty-search-section + .zdoc-empty-search-section {
      margin-top: 12px;
    }
    .zdoc-empty-search-heading {
      margin: 0 0 7px;
      padding: 0 4px;
      color: var(--zd-gray-500);
      font-size: 13px;
      line-height: 18px;
      font-weight: 400;
      text-transform: none;
    }
    .zdoc-empty-search-item {
      box-sizing: border-box;
      display: grid;
      grid-template-columns: 18px minmax(0, max-content) minmax(0, 1fr);
      align-items: center;
      column-gap: 10px;
      width: 100%;
      min-height: 34px;
      padding: 6px 9px;
      border: 0;
      border-radius: 9px;
      background: transparent;
      color: var(--zd-muted-text);
      cursor: pointer;
      text-align: left;
      transition: background-color 160ms ease, color 160ms ease;
    }
    .zdoc-empty-search-item:hover,
    .zdoc-empty-search-item:focus-visible {
      background: var(--zd-nav-hover-bg);
      color: var(--zd-page-ink);
      outline: none;
    }
    .zdoc-empty-search-item:hover .zdoc-empty-search-title,
    .zdoc-empty-search-item:focus-visible .zdoc-empty-search-title {
      color: var(--zd-page-ink);
    }
    .zdoc-empty-search-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      color: var(--zd-gray-500);
    }
    .zdoc-empty-search-icon svg {
      width: 17px;
      height: 17px;
      display: block;
    }
    .zdoc-empty-search-title {
      min-width: 0;
      max-width: 260px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--zd-page-ink);
      font-size: 14px;
      line-height: 20px;
      font-weight: 500;
    }
    .zdoc-empty-search-tag {
      justify-self: start;
      display: inline-flex;
      align-items: center;
      padding: 0 6px;
      border-radius: 6px;
      background: transparent;
      border: 1px solid var(--zd-surface-border-strong);
      color: var(--zd-muted-text);
      font-size: 12px;
      line-height: 18px;
      font-weight: 500;
      white-space: nowrap;
    }
    .zdoc-empty-search-meta {
      justify-self: start;
      min-width: 0;
      max-width: 360px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      color: var(--zd-muted-text);
      font-size: 13px;
      line-height: 18px;
      font-weight: 400;
      padding: 0;
      border: 0;
      border-radius: 0;
      background: transparent;
    }
  `;
  root.appendChild(style);
}

function syncEmptyState(root: ShadowRoot) {
  const input = root.querySelector<HTMLInputElement>('.ikp-ai-search-input');
  const list = root.querySelector<HTMLElement>('.ikp-ai-search-results__list');
  if (!input) return;

  const isTypingPending = input.dataset.zdocSearchPending === 'true' || input.dataset.zdocImeComposing === 'true';
  const inputGroup = root.querySelector<HTMLElement>('.ikp-ai-search-input-group');
  let pendingEmpty = root.querySelector<HTMLElement>('.zdoc-pending-empty-search');

  ensureStyles(root);

  if (isTypingPending) {
    if (!pendingEmpty && inputGroup) {
      pendingEmpty = buildEmptyState(root, 'zdoc-pending-empty-search');
      inputGroup.insertAdjacentElement('afterend', pendingEmpty);
    }
  } else {
    pendingEmpty?.remove();
  }

  if (!list) return;

  const existing = list.querySelector('.zdoc-empty-search:not(.zdoc-pending-empty-search)');
  if (input.value.trim() && !isTypingPending) {
    existing?.remove();
    return;
  }
  if (existing) return;
  if (!isTypingPending && list.querySelector('.ikp-ai-search-results__item')) return;

  list.appendChild(buildEmptyState(root));
}

function syncLoadingState(root: ShadowRoot) {
  const input = root.querySelector<HTMLInputElement>('.ikp-ai-search-input');
  const inputGroup = root.querySelector<HTMLElement>('.ikp-ai-search-input-group');
  const searchRoot = root.querySelector<HTMLElement>('.ikp-ai-search-root');
  if (!input || !inputGroup) return;

  const loading = root.querySelector<HTMLElement>('.ikp-ai-search-results__loading');
  const hasResults = root.querySelectorAll('.ikp-ai-search-results__item').length > 0;
  const isLoading = Boolean(
    input.value.trim() &&
    input.dataset.zdocSearchPending !== 'true' &&
    input.dataset.zdocImeComposing !== 'true' &&
    loading &&
    loading.getClientRects().length > 0 &&
    getComputedStyle(loading).display !== 'none'
  );
  if (!input.value.trim() || input.dataset.zdocSearchPending === 'true' || input.dataset.zdocImeComposing === 'true' || isLoading || hasResults) {
    delete input.dataset.zdocSearchAwaiting;
  }
  const isAwaiting = input.dataset.zdocSearchAwaiting === 'true';
  inputGroup.dataset.zdocSearchLoading = String(isLoading);
  inputGroup.dataset.zdocSearchAwaiting = String(isAwaiting);
  if (searchRoot) {
    searchRoot.dataset.zdocSearchHasQuery = String(Boolean(input.value.trim()));
    searchRoot.dataset.zdocSearchHasResults = String(hasResults);
    searchRoot.dataset.zdocSearchLoading = String(isLoading);
    searchRoot.dataset.zdocSearchAwaiting = String(isAwaiting);
  }
}

function getResultKind(item: HTMLElement): 'doc' | 'section' | 'blog' {
  const text = (item.textContent || '').toLowerCase();
  const href = item.querySelector<HTMLAnchorElement>('a')?.href.toLowerCase() || '';
  const tag = item.querySelector<HTMLElement>('.ikp-ai-search-results__item-tag')?.textContent?.toLowerCase() || '';
  const breadcrumbs = item.querySelector<HTMLElement>('.ikp-ai-search-results__item-breadcrumbs')?.textContent?.toLowerCase() || '';
  if (
    href.includes('/blog') ||
    href.includes('/learn') ||
    href.includes('zilliz.com') && !href.includes('/docs') && !href.includes('/reference') ||
    tag.includes('blog') ||
    breadcrumbs.includes('blog') ||
    breadcrumbs.includes('learn') ||
    breadcrumbs.includes('newsroom') ||
    text.includes('zilliz learn') ||
    text.includes('newsroom')
  ) {
    return 'blog';
  }
  if (text.includes('#') || text.startsWith('...')) return 'section';
  return 'doc';
}

function syncResultKinds(root: ShadowRoot) {
  root.querySelectorAll<HTMLElement>('.ikp-ai-search-results__item').forEach(item => {
    item.dataset.zdocResultKind = getResultKind(item);
    getResultBreadcrumbMeta(item);
  });
}

function syncSearchLayoutState(root: ShadowRoot) {
  const input = root.querySelector<HTMLInputElement>('.ikp-ai-search-input');
  const searchRoot = root.querySelector<HTMLElement>('.ikp-ai-search-root');
  if (!input || !searchRoot) return;
  searchRoot.dataset.zdocSearchHasQuery = String(Boolean(input.value.trim()));
  searchRoot.dataset.zdocSearchHasResults = String(root.querySelectorAll('.ikp-ai-search-results__item').length > 0);
}

function syncAskAiTrigger(root: ShadowRoot) {
  const input = root.querySelector<HTMLInputElement>('.ikp-ai-search-input');
  if (!input) return;
  syncSearchLayoutState(root);
  const trigger = root.querySelector<HTMLElement>('.ikp-ai-ask-ai-trigger');
  const results = root.querySelector<HTMLElement>('.ikp-ai-search-results');
  if (trigger && results && trigger.nextElementSibling === results) {
    results.insertAdjacentElement('afterend', trigger);
  }
  root.querySelectorAll<HTMLElement>('.ikp-ai-ask-ai-trigger__label').forEach(label => {
    const query = input.value.trim();
    if (!query) return;
    label.textContent = '';
    const prefix = root.ownerDocument.createElement('span');
    prefix.className = 'zdoc-ask-ai-prefix';
    prefix.textContent = 'Can you tell me about ';
    const queryText = root.ownerDocument.createElement('span');
    queryText.className = 'zdoc-ask-ai-query';
    queryText.textContent = query;
    const suffix = root.ownerDocument.createElement('span');
    suffix.className = 'zdoc-ask-ai-suffix';
    suffix.textContent = '?';
    label.append(prefix, queryText, suffix);
  });
}

function isSearchAskAiControl(root: ShadowRoot, target: EventTarget | null) {
  if (!(target instanceof Element)) return false;
  if (target.closest('.ikp-ai-ask-ai-trigger')) return true;

  const toggle = target.closest('.ikp-view_toggle');
  const button = target.closest('button');
  if (!toggle || !button) return false;
  const buttons = Array.from(toggle.querySelectorAll('button'));
  return buttons.indexOf(button) === buttons.length - 1 && root.contains(toggle);
}

function interceptAskAi(root: ShadowRoot) {
  if (askAiInterceptedRoots.has(root)) return;
  askAiInterceptedRoots.add(root);

  root.addEventListener('click', event => {
    if (!isSearchAskAiControl(root, event.target)) return;

    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();

    const query = root.querySelector<HTMLInputElement>('.ikp-ai-search-input')?.value.trim();
    document.dispatchEvent(new CustomEvent('zdoc-close-search'));
    document.dispatchEvent(new CustomEvent('open-chat', {
      detail: query ? {query} : undefined,
    }));
  }, true);
}

function getResultRecentItem(item: HTMLElement): RecentItem | null {
  const title = item.querySelector<HTMLElement>('.ikp-ai-search-results__item-title')?.textContent?.replace(/\s+/g, ' ').trim();
  if (!title) return null;
  const href = item instanceof HTMLAnchorElement
    ? item.href
    : item.querySelector<HTMLAnchorElement>('a[href]')?.href
      || item.closest<HTMLAnchorElement>('a[href]')?.href
      || undefined;
  if (!href) return null;
  return {
    title,
    href,
    meta: getResultBreadcrumbMeta(item),
    kind: getResultKind(item),
  };
}

function syncSearchTabs(root: ShadowRoot) {
  root.querySelectorAll<HTMLElement>('[role="tab"]').forEach(tab => {
    if (tab.querySelector('.zdoc-search-tab-label')) return;
    const text = (tab.textContent || '').replace(/\s+/g, ' ').trim();
    const match = text.match(/^(.+?)\s*\((\d+)\)$/);
    if (!match) return;

    const label = root.ownerDocument.createElement('span');
    label.className = 'zdoc-search-tab-label';
    label.textContent = match[1];

    const count = root.ownerDocument.createElement('span');
    count.className = 'zdoc-search-tab-count';
    count.textContent = match[2];

    tab.textContent = '';
    tab.append(label, count);
  });
}

function enhanceSearchRoots() {
  document.querySelectorAll<HTMLElement>('*').forEach(host => {
    const root = host.shadowRoot;
    if (!root || !root.querySelector('.ikp-ai-search-root')) return;
    syncEmptyState(root);
    syncLoadingState(root);
    syncResultKinds(root);
    syncSearchTabs(root);
    syncAskAiTrigger(root);
    interceptAskAi(root);
    const input = root.querySelector<HTMLInputElement>('.ikp-ai-search-input');
    if (input && !input.dataset.zdocEmptyEnhanced) {
      input.dataset.zdocEmptyEnhanced = 'true';
      input.addEventListener('input', event => {
        forwardedInputEvents.delete(event);
        clearPendingSearch(input);
        delete input.dataset.zdocSearchPending;
        delete input.dataset.zdocSearchAwaiting;
        if (!(event as InputEvent).isComposing) delete input.dataset.zdocImeComposing;
        syncEmptyState(root);
        syncLoadingState(root);
        syncAskAiTrigger(root);
      }, true);
      input.addEventListener('compositionstart', () => {
        input.dataset.zdocImeComposing = 'true';
        syncEmptyState(root);
        syncLoadingState(root);
      });
      input.addEventListener('compositionend', () => {
        delete input.dataset.zdocImeComposing;
        syncEmptyState(root);
        syncLoadingState(root);
        syncAskAiTrigger(root);
      });
      input.addEventListener('keydown', event => {
        if (event.key !== 'Enter' || input.dataset.zdocImeComposing === 'true') return;
        syncEmptyState(root);
        syncLoadingState(root);
        syncAskAiTrigger(root);
      });
      input.addEventListener('blur', () => {
        if (input.dataset.zdocImeComposing === 'true') return;
        clearPendingSearch(input);
        delete input.dataset.zdocSearchPending;
        delete input.dataset.zdocSearchAwaiting;
        syncEmptyState(root);
        syncLoadingState(root);
      });
    }

    root.querySelectorAll<HTMLElement>('.ikp-ai-search-results__item').forEach(item => {
      if (item.dataset.zdocRecentEnhanced) return;
      item.dataset.zdocRecentEnhanced = 'true';
      item.addEventListener('click', () => {
        const recent = getResultRecentItem(item);
        if (recent) writeRecent(recent);
      });
    });
  });
}

export default function InkeepSearchEnhancer() {
  useEffect(() => {
    enhanceSearchRoots();
    const resetRoots = () => {
      enhanceSearchRoots();
      document.querySelectorAll<HTMLElement>('*').forEach(host => {
        const root = host.shadowRoot;
        if (root?.querySelector('.ikp-ai-search-root')) resetSearchRoot(root);
      });
    };
    const reset = () => {
      resetRoots();
      window.requestAnimationFrame(resetRoots);
      window.setTimeout(resetRoots, 40);
      window.setTimeout(resetRoots, 100);
      window.setTimeout(resetRoots, 180);
    };
    document.addEventListener('zdoc-search-reset', reset);
    const interval = window.setInterval(enhanceSearchRoots, 150);
    const observer = new MutationObserver(enhanceSearchRoots);
    observer.observe(document.body, {childList: true, subtree: true});
    return () => {
      document.removeEventListener('zdoc-search-reset', reset);
      window.clearInterval(interval);
      observer.disconnect();
    };
  }, []);

  return null;
}
