import type {PropSidebarItem} from '@docusaurus/plugin-content-docs';
import {
  withLocalePrefix,
  type DocsRouteContext,
  type ReferenceTarget,
} from '../../../shared/navigation/docsRoute';
import {
  getManualReferenceNavigation,
  type DocsSite,
  type ReferenceNavigationTarget,
} from '../../../shared/navigation/manualReferenceNavigation';

export type ManualReferenceOrigin = {
  backHref: string;
  backLabel: string;
  selectedLabel: string;
  sidebar: PropSidebarItem[];
};

export type ManualReferenceTarget = ReferenceNavigationTarget;

const STORAGE_KEY = 'zdoc.manualReferenceSidebarOrigin';

function normalizePath(pathname: string): string {
  return pathname.replace(/\/$/, '') || '/';
}

function withoutLocalePrefix(href: string, context: DocsRouteContext): string {
  if (context.localePrefix && href.startsWith(`${context.localePrefix}/`)) {
    return href.slice(context.localePrefix.length);
  }
  return href;
}

function createCloudGuidesPrimarySidebar(
  context: DocsRouteContext,
  site: DocsSite,
): PropSidebarItem[] {
  const navigation = getManualReferenceNavigation(site);
  const category = (label: string, href: string): PropSidebarItem => ({
    type: 'category',
    label,
    href: withLocalePrefix(href, context),
    items: [],
    collapsed: false,
    collapsible: true,
  });

  return [
    category('Get Started', '/docs/register-with-zilliz-cloud'),
    category('Development', '/docs/single-vector-search'),
    category('Management', '/docs/organization-users'),
    category(navigation.clientLibrariesLabel, navigation.installSdksHref),
    category(navigation.toolsLabel, navigation.toolsHref),
    category('AI Models', '/docs/integrate-with-model-providers'),
    category('Architecture', '/docs/data-resilience'),
  ];
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

export function getManualReferenceTarget(
  context: DocsRouteContext,
  site: DocsSite,
): ReferenceNavigationTarget | undefined {
  if (!context.referenceTarget) return undefined;
  return getManualReferenceNavigation(site).targets.find(target => target.kind === context.referenceTarget);
}

export function getReferenceNavigationHref(
  href: string,
  context: DocsRouteContext,
  site: DocsSite,
): string {
  const navigation = getManualReferenceNavigation(site);
  const unprefixedHref = withoutLocalePrefix(href, context);
  const normalizedHref = normalizePath(unprefixedHref);
  const targetHref = navigation.entryRedirects[normalizedHref] ?? unprefixedHref;
  return withLocalePrefix(targetHref, context);
}

export function getDefaultManualReferenceOrigin(
  target: ReferenceTarget,
  context: DocsRouteContext,
  site: DocsSite,
): ManualReferenceOrigin {
  const navigation = getManualReferenceNavigation(site);
  if (target === 'cli') {
    return {
      backHref: withLocalePrefix(navigation.toolsHref, context),
      backLabel: navigation.toolsLabel,
      selectedLabel: navigation.toolsLabel,
      sidebar: createCloudGuidesPrimarySidebar(context, site),
    };
  }

  return {
    backHref: withLocalePrefix(navigation.installSdksHref, context),
    backLabel: navigation.clientLibrariesLabel,
    selectedLabel: navigation.clientLibrariesLabel,
    sidebar: createCloudGuidesPrimarySidebar(context, site),
  };
}

export function shouldClearManualReferenceOrigin(
  context: DocsRouteContext,
  origin: ManualReferenceOrigin | undefined,
): boolean {
  if (!origin) return false;
  if (context.referenceTarget) return false;
  const normalizedBackHref = normalizePath(withoutLocalePrefix(origin.backHref, context));
  return context.normalizedPathname !== normalizedBackHref;
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
