import type {GeneratedDocument, PublicationAdapter} from '../types.ts';
import {normalizeDecoratedHttpSchemes} from './contentMatchers.ts';
import {transformMarkdownBody} from './markdownBody.ts';

export const ZH_CN_MARKDOWN_NORMALIZER_ID = 'zh-CN.markdown-normalizer';

function normalizeMarkdown(contents: string): string {
  return normalizeDecoratedHttpSchemes(contents)
    .replace(/https?:\/\/support\.zilliz\.com(?:\.cn)*\/hc\/(?:en-us|zh-cn)(?=$|[/?#\s)\]}>"'|])([^\s)\]}>"'|]*)/giu, (_match, suffix: string) => `https://support.zilliz.com.cn/hc/zh-cn${suffix}`)
    .replace(/https?:\/\/zilliz\.com(?:\.cn)*\/contact-sales(?=$|[/?#\s)\]}>"'|])([^\s)\]}>"'|]*)/giu, (_match, suffix: string) => `https://zilliz.com.cn/contact-sales${suffix}`)
    .replace(/https?:\/\/zilliz\.com(?:\.cn)*\/pricing(?=$|[/?#\s)\]}>"'|])([^\s)\]}>"'|]*)/giu, (_match, suffix: string) => `https://zilliz.com.cn/pricing${suffix}`);
}

export const zhCnMarkdownNormalizer: PublicationAdapter = Object.freeze({
  id: ZH_CN_MARKDOWN_NORMALIZER_ID,
  transformDocument(document, context): GeneratedDocument {
    if (context.site !== 'zh-CN') return document;
    return {...document, contents: transformMarkdownBody(document.contents, normalizeMarkdown)};
  },
  async validatePublication() {},
});
