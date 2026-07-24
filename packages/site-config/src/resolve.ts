import type {DeepReadonly} from './immutable';
import type {SiteId, SiteProfile} from './schema';
import {enProfile} from './sites/en';
import {zhCNProfile} from './sites/zh-CN';

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
