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
  if ((isLocal || source.sourceType === 'rest') && (source.root !== undefined || source.base !== undefined)) {
    context.addIssue({
      code: z.ZodIssueCode.custom,
      message: `${source.sourceType} sources must not declare Lark root or base identifiers`,
    });
  }
});

export const ManualPublicationSchema = z.object({
  enabled: z.boolean(),
  source: z.string().min(1),
  outputDir: RepositoryRelativePathSchema,
  contentRoot: RepositoryRelativePathSchema,
  sidebarPath: RepositoryRelativePathSchema,
  overridePath: RepositoryRelativePathSchema.optional(),
  missingContent: z.enum(['error', 'explicitly-disabled']),
  retiredPaths: z.array(RepositoryRelativePathSchema).optional(),
}).strict();

export const ManualDefinitionSchema = z.object({
  id: z.string().regex(/^[a-z][a-z0-9-]*$/u),
  kind: z.enum(['guides', 'reference', 'onpremise', 'agents']),
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
export type ManualDefinition = z.infer<typeof ManualDefinitionSchema>;
