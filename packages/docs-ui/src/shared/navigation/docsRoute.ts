import {referenceTargetAliases, referenceTargetKinds, type ReferenceTargetKind} from './referenceTargets.generated.ts';

export type DocsLocale = 'en' | 'ja-JP' | 'zh-CN';

export type ReferenceTarget = ReferenceTargetKind;

export type DocsManual = 'guides' | 'reference' | 'byoc' | 'onpremise' | 'unknown';

export interface DocsRouteContext {
  locale: DocsLocale;
  localePrefix: '' | '/ja-JP';
  pathname: string;
  normalizedPathname: string;
  manual: DocsManual;
  referenceTarget?: ReferenceTarget;
}

function normalizePathname(pathname: string): string {
  const withoutQueryOrHash = pathname.split(/[?#]/, 1)[0] || '/';
  const withLeadingSlash = withoutQueryOrHash.startsWith('/') ? withoutQueryOrHash : `/${withoutQueryOrHash}`;
  return withLeadingSlash.replace(/\/+$/, '') || '/';
}

function classifyManual(pathname: string): DocsManual {
  if (pathname === '/reference' || pathname.startsWith('/reference/')) return 'reference';
  if (pathname === '/docs/byoc' || pathname.startsWith('/docs/byoc/')) return 'byoc';
  if (pathname === '/docs' || pathname.startsWith('/docs/')) return 'guides';
  if (pathname === '/on-premise' || pathname.startsWith('/on-premise/')) return 'onpremise';
  return 'unknown';
}

function referenceTargetFor(pathname: string): ReferenceTarget | undefined {
  const target = pathname.split('/')[2];
  return target ? referenceTargetAliases[target] : undefined;
}

export function parseDocsRoute(pathname: string, locale: DocsLocale): DocsRouteContext {
  const normalizedInput = normalizePathname(pathname);
  const normalizedPathname = locale === 'ja-JP'
    ? (normalizedInput === '/ja-JP' ? '/' : normalizedInput.replace(/^\/ja-JP(?=\/)/, '') || '/')
    : normalizedInput;
  const manual = classifyManual(normalizedPathname);
  const referenceTarget = manual === 'reference' ? referenceTargetFor(normalizedPathname) : undefined;

  return {
    locale,
    localePrefix: locale === 'ja-JP' ? '/ja-JP' : '',
    pathname: normalizedInput,
    normalizedPathname,
    manual,
    ...(referenceTarget && {referenceTarget}),
  };
}

export function withLocalePrefix(href: string, context: DocsRouteContext): string {
  if (context.localePrefix !== '/ja-JP' || !href.startsWith('/') || href.startsWith('//') || href === '/ja-JP' || href.startsWith('/ja-JP/')) {
    return href;
  }

  return `${context.localePrefix}${href}`;
}
