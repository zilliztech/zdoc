const CONTACT_SALES_EN_URL = 'https://zilliz.com/contact-sales';
const CONTACT_SALES_ZH_URL = 'https://zilliz.com.cn/contact-sales';
// Root-relative so each deployment (en, zh-CN) stays on its own domain; the
// English site's ja-JP pages get their locale prefix prepended below.
const FEATURE_AVAILABILITY_PATH = '/docs/feature-availability';

export function contactSalesUrl(site: unknown): string {
  return site === 'zh-CN' ? CONTACT_SALES_ZH_URL : CONTACT_SALES_EN_URL;
}

export function resolveTagLink(tagType: string, pathname: string, site: unknown): string | undefined {
  if (tagType === 'CONTACT SALES') return contactSalesUrl(site);
  if (tagType === 'PUBLIC' || tagType === 'PRIVATE') {
    return pathname.startsWith('/ja-JP/') ? `/ja-JP${FEATURE_AVAILABILITY_PATH}` : FEATURE_AVAILABILITY_PATH;
  }
  return undefined;
}
