export const sharedUiModules = ['shared-theme', 'shared-components'] as const;

export const englishUiModules = ['english-navigation', 'english-home'] as const;

export type DocsUiModule =
  | (typeof sharedUiModules)[number]
  | (typeof englishUiModules)[number];
