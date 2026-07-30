import {z} from 'zod';

const RepositoryPathSchema = z.string().min(1).superRefine((value, context) => {
  const segments = value.split('/');
  const invalid =
    value !== value.trim()
    || value !== value.normalize('NFC')
    || value.startsWith('/')
    || /^[A-Za-z]:\//u.test(value)
    || value.includes('\\')
    || value.includes('\0')
    || segments.some(segment => segment === '' || segment === '.' || segment === '..');
  if (invalid) context.addIssue({code: z.ZodIssueCode.custom, message: 'Path must be normalized, NFC, and repository-relative'});
});

const SidebarSourceSchema = z.string().superRefine((value, context) => {
  const [filePath, key, extra] = value.split('#');
  if (!filePath || !key || extra !== undefined || filePath !== filePath.normalize('NFC') || key !== key.normalize('NFC')) {
    context.addIssue({code: z.ZodIssueCode.custom, message: 'Sidebar source must contain one NFC file#key identity'});
    return;
  }
  const parsed = RepositoryPathSchema.safeParse(filePath);
  if (!parsed.success) context.addIssue({code: z.ZodIssueCode.custom, message: 'Sidebar source path must be normalized and repository-relative'});
});

export const TranslationTargetIdSchema = z.enum(['ja-JP', 'zh-CN-reference', 'zh-CN-tools']);
export const TranslationCandidateReasonSchema = z.enum(['current_delta', 'missing_target', 'stale_source']);

const MappingSchema = z.object({
  sourceRoot: RepositoryPathSchema,
  targetRoot: RepositoryPathSchema,
}).strict();

const CommonTarget = {
  id: TranslationTargetIdSchema,
  sourceSite: z.literal('en'),
  locale: z.enum(['ja-JP', 'zh-CN']),
  validation: z.array(z.string().min(1)).readonly(),
};

export const TranslationTargetSchema = z.discriminatedUnion('id', [
  z.object({
    ...CommonTarget,
    id: z.literal('ja-JP'),
    locale: z.literal('ja-JP'),
    mappings: z.array(MappingSchema).length(3).readonly(),
    state: z.object({kind: z.literal('cache'), path: RepositoryPathSchema}).strict(),
  }).strict(),
  z.object({
    ...CommonTarget,
    id: z.literal('zh-CN-reference'),
    targetSite: z.literal('zh-CN'),
    locale: z.literal('zh-CN'),
    sourceRoot: RepositoryPathSchema,
    targetRoot: RepositoryPathSchema,
    state: z.object({kind: z.literal('reference-manifest'), path: RepositoryPathSchema}).strict(),
  }).strict(),
  z.object({
    ...CommonTarget,
    id: z.literal('zh-CN-tools'),
    targetSite: z.literal('zh-CN'),
    locale: z.literal('zh-CN'),
    sourceRoot: RepositoryPathSchema,
    targetRoot: RepositoryPathSchema,
    sidebarSource: SidebarSourceSchema,
    sidebarTarget: RepositoryPathSchema,
    state: z.object({kind: z.literal('tools-manifest'), path: RepositoryPathSchema}).strict(),
  }).strict(),
]);

export type TranslationTargetId = z.infer<typeof TranslationTargetIdSchema>;
export type TranslationTarget = z.infer<typeof TranslationTargetSchema>;
export type TranslationCandidateReason = z.infer<typeof TranslationCandidateReasonSchema>;
