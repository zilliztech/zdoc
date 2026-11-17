// Cloud console origins per docs site. The navbar login/sign-up actions point
// at the console of the site the reader is on: the international docs hand off
// to cloud.zilliz.com, and the China docs (site id `zh-CN`) to
// cloud.zilliz.com.cn. Anything unknown resolves to the international origin,
// matching the rest of the site-conditional UI.
const CLOUD_CONSOLE_ORIGIN = {
  en: 'https://cloud.zilliz.com',
  'zh-CN': 'https://cloud.zilliz.com.cn',
} as const;

export type CloudConsoleSite = keyof typeof CLOUD_CONSOLE_ORIGIN;

// The site id arrives from `siteConfig.customFields`, which Docusaurus types as
// an untyped record, so accept `unknown` and fail open to the international
// origin instead of asking every call site for a cast.
export function cloudConsoleSite(site: unknown): CloudConsoleSite {
  return site === 'zh-CN' ? 'zh-CN' : 'en';
}

export function cloudConsoleOrigin(site: unknown): string {
  return CLOUD_CONSOLE_ORIGIN[cloudConsoleSite(site)];
}

export function cloudConsoleUrl(site: unknown, path: string): string {
  return `${cloudConsoleOrigin(site)}${path}`;
}
