import type {DeepReadonly} from './immutable.ts';
import type {SiteId, SiteProfile} from './schema.ts';
import {enProfile} from './sites/en.ts';
import {zhCNProfile} from './sites/zh-CN.ts';

const profiles = {
  en: enProfile,
  'zh-CN': zhCNProfile,
} satisfies Record<SiteId, DeepReadonly<SiteProfile>>;

export function resolveSiteProfile(site: string | undefined): DeepReadonly<SiteProfile> {
  if (site === undefined || site.length === 0) {
    throw new Error('ZDOC_SITE must be set to en or zh-CN');
  }

  if (site !== 'en' && site !== 'zh-CN') {
    throw new Error(`Unsupported site: ${site}`);
  }

  return profiles[site];
}
