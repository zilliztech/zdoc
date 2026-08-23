import {z} from 'zod';

export const SiteIdSchema = z.enum(['en', 'zh-CN']);

export const LocaleIdSchema = z.enum(['en', 'ja-JP', 'zh-CN']);

export const LocaleProfileSchema = z.object({
  id: LocaleIdSchema,
  htmlLang: z.string().min(1),
  source: z.enum(['canonical', 'docusaurus-i18n']),
}).strict();

const WebPathForbiddenCharactersSchema = z.string().superRefine((value, context) => {
  const invalidReason =
    /\s/u.test(value) ? 'must not contain whitespace' :
    /[\u0000-\u001F\u007F]/u.test(value) ? 'must not contain control characters' :
    value.includes('?') ? 'must not contain a query' :
    value.includes('#') ? 'must not contain a fragment' :
    value.includes('%') ? 'must not contain percent encoding' :
    undefined;

  if (invalidReason) {
    context.addIssue({code: z.ZodIssueCode.custom, message: invalidReason});
  }
});

export const RepositoryRelativePathSchema = z.string().min(1).superRefine((value, context) => {
  const segments = value.split('/');
  const invalidReason =
    value !== value.trim() ? 'must not contain leading or trailing whitespace' :
    value.startsWith('/') || /^[A-Za-z]:\//.test(value) ? 'must not be absolute' :
    value.includes('\\') ? 'must use forward slashes' :
    segments.some(segment => segment.length === 0) ? 'must not contain empty path segments' :
    segments.some(segment => segment === '..') ? 'must not contain parent traversal segments' :
    segments.some(segment => segment === '.') ? 'must not contain current-directory segments' :
    undefined;

  if (invalidReason) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Repository-relative path ${invalidReason}: ${JSON.stringify(value)}`,
    });
  }
});

export const LocalizationProfileSchema = z.object({
  defaultLocale: z.enum(['en', 'zh-CN']),
  translationRoot: RepositoryRelativePathSchema,
  locales: z.array(LocaleProfileSchema).min(1),
}).strict().superRefine((localization, context) => {
  const localeIds = new Set<string>();
  let defaultLocaleIndex = -1;

  for (const [index, locale] of localization.locales.entries()) {
    if (localeIds.has(locale.id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['locales', index, 'id'],
        message: `Duplicate locale id: ${locale.id}`,
      });
    }
    localeIds.add(locale.id);

    if (locale.id === localization.defaultLocale) {
      if (defaultLocaleIndex !== -1) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['locales', index, 'id'],
          message: `Default locale must appear exactly once: ${localization.defaultLocale}`,
        });
      }
      defaultLocaleIndex = index;
      if (locale.source !== 'canonical') {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['locales', index, 'source'],
          message: `Default locale must be canonical: ${localization.defaultLocale}`,
        });
      }
    }

    if (locale.id === 'ja-JP' && localization.defaultLocale !== 'en') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['locales', index, 'id'],
        message: 'Japanese locales are only supported by the English profile',
      });
    }
    if (locale.id === 'ja-JP' && locale.source !== 'docusaurus-i18n') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['locales', index, 'source'],
        message: 'Japanese locales must use docusaurus-i18n content',
      });
    }
    if (localization.defaultLocale === 'zh-CN' && locale.id !== 'zh-CN') {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['locales', index, 'id'],
        message: 'The Chinese profile may only include zh-CN',
      });
    }
  }

  if (defaultLocaleIndex === -1) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['defaultLocale'],
      message: `Default locale must appear exactly once: ${localization.defaultLocale}`,
    });
  }

  if (localization.defaultLocale === 'en') {
    const chineseLocaleIndex = localization.locales.findIndex(locale => locale.id === 'zh-CN');
    if (chineseLocaleIndex !== -1) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['locales', chineseLocaleIndex, 'id'],
        message: 'The English profile may only include en and ja-JP',
      });
    }
    if (!localeIds.has('ja-JP')) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['locales'],
        message: 'The English profile must include ja-JP using docusaurus-i18n',
      });
    }
  }
});

export const RoutePathSchema = WebPathForbiddenCharactersSchema.pipe(z.string().min(1)).superRefine((value, context) => {
  const routeBody = value.startsWith('/') ? value.slice(1) : value;
  const segments = routeBody.split('/');
  const invalidReason =
    value !== value.trim() ? 'must not contain leading or trailing whitespace' :
    /\s/u.test(value) ? 'must not contain whitespace' :
    value.includes('\\') ? 'must use forward slashes' :
    value !== '/' && value.endsWith('/') ? 'must not have a trailing slash' :
    value !== '/' && segments.some(segment => segment.length === 0) ? 'must not contain empty path segments' :
    segments.some(segment => segment === '.' || segment === '..') ? 'must not contain dot path segments' :
    segments.some(segment => segment !== segment.trim()) ? 'must not contain whitespace-padded segments' :
    undefined;

  if (invalidReason) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Route path ${invalidReason}: ${JSON.stringify(value)}`,
    });
  }
});

export function canonicalRouteKey(routePath: string): string {
  if (routePath === '/') {
    return '/';
  }
  return routePath.startsWith('/') ? routePath.slice(1) : routePath;
}

export const BaseUrlSchema = WebPathForbiddenCharactersSchema.pipe(z.string().min(1)).superRefine((value, context) => {
  const hasRequiredBoundary = value.startsWith('/') && value.endsWith('/');
  const segments = hasRequiredBoundary ? value.slice(1, -1).split('/') : [];
  const invalidReason =
    value !== value.trim() ? 'must not contain leading or trailing whitespace' :
    /\s/u.test(value) ? 'must not contain whitespace' :
    value.includes('\\') ? 'must use forward slashes' :
    !hasRequiredBoundary ? 'must start and end with a slash' :
    value !== '/' && segments.some(segment => segment.length === 0) ? 'must not contain empty path segments' :
    segments.some(segment => segment === '.' || segment === '..') ? 'must not contain dot path segments' :
    segments.some(segment => segment !== segment.trim()) ? 'must not contain whitespace-padded segments' :
    undefined;

  if (invalidReason) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: `baseUrl ${invalidReason}: ${JSON.stringify(value)}`,
    });
  }
});

export const SiteOriginSchema = z.string().url().superRefine((value, context) => {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    context.addIssue({code: z.ZodIssueCode.custom, message: 'Site URL must be a valid HTTP(S) origin'});
    return;
  }

  if (
    (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') ||
    (value !== parsed.origin && value !== `${parsed.origin}/`) ||
    parsed.hostname.length === 0 ||
    parsed.username.length > 0 ||
    parsed.password.length > 0 ||
    parsed.search.length > 0 ||
    parsed.hash.length > 0 ||
    parsed.pathname !== '/'
  ) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Site URL must be an HTTP(S) origin without credentials, path, query, or fragment',
    });
  }
});

export const ContentPluginProfileSchema = z.object({
  id: z.enum(['default', 'byoc', 'reference', 'agents', 'onpremise']),
  sourcePath: RepositoryRelativePathSchema,
  routeBasePath: RoutePathSchema,
  sidebarPath: RepositoryRelativePathSchema,
  include: z.array(RepositoryRelativePathSchema).optional(),
  exclude: z.array(RepositoryRelativePathSchema).optional(),
  currentVersionPath: RoutePathSchema.optional(),
}).strict();

export const FeatureProfileSchema = z.object({
  chat: z.boolean(),
  askAi: z.boolean(),
  feedback: z.boolean(),
  cloudSelector: z.boolean(),
  byoc: z.boolean(),
  onpremise: z.boolean(),
  agents: z.boolean(),
  // Reference kinds are generated from the manual registry presentation
  // metadata (see packages/site-config/src/generated/referencePresentation.ts).
  referenceKinds: z.array(z.string().regex(/^[a-z][a-z0-9-]*$/u)),
}).strict().superRefine((features, context) => {
  const seen = new Set<string>();
  for (const [index, kind] of features.referenceKinds.entries()) {
    if (seen.has(kind)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['referenceKinds', index],
        message: `Duplicate referenceKinds entry: ${kind}`,
      });
    }
    seen.add(kind);
  }
});

export const PlaneConfigSchema = z.object({
  dataPlaneKeywords: z.record(z.string().min(1), z.array(z.string().min(1))).optional(),
  controlPlaneKeywords: z.record(z.string().min(1), z.array(z.string().min(1))),
}).strict();

export const RestApiIntegrationSchema = z.object({
  planeConfig: PlaneConfigSchema,
}).strict();

export const IntegrationProfileSchema = z.object({
  searchProvider: z.string().min(1).optional(),
  chatProvider: z.string().min(1).optional(),
  analyticsProvider: z.string().min(1).optional(),
  feedbackProvider: z.string().min(1).optional(),
  storageAdapter: z.string().min(1).optional(),
  restApi: RestApiIntegrationSchema.optional(),
}).strict();

export const RedirectRuleSchema = z.object({
  from: RoutePathSchema,
  to: RoutePathSchema,
  permanent: z.boolean().optional(),
}).strict();

export const RedirectProfileSchema = z.object({
  rules: z.array(RedirectRuleSchema),
}).strict().superRefine((redirects, context) => {
  const seen = new Set<string>();
  for (const [index, rule] of redirects.rules.entries()) {
    const routeKey = canonicalRouteKey(rule.from);
    if (seen.has(routeKey)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['rules', index, 'from'],
        message: `Duplicate redirect source: ${rule.from}`,
      });
    }
    seen.add(routeKey);
  }
});

export const NavigationItemSchema = z.object({
  label: z.string().min(1),
  to: RoutePathSchema.optional(),
  href: z.string().min(1).optional(),
}).strict().refine(item => Number(item.to !== undefined) + Number(item.href !== undefined) === 1, {
  message: 'Navigation items require exactly one of to or href',
});

export const SecondaryNavigationLeafSchema = z.object({
  label: z.string().min(1),
  href: RoutePathSchema,
  prefix: RoutePathSchema.nullable(),
  icon: z.string().min(1),
  hidden: z.boolean().optional(),
}).strict();

export const SecondaryNavigationItemSchema = z.object({
  label: z.string().min(1),
  href: RoutePathSchema.optional(),
  prefix: RoutePathSchema.nullable(),
  icon: z.string().min(1),
  hidden: z.boolean().optional(),
  items: z.array(SecondaryNavigationLeafSchema).optional(),
}).strict().refine(item => Number(item.href !== undefined) + Number(item.items !== undefined) === 1, {
  message: 'Secondary navigation items require exactly one of href or items',
});

export const NavigationProfileSchema = z.object({
  items: z.array(NavigationItemSchema),
  secondaryItems: z.array(SecondaryNavigationItemSchema),
}).strict();

export const MarkdownProfileSchema = z.object({
  remarkPlugins: z.array(z.string().min(1)),
  rehypePlugins: z.array(z.string().min(1)),
}).strict();

export const PublicationAdapterIdSchema = z.enum([
  'zh-CN.markdown-normalizer',
  'zh-CN.rest-replacements',
  'zh-CN.aliyun-oss',
]);

const publicationAdapterOrder = [
  'zh-CN.markdown-normalizer',
  'zh-CN.rest-replacements',
  'zh-CN.aliyun-oss',
] as const;

export const PublicationAdapterSelectionSchema = z.array(PublicationAdapterIdSchema).superRefine((adapterIds, context) => {
  const seen = new Set<string>();
  let previousIndex = -1;
  for (const [index, adapterId] of adapterIds.entries()) {
    if (seen.has(adapterId)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [index],
        message: `Duplicate publication adapter ID: ${adapterId}`,
      });
    }
    const orderIndex = publicationAdapterOrder.indexOf(adapterId);
    if (orderIndex <= previousIndex) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [index],
        message: `Publication adapter IDs must use canonical selection order`,
      });
    }
    seen.add(adapterId);
    previousIndex = orderIndex;
  }
});

export const RobotsProfileSchema = z.object({
  index: z.boolean(),
  sitemap: z.boolean().optional(),
}).strict();

type OwnershipClaim = {
  label: string;
  path: string;
};

function pathsOverlap(left: string, right: string): boolean {
  return left === right || left.startsWith(`${right}/`) || right.startsWith(`${left}/`);
}

function reportOwnershipOverlaps(
  claims: OwnershipClaim[],
  context: z.RefinementCtx,
): void {
  for (let leftIndex = 0; leftIndex < claims.length; leftIndex += 1) {
    for (let rightIndex = leftIndex + 1; rightIndex < claims.length; rightIndex += 1) {
      const left = claims[leftIndex];
      const right = claims[rightIndex];
      if (pathsOverlap(left.path, right.path)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [right.label],
          message: `${left.label} (${left.path}) and ${right.label} (${right.path}) have a repository ownership overlap (ancestor/descendant paths)`,
        });
      }
    }
  }
}

export const SiteProfileSchema = z.object({
  id: SiteIdSchema,
  language: z.string().min(1),
  title: z.string().min(1),
  tagline: z.string().min(1).optional(),
  url: SiteOriginSchema,
  baseUrl: BaseUrlSchema,
  outputDir: RepositoryRelativePathSchema,
  localization: LocalizationProfileSchema,
  content: z.array(ContentPluginProfileSchema),
  manuals: z.array(RepositoryRelativePathSchema),
  navigation: NavigationProfileSchema,
  features: FeatureProfileSchema,
  markdown: MarkdownProfileSchema,
  publicationAdapters: PublicationAdapterSelectionSchema,
  integrations: IntegrationProfileSchema,
  staticRoots: z.array(RepositoryRelativePathSchema),
  redirects: RedirectProfileSchema,
  robots: RobotsProfileSchema,
}).strict().superRefine((profile, context) => {
  if (profile.id !== profile.localization.defaultLocale) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['localization', 'defaultLocale'],
      message: `Site profile ${profile.id} must use ${profile.id} as its default locale`,
    });
  }

  const contentIds = new Set<string>();
  const contentRoutes = new Set<string>();
  for (const [index, plugin] of profile.content.entries()) {
    if (contentIds.has(plugin.id)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['content', index, 'id'],
        message: `Duplicate content plugin id: ${plugin.id}`,
      });
    }
    const routeKey = canonicalRouteKey(plugin.routeBasePath);
    if (contentRoutes.has(routeKey)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['content', index, 'routeBasePath'],
        message: `Duplicate content routeBasePath: ${plugin.routeBasePath}`,
      });
    }
    contentIds.add(plugin.id);
    contentRoutes.add(routeKey);
  }

  const rootClaims: OwnershipClaim[] = [
    {label: 'outputDir', path: profile.outputDir},
    ...profile.content.map((plugin, index) => ({label: `content[${index}].sourcePath`, path: plugin.sourcePath})),
    ...profile.staticRoots.map((path, index) => ({label: `staticRoots[${index}]`, path})),
    ...profile.manuals.map((path, index) => ({label: `manuals[${index}]`, path})),
  ];
  const sidebarClaims: OwnershipClaim[] = profile.content.map((plugin, index) => ({
    label: `content[${index}].sidebarPath`,
    path: plugin.sidebarPath,
  }));
  const sidebarRestrictedRoots: OwnershipClaim[] = [
    {label: 'outputDir', path: profile.outputDir},
    ...profile.staticRoots.map((path, index) => ({label: `staticRoots[${index}]`, path})),
    ...profile.manuals.map((path, index) => ({label: `manuals[${index}]`, path})),
  ];
  const translationRestrictedRoots: OwnershipClaim[] = [
    {label: 'outputDir', path: profile.outputDir},
    ...profile.content.map((plugin, index) => ({label: `content[${index}].sourcePath`, path: plugin.sourcePath})),
  ];

  reportOwnershipOverlaps(rootClaims, context);
  reportOwnershipOverlaps(sidebarClaims, context);
  for (const restrictedRoot of translationRestrictedRoots) {
    if (pathsOverlap(profile.localization.translationRoot, restrictedRoot.path)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['localization', 'translationRoot'],
        message: `localization.translationRoot (${profile.localization.translationRoot}) and ${restrictedRoot.label} (${restrictedRoot.path}) have a repository ownership overlap (ancestor/descendant paths)`,
      });
    }
  }
  for (const sidebar of sidebarClaims) {
    for (const restrictedRoot of sidebarRestrictedRoots) {
      if (pathsOverlap(sidebar.path, restrictedRoot.path)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: [sidebar.label],
          message: `${sidebar.label} (${sidebar.path}) and ${restrictedRoot.label} (${restrictedRoot.path}) have a repository ownership overlap (ancestor/descendant paths)`,
        });
      }
    }
  }
  for (const [sidebarIndex, sidebar] of sidebarClaims.entries()) {
    const ownSourcePath = profile.content[sidebarIndex].sourcePath;
    if (ownSourcePath === sidebar.path) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [sidebar.label],
        message: `${sidebar.label} (${sidebar.path}) must not be equal to its own sourcePath`,
      });
    } else if (ownSourcePath.startsWith(`${sidebar.path}/`)) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [sidebar.label],
        message: `${sidebar.label} (${sidebar.path}) must not be an ancestor of its own sourcePath (${ownSourcePath})`,
      });
    }

    for (const [sourceIndex, plugin] of profile.content.entries()) {
      if (sourceIndex === sidebarIndex || !pathsOverlap(sidebar.path, plugin.sourcePath)) {
        continue;
      }
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: [sidebar.label],
        message: `${sidebar.label} (${sidebar.path}) and content[${sourceIndex}].sourcePath (${plugin.sourcePath}) have a repository ownership overlap (cross-plugin ancestor/descendant paths)`,
      });
    }
  }
});

export type SiteId = z.infer<typeof SiteIdSchema>;
export type LocaleId = z.infer<typeof LocaleIdSchema>;
export type RepositoryRelativePath = z.infer<typeof RepositoryRelativePathSchema>;
export type RoutePath = z.infer<typeof RoutePathSchema>;
export type BaseUrl = z.infer<typeof BaseUrlSchema>;
export type SiteOrigin = z.infer<typeof SiteOriginSchema>;
export type ContentPluginProfile = z.infer<typeof ContentPluginProfileSchema>;
export type LocaleProfile = z.infer<typeof LocaleProfileSchema>;
export type LocalizationProfile = z.infer<typeof LocalizationProfileSchema>;
export type FeatureProfile = z.infer<typeof FeatureProfileSchema>;
export type PlaneConfig = z.infer<typeof PlaneConfigSchema>;
export type IntegrationProfile = z.infer<typeof IntegrationProfileSchema>;
export type RedirectRule = z.infer<typeof RedirectRuleSchema>;
export type RedirectProfile = z.infer<typeof RedirectProfileSchema>;
export type NavigationItem = z.infer<typeof NavigationItemSchema>;
export type SecondaryNavigationItem = z.infer<typeof SecondaryNavigationItemSchema>;
export type NavigationProfile = z.infer<typeof NavigationProfileSchema>;
export type MarkdownProfile = z.infer<typeof MarkdownProfileSchema>;
export type PublicationAdapterId = z.infer<typeof PublicationAdapterIdSchema>;
export type PublicationAdapterSelection = z.infer<typeof PublicationAdapterSelectionSchema>;
export type RobotsProfile = z.infer<typeof RobotsProfileSchema>;
export type SiteProfile = z.infer<typeof SiteProfileSchema>;
