import {repairChineseBoldPunctuation} from '../../packages/publication-adapters/src/zh-CN/boldPunctuation.ts';
import {normalizeZhMdxComments} from './zh-mdx-comments.mjs';

export function normalizeZhImportedContent(contents: string): string {
  return repairChineseBoldPunctuation(normalizeZhMdxComments(contents));
}
