import type {GeneratedDocument, PublicationAdapter} from '../types.ts';
import {transformMarkdownBody} from './markdownBody.ts';

export const ZH_CN_MARKDOWN_NORMALIZER_ID = 'zh-CN.markdown-normalizer';

function normalizeMarkdown(contents: string): string {
  return contents
    .replace(/<[^>]+>http<\/[^>]+>s:\/\//giu, 'https://')
    .replace(/https?:\/\/support\.zilliz\.com(?:\.cn)?(?:\/hc\/[^\s)\]}>"']*)?/giu, 'https://support.zilliz.com.cn/hc/zh-cn')
    .replace(/https?:\/\/zilliz\.com(?:\.cn)?\/contact-sales(?:\?[^\s)\]}>"']*)?/giu, 'https://zilliz.com.cn/contact-sales')
    .replace(/https?:\/\/zilliz\.com(?:\.cn)?\/pricing(?!\.cn)([^\s)\]}>"']*)?/giu, (_match, suffix: string | undefined) => `https://zilliz.com.cn/pricing${suffix ?? ''}`);
}

export const zhCnMarkdownNormalizer: PublicationAdapter = Object.freeze({
  id: ZH_CN_MARKDOWN_NORMALIZER_ID,
  transformDocument(document, context): GeneratedDocument {
    if (context.site !== 'zh-CN') return document;
    return {...document, contents: transformMarkdownBody(document.contents, normalizeMarkdown)};
  },
  async validatePublication() {},
});
