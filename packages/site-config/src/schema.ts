import {z} from 'zod';

export const SiteIdSchema = z.enum(['en', 'zh-CN']);

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

export const RoutePathSchema = z.string().min(1).superRefine((value, context) => {
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

export const BaseUrlSchema = z.string().min(1).superRefine((value, context) => {
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

export const ContentPluginProfileSchema = z.object({
  id: z.enum(['default', 'byoc', 'reference', 'agents', 'onpremise']),
  sourcePath: RepositoryRelativePathSchema,
  routeBasePath: RoutePathSchema,
  sidebarPath: RepositoryRelativePathSchema,
  include: z.array(RepositoryRelativePathSchema).optional(),
  exclude: z.array(RepositoryRelativePathSchema).optional(),
}).strict();

export const FeatureProfileSchema = z.object({
  chat: z.boolean(),
  askAi: z.boolean(),
  feedback: z.boolean(),
  cloudSelector: z.boolean(),
  byoc: z.boolean(),
  onpremise: z.boolean(),
  agents: z.boolean(),
  referenceKinds: z.array(z.enum(['python', 'java', 'nodejs', 'go', 'restful', 'cli'])),
}).strict();

export const IntegrationProfileSchema = z.object({
  searchProvider: z.string().min(1).optional(),
  chatProvider: z.string().min(1).optional(),
  analyticsProvider: z.string().min(1).optional(),
  feedbackProvider: z.string().min(1).optional(),
  storageAdapter: z.string().min(1).optional(),
}).strict();

export const RedirectRuleSchema = z.object({
  from: RoutePathSchema,
  to: RoutePathSchema,
  permanent: z.boolean().optional(),
}).strict();

export const RedirectProfileSchema = z.object({
  rules: z.array(RedirectRuleSchema),
}).strict();

export const NavigationItemSchema = z.object({
  label: z.string().min(1),
  to: RoutePathSchema.optional(),
  href: z.string().min(1).optional(),
}).strict().refine(item => item.to !== undefined || item.href !== undefined, {
  message: 'Navigation items require either to or href',
});

export const NavigationProfileSchema = z.object({
  items: z.array(NavigationItemSchema),
}).strict();

export const MarkdownProfileSchema = z.object({
  remarkPlugins: z.array(z.string().min(1)),
  rehypePlugins: z.array(z.string().min(1)),
}).strict();

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
  url: z.string().url(),
  baseUrl: BaseUrlSchema,
  outputDir: RepositoryRelativePathSchema,
  content: z.array(ContentPluginProfileSchema),
  manuals: z.array(RepositoryRelativePathSchema),
  navigation: NavigationProfileSchema,
  features: FeatureProfileSchema,
  markdown: MarkdownProfileSchema,
  integrations: IntegrationProfileSchema,
  staticRoots: z.array(RepositoryRelativePathSchema),
  redirects: RedirectProfileSchema,
  robots: RobotsProfileSchema,
}).strict().superRefine((profile, context) => {
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

  reportOwnershipOverlaps(rootClaims, context);
  reportOwnershipOverlaps(sidebarClaims, context);
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
    if (ownSourcePath.startsWith(`${sidebar.path}/`)) {
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
export type RepositoryRelativePath = z.infer<typeof RepositoryRelativePathSchema>;
export type RoutePath = z.infer<typeof RoutePathSchema>;
export type BaseUrl = z.infer<typeof BaseUrlSchema>;
export type ContentPluginProfile = z.infer<typeof ContentPluginProfileSchema>;
export type FeatureProfile = z.infer<typeof FeatureProfileSchema>;
export type IntegrationProfile = z.infer<typeof IntegrationProfileSchema>;
export type RedirectRule = z.infer<typeof RedirectRuleSchema>;
export type RedirectProfile = z.infer<typeof RedirectProfileSchema>;
export type NavigationItem = z.infer<typeof NavigationItemSchema>;
export type NavigationProfile = z.infer<typeof NavigationProfileSchema>;
export type MarkdownProfile = z.infer<typeof MarkdownProfileSchema>;
export type RobotsProfile = z.infer<typeof RobotsProfileSchema>;
export type SiteProfile = z.infer<typeof SiteProfileSchema>;
