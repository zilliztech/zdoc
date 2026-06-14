import type {PropSidebarItem} from '@docusaurus/plugin-content-docs';

export type ManualReferenceOrigin = {
  backHref: string;
  backLabel: string;
  selectedLabel: string;
  sidebar: PropSidebarItem[];
};

export type ManualReferenceTarget = {
  kind: 'python' | 'java' | 'go' | 'nodejs' | 'restful' | 'cli';
  hrefPrefix: string;
};

const STORAGE_KEY = 'zdoc.manualReferenceSidebarOrigin';

const REFERENCE_TARGETS: ManualReferenceTarget[] = [
  {kind: 'python', hrefPrefix: '/reference/python'},
  {kind: 'java', hrefPrefix: '/reference/java'},
  {kind: 'go', hrefPrefix: '/reference/go'},
  {kind: 'nodejs', hrefPrefix: '/reference/nodejs'},
  {kind: 'restful', hrefPrefix: '/reference/restful'},
  {kind: 'cli', hrefPrefix: '/reference/cli'},
];

const REFERENCE_ENTRY_REDIRECTS: Record<string, string> = {
  '/reference/cli/overview': '/reference/cli/cli/overview',
};

const CLOUD_GUIDES_PRIMARY_SIDEBAR: PropSidebarItem[] = [
  {
    type: 'category',
    label: 'Get Started',
    href: '/docs/register-with-zilliz-cloud',
    items: [],
    collapsed: false,
    collapsible: true,
  },
  {
    type: 'category',
    label: 'Development',
    href: '/docs/single-vector-search',
    items: [],
    collapsed: false,
    collapsible: true,
  },
  {
    type: 'category',
    label: 'Management',
    href: '/docs/organization-users',
    items: [],
    collapsed: false,
    collapsible: true,
  },
  {
    type: 'category',
    label: 'Client Libraries',
    href: '/docs/install-sdks',
    items: [],
    collapsed: false,
    collapsible: true,
  },
  {
    type: 'category',
    label: 'Tools',
    href: '/docs/agents-and-prompts',
    items: [],
    collapsed: false,
    collapsible: true,
  },
  {
    type: 'category',
    label: 'AI Models',
    href: '/docs/integrate-with-model-providers',
    items: [],
    collapsed: false,
    collapsible: true,
  },
  {
    type: 'category',
    label: 'Architecture',
    href: '/docs/data-resilience',
    items: [],
    collapsed: false,
    collapsible: true,
  },
];

function normalizePath(pathname: string): string {
  return pathname.replace(/\/$/, '') || '/';
}

function startsWithPath(pathname: string, prefix: string): boolean {
  const path = normalizePath(pathname);
  const normalizedPrefix = normalizePath(prefix);
  return path === normalizedPrefix || path.startsWith(`${normalizedPrefix}/`);
}

function isManualReferenceOrigin(value: unknown): value is ManualReferenceOrigin {
  if (!value || typeof value !== 'object') return false;
  const origin = value as ManualReferenceOrigin;
  return (
    typeof origin.backHref === 'string' &&
    typeof origin.backLabel === 'string' &&
    typeof origin.selectedLabel === 'string' &&
    Array.isArray(origin.sidebar)
  );
}

export function getManualReferenceTarget(pathname: string): ManualReferenceTarget | undefined {
  return REFERENCE_TARGETS.find(target => startsWithPath(pathname, target.hrefPrefix));
}

export function getReferenceNavigationHref(href: string): string {
  const normalizedHref = normalizePath(href);
  return REFERENCE_ENTRY_REDIRECTS[normalizedHref] ?? href;
}

export function getDefaultManualReferenceOrigin(
  target: ManualReferenceTarget,
): ManualReferenceOrigin {
  if (target.kind === 'cli') {
    return {
      backHref: '/docs/agents-and-prompts',
      backLabel: 'Tools',
      selectedLabel: 'Tools',
      sidebar: CLOUD_GUIDES_PRIMARY_SIDEBAR,
    };
  }

  return {
    backHref: '/docs/install-sdks',
    backLabel: 'Client Libraries',
    selectedLabel: 'Client Libraries',
    sidebar: CLOUD_GUIDES_PRIMARY_SIDEBAR,
  };
}

export function shouldClearManualReferenceOrigin(
  pathname: string,
  origin: ManualReferenceOrigin | undefined,
): boolean {
  if (!origin) return false;
  if (getManualReferenceTarget(pathname)) return false;
  return normalizePath(pathname) !== normalizePath(origin.backHref);
}

export function readManualReferenceOrigin(): ManualReferenceOrigin | undefined {
  if (typeof window === 'undefined') return undefined;

  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return isManualReferenceOrigin(parsed) ? parsed : undefined;
  } catch {
    return undefined;
  }
}

export function writeManualReferenceOrigin(origin: ManualReferenceOrigin): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(origin));
}

export function clearManualReferenceOrigin(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(STORAGE_KEY);
}
