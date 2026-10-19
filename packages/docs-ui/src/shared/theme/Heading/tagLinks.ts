const CONTACT_SALES_EN_URL = 'https://zilliz.com/contact-sales';
const CONTACT_SALES_ZH_URL = 'https://zilliz.com.cn/contact-sales';
// ON REQUEST points at the support center so readers can ask for the feature
// to be enabled, instead of the feature-availability lifecycle page.
const SUPPORT_EN_URL = 'https://support.zilliz.com/hc/en-us';
const SUPPORT_ZH_URL = 'https://support.zilliz.com.cn/hc/zh-cn';
// Root-relative so each deployment (en, zh-CN) stays on its own domain; the
// English site's ja-JP pages get their locale prefix prepended below.
const FEATURE_AVAILABILITY_PATH = '/docs/feature-availability';

export function contactSalesUrl(site: unknown): string {
  return site === 'zh-CN' ? CONTACT_SALES_ZH_URL : CONTACT_SALES_EN_URL;
}

export function supportUrl(site: unknown): string {
  return site === 'zh-CN' ? SUPPORT_ZH_URL : SUPPORT_EN_URL;
}

export function resolveTagLink(tagType: string, pathname: string, site: unknown): string | undefined {
  if (tagType === 'CONTACT SALES') return contactSalesUrl(site);
  if (tagType === 'ON REQUEST') return supportUrl(site);
  if (tagType === 'PUBLIC' || tagType === 'PRIVATE') {
    return pathname.startsWith('/ja-JP/') ? `/ja-JP${FEATURE_AVAILABILITY_PATH}` : FEATURE_AVAILABILITY_PATH;
  }
  return undefined;
}
