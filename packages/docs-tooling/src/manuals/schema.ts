import {z} from 'zod';

export const SiteIdSchema = z.enum(['en', 'zh-CN']);

const RepositoryRelativePathSchema = z.string().min(1).superRefine((value, context) => {
  const segments = value.split('/');
  const invalid =
    value !== value.trim() ||
    value.startsWith('/') ||
    /^[A-Za-z]:\//u.test(value) ||
    value.includes('\\') ||
    value.includes('\0') ||
    segments.some(segment => segment === '' || segment === '.' || segment === '..');

  if (invalid) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Path must be a normalized repository-relative path: ${JSON.stringify(value)}`,
    });
  }
});

export const ManualSourceSchema = z.object({
  sourceType: z.enum(['wiki', 'drive', 'onePager', 'rest', 'local']),
  lifecycle: z.enum(['active', 'fallback', 'retired', 'translation']).default('active'),
  root: z.string().min(1).optional(),
  base: z.string().min(1).optional(),
  version: z.string().min(1).optional(),
  generatorManual: z.string().min(1).optional(),
  snapshotPath: RepositoryRelativePathSchema.optional(),
  sourceDir: RepositoryRelativePathSchema,
  fallbackSource: z.string().min(1).optional(),
}).strict().superRefine((source, context) => {
  const isLocal = source.sourceType === 'local';
  const isLark = source.sourceType === 'wiki' || source.sourceType === 'drive' || source.sourceType === 'onePager';
  if (isLark && (!source.root || !source.base)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Remote source type ${source.sourceType} requires root and base`,
    });
  }
  if (isLark && source.lifecycle !== 'retired' && (!source.generatorManual || !source.snapshotPath)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Active remote source type ${source.sourceType} requires generatorManual and snapshotPath`,
    });
  }
  if ((isLocal || source.sourceType === 'rest') && (source.root !== undefined || source.base !== undefined)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${source.sourceType} sources must not declare Lark root or base identifiers`,
    });
  }
  if ((isLocal || source.sourceType === 'rest') && (source.generatorManual !== undefined || source.snapshotPath !== undefined)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${source.sourceType} sources must not declare generator or snapshot identities`,
    });
  }
});

export const ManualPublicationSchema = z.object({
  enabled: z.boolean(),
  source: z.string().min(1),
  generatorTarget: z.enum(['zilliz', 'zilliz.saas', 'zilliz.paas']),
  outputDir: RepositoryRelativePathSchema,
  contentRoot: RepositoryRelativePathSchema,
  sidebarPath: RepositoryRelativePathSchema,
  overridePath: RepositoryRelativePathSchema.optional(),
  missingContent: z.enum(['error', 'explicitly-disabled']),
  preservedFiles: z.array(RepositoryRelativePathSchema).optional(),
  retiredPaths: z.array(RepositoryRelativePathSchema).optional(),
}).strict();

export const ReferencePresentationSchema = z.object({
  // Public reference kind used in site navigation and URLs. Differs from the
  // manual id for Node.js (nodejs) and REST (restful).
  referenceKind: z.string().regex(/^[a-z][a-z0-9-]*$/u),
  // Sidebar identity: the generated sidebar basename and the Docusaurus
  // sidebar key exposed from site-config sidebars.
  sidebar: z.string().min(1),
  sidebarKey: z.string().min(1),
  // Localized navigation labels.
  label: z.object({en: z.string().min(1), 'zh-CN': z.string().min(1)}),
  icon: z.string().min(1),
  // Root href (and prefix) for the Reference landing area.
  href: z.string().min(1),
  prefix: z.string().min(1),
  // Standalone navbar item href when it differs from href (CLI).
  navHref: z.string().min(1).optional(),
  // Fetch/publish group order within the English source pipeline.
  groupOrder: z.number().int().positive(),
  // Presentation order within each site's Reference navigation surface.
  navOrder: z.object({en: z.number().int().positive(), 'zh-CN': z.number().int().positive()}),
  // Whether this manual renders as a standalone navbar item rather than an
  // entry inside the grouped "API & SDK" dropdown (CLI).
  standalone: z.boolean(),
  // Landing contract mirrored by config/reference-navigation.json.
  documentIdPrefix: z.string().min(1),
  landingPage: z.string().min(1).refine(value => /\.mdx?$/u.test(value), 'Landing page must be a .md or .mdx file'),
  minimumProseCharacters: z.number().int().positive(),
  minimumHeadingCount: z.number().int().positive(),
  requireSourceDifference: z.boolean(),
}).strict();

export const ManualDefinitionSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/u),
  kind: z.enum(['guides', 'reference', 'onpremise', 'agents']),
  presentation: ReferencePresentationSchema.optional(),
  sources: z.record(z.string().min(1), ManualSourceSchema),
  sourceOrder: z.array(z.string().min(1)).optional(),
  publications: z.object({
    en: ManualPublicationSchema.optional(),
    'zh-CN': ManualPublicationSchema.optional(),
  }).strict(),
}).strict();

export type SiteId = z.infer<typeof SiteIdSchema>;
export type ManualSource = z.infer<typeof ManualSourceSchema>;
export type ManualPublication = z.infer<typeof ManualPublicationSchema>;
export type ReferencePresentation = z.infer<typeof ReferencePresentationSchema>;
export type ManualDefinition = z.infer<typeof ManualDefinitionSchema>;
