export type DocsLinkLocale = 'en' | 'zh-CN' | 'ja-JP';

const DOCS_SITE_ORIGINS = [
  'https://docs.zilliz.com',
  'https://docs.zilliz.com.cn',
  'http://docs.zilliz.com',
  'http://docs.zilliz.com.cn',
] as const;

const MILVUS_ORIGIN_PATTERN = /^https?:\/\/milvus\.io(?=\/|$)/;

// milvus.io localizes the docs tree as /docs/<locale>/... and the blog as
// /<locale>/blog/...; other sections (api-reference, tools) and the bare host
// have no localized tree, so links there must stay on the canonical URLs.
const MILVUS_LOCALIZED_PATH = /^\/(?:zh|ja|ko|zh-hant)(?:\/|$)/;
const MILVUS_LOCALIZED_DOCS_PATH = /^\/docs\/(?:zh|ja|ko|zh-hant)(?:\/|$)/;

export function normalizeDocsLinkLocale(lang: string | undefined | null): DocsLinkLocale {
  if (lang === 'zh-CN' || lang === 'ja-JP') return lang;
  return 'en';
}

export function rewriteDocHref(href: string, locale: DocsLinkLocale): string {
  if (typeof href !== 'string' || href === '') return href;

  for (const origin of DOCS_SITE_ORIGINS) {
    if (href === origin) return locale === 'ja-JP' ? '/ja-JP/' : '/';
    if (href.startsWith(`${origin}/`)) {
      const path = href.slice(origin.length);
      return locale === 'ja-JP' ? `/ja-JP${path}` : path;
    }
  }

  if (locale === 'en') return href;

  const milvusOrigin = MILVUS_ORIGIN_PATTERN.exec(href);
  if (!milvusOrigin) return href;

  const localeSegment = locale === 'zh-CN' ? 'zh' : 'ja';
  const rest = href.slice(milvusOrigin[0].length);
  if (MILVUS_LOCALIZED_PATH.test(rest)) return href;
  if (rest === '/docs' || rest.startsWith('/docs/')) {
    if (MILVUS_LOCALIZED_DOCS_PATH.test(rest)) return href;
    return `https://milvus.io/docs/${localeSegment}${rest.slice('/docs'.length)}`;
  }
  if (rest === '/blog' || rest.startsWith('/blog/')) {
    return `https://milvus.io/${localeSegment}${rest}`;
  }
  return href;
}

// Rewriting skips <pre>/<code> regions so displayed code samples keep the
// absolute URLs readers are meant to copy.
const HTML_CODE_REGION = /<(pre|code)\b[\s\S]*?<\/\1\s*>/gi;

function rewriteHrefAttributesIn(segment: string, locale: DocsLinkLocale): string {
  return segment.replace(/(\shref\s*=\s*)(["'])([^"']*)\2/gi, (match, attribute: string, quote: string, href: string) => {
    const rewritten = rewriteDocHref(href, locale);
    return rewritten === href ? match : `${attribute}${quote}${rewritten}${quote}`;
  });
}

export function rewriteHtmlHrefAttributes(html: string, locale: DocsLinkLocale): string {
  if (typeof html !== 'string' || html === '') return html;
  let result = '';
  let cursor = 0;
  for (const region of html.matchAll(HTML_CODE_REGION)) {
    const start = region.index ?? 0;
    result += rewriteHrefAttributesIn(html.slice(cursor, start), locale);
    result += region[0];
    cursor = start + region[0].length;
  }
  return result + rewriteHrefAttributesIn(html.slice(cursor), locale);
}
