import {readFileSync} from 'node:fs';

import {z} from 'zod';

import {assertSafeRepositoryRelativePath, resolveOwnedRepositoryPath} from '../validation/ownership.ts';
import {assertSafeAtomicWriteTargets, writeAtomicRepositoryFiles} from '../validation/atomicFiles.ts';

/** A single broken internal link or anchor, mirroring Docusaurus `BrokenLink`. */
const BrokenLinkSchema = z.object({
  link: z.string().min(1),
  resolvedLink: z.string().min(1),
  anchor: z.boolean(),
  path: z.string().min(1),
}).strict();

export type BrokenLink = {
  link: string;
  resolvedLink: string;
  anchor: boolean;
  path: string;
};

const BrokenLinksSummarySchema = z.object({
  broken_links: z.number().int().nonnegative(),
  broken_anchors: z.number().int().nonnegative(),
}).strict();

const canonicalDateTime = z.string().datetime().refine(value => new Date(value).toISOString() === value, {
  message: 'generated_at must be a canonical UTC datetime',
});

export const BrokenLinksReportSchema = z.object({
  schema_version: z.literal(1),
  generated_at: canonicalDateTime,
  site: z.enum(['en', 'zh-CN']),
  summary: BrokenLinksSummarySchema,
  broken_links: z.array(BrokenLinkSchema),
  broken_anchors: z.array(BrokenLinkSchema),
}).strict();

export type BrokenLinksReport = {
  schema_version: 1;
  generated_at: string;
  site: 'en' | 'zh-CN';
  summary: {
    broken_links: number;
    broken_anchors: number;
  };
  broken_links: BrokenLink[];
  broken_anchors: BrokenLink[];
};

/** Parse and validate a broken-links report, typed with required fields. */
export function parseBrokenLinksReport(data: unknown): BrokenLinksReport {
  return BrokenLinksReportSchema.parse(data) as unknown as BrokenLinksReport;
}

/**
 * Parse Docusaurus's own broken-link/anchors report out of a build log.
 *
 * The log format is:
 *   - Broken link on source page path = /docs/foo:
 *      -> linking to ./bar (resolved as: /docs/bar)
 *   - Broken anchor on source page path = /docs/foo:
 *      -> linking to ./bar#anchor (resolved as: /docs/bar#anchor)
 */
export function parseBrokenLinksLog(log: string): {brokenLinks: BrokenLink[]; brokenAnchors: BrokenLink[]} {
  const brokenLinks: BrokenLink[] = [];
  const brokenAnchors: BrokenLink[] = [];
  let type: 'link' | 'anchor' | null = null;
  let sourcePath = '';
  for (const rawLine of log.split('\n')) {
    const line = rawLine.trim();
    const linkHeader = line.match(/^- Broken link on source page path = (\S+):$/);
    const anchorHeader = line.match(/^- Broken anchor on source page path = (\S+):$/);
    if (linkHeader) {
      type = 'link';
      sourcePath = linkHeader[1];
      continue;
    }
    if (anchorHeader) {
      type = 'anchor';
      sourcePath = anchorHeader[1];
      continue;
    }
    const linking = line.match(/^-> linking to (.+?)(?: \(resolved as: (.+)\))?$/);
    if (linking && type && sourcePath) {
      const entry: BrokenLink = {
        link: linking[1],
        resolvedLink: linking[2] ?? linking[1],
        anchor: type === 'anchor',
        path: sourcePath,
      };
      (type === 'anchor' ? brokenAnchors : brokenLinks).push(entry);
    }
  }
  return {brokenLinks, brokenAnchors};
}

export async function checkBrokenLinks(
  options: {repositoryRoot: string; site: string; log: string; output: string},
  dependencies: {now?: () => Date; write?: (message: string) => void} = {},
): Promise<BrokenLinksReport> {
  if (options.site !== 'en' && options.site !== 'zh-CN') throw new Error('site must be en or zh-CN');
  const now = (dependencies.now ?? (() => new Date()))();
  const write = dependencies.write ?? (message => process.stdout.write(`${message}\n`));

  assertSafeRepositoryRelativePath(options.log, 'Broken-links build log');
  const logPath = resolveOwnedRepositoryPath(options.repositoryRoot, options.log, 'Broken-links build log');
  const {brokenLinks, brokenAnchors} = parseBrokenLinksLog(readFileSync(logPath, 'utf8'));

  const report = parseBrokenLinksReport({
    schema_version: 1,
    generated_at: now.toISOString(),
    site: options.site,
    summary: {broken_links: brokenLinks.length, broken_anchors: brokenAnchors.length},
    broken_links: brokenLinks,
    broken_anchors: brokenAnchors,
  });

  const jsonOutput = options.output.replace(/\.md$/u, '.json');
  assertSafeAtomicWriteTargets(options.repositoryRoot, [options.output, jsonOutput], 'Broken-links report output');
  writeAtomicRepositoryFiles(options.repositoryRoot, [
    {path: options.output, contents: renderBrokenLinksMarkdown(report)},
    {path: jsonOutput, contents: JSON.stringify(report, null, 2)},
  ], 'Broken-links report output');

  write(`Broken links: ${report.summary.broken_links}`);
  write(`Broken anchors: ${report.summary.broken_anchors}`);
  write(`Broken-links report written to ${options.output}`);
  return report;
}

export function renderBrokenLinksMarkdown(report: BrokenLinksReport): string {
  const renderItem = (item: BrokenLink): string => `- \`${item.link}\` (resolved as: \`${item.resolvedLink}\`) on \`${item.path}\``;
  return [
    '# Internal Broken Links Report',
    '',
    `Generated: ${report.generated_at}`,
    `Site: ${report.site}`,
    '',
    '## Summary',
    '',
    `- Broken links: ${report.summary.broken_links}`,
    `- Broken anchors: ${report.summary.broken_anchors}`,
    '',
    '## Broken Links',
    '',
    ...(report.broken_links.length === 0 ? ['- None'] : report.broken_links.map(renderItem)),
    '',
    '## Broken Anchors',
    '',
    ...(report.broken_anchors.length === 0 ? ['- None'] : report.broken_anchors.map(renderItem)),
  ].join('\n');
}
