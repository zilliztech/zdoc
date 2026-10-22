import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import {visit} from 'unist-util-visit';
import type {DeepReadonly, MarkdownProfile} from '@zilliz/site-config';
import {rewriteDocHref, rewriteHtmlHrefAttributes, type DocsLinkLocale} from '@zilliz/docs-ui/links';

type AstNode = {
  type?: string;
  name?: string;
  tagName?: string;
  value?: string;
  url?: string;
  attributes?: Array<{name?: string; value?: unknown}>;
  properties?: {className?: unknown[]; [key: string]: unknown};
  children?: AstNode[];
  data?: {hChildren?: AstNode[]};
};

type SiteId = 'en' | 'zh-CN';

function restoreMathBraces(value: string): string {
  return value.replace(/\\\{/g, '{').replace(/\\\}/g, '}');
}

export function remarkMathFix() {
  return (tree: AstNode): void => {
    visit(tree as never, (node: AstNode) => {
      if ((node.type === 'math' || node.type === 'inlineMath') && typeof node.value === 'string') {
        node.value = restoreMathBraces(node.value);
        // remark-math caches the hast representation during parsing. rehype-katex
        // reads that cached text, not node.value, so repair it as well for MDX
        // already published by the legacy brace-escaping pipeline.
        visit({type: 'root', children: node.data?.hChildren ?? []} as never, (child: AstNode) => {
          if (child.type === 'text' && typeof child.value === 'string') {
            child.value = restoreMathBraces(child.value);
          }
        });
      }
    });
  };
}

export function rehypeWrapTables() {
  const isTable = (node: AstNode): boolean =>
    (node.type === 'element' && node.tagName === 'table') ||
    (node.type === 'mdxJsxFlowElement' && node.name === 'table');

  const wrap = (node: AstNode): void => {
    if (!Array.isArray(node.children)) return;
    for (let index = 0; index < node.children.length; index += 1) {
      const child = node.children[index];
      if (isTable(child)) {
        const parentClasses = ([] as unknown[]).concat(node.properties?.className ?? []);
        const alreadyWrapped =
          node.type === 'element' && node.tagName === 'div' && parentClasses.includes('zd-table-scroll');
        wrap(child);
        if (!alreadyWrapped) {
          node.children[index] = {
            type: 'element',
            tagName: 'div',
            properties: {className: ['zd-table-scroll']},
            children: [child],
          };
        }
      } else {
        wrap(child);
      }
    }
  };
  return (tree: AstNode): void => wrap(tree);
}

export function rehypeEmojiMarks() {
  const kind = (character: string): 'check' | 'cross' | undefined => {
    if ('✅✔✓☑'.includes(character)) return 'check';
    if ('❌✖✗✘'.includes(character)) return 'cross';
    return undefined;
  };
  const mark = (markKind: 'check' | 'cross'): AstNode => ({
    type: 'element',
    tagName: 'span',
    properties: {className: ['zd-mark', `zd-mark--${markKind}`]},
    children: [{
      type: 'element',
      tagName: 'svg',
      properties: {
        viewBox: '0 0 24 24',
        fill: 'none',
        stroke: 'currentColor',
        strokeWidth: 3,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        'aria-hidden': 'true',
      },
      children: markKind === 'check'
        ? [{type: 'element', tagName: 'path', properties: {d: 'M20 6 9 17l-5-5'}, children: []}]
        : [
            {type: 'element', tagName: 'path', properties: {d: 'M18 6 6 18'}, children: []},
            {type: 'element', tagName: 'path', properties: {d: 'm6 6 12 12'}, children: []},
          ],
    }],
  });

  const walk = (node: AstNode): void => {
    if (!Array.isArray(node.children)) return;
    const children: AstNode[] = [];
    for (const child of node.children) {
      if (child.type === 'text' && typeof child.value === 'string' && /[✅✔✓☑❌✖✗✘]/u.test(child.value)) {
        let text = '';
        for (const character of child.value) {
          const markKind = kind(character);
          if (markKind) {
            if (text) children.push({type: 'text', value: text});
            text = '';
            children.push(mark(markKind));
          } else if (character !== '️') {
            text += character;
          }
        }
        if (text) children.push({type: 'text', value: text});
      } else {
        if (!(child.type === 'element' && (child.tagName === 'code' || child.tagName === 'pre'))) walk(child);
        children.push(child);
      }
    }
    node.children = children;
  };
  return (tree: AstNode): void => walk(tree);
}

// Locale used by the doc-links rewriter: ja-JP content lives under i18n/ja-JP
// in the English site build; the Chinese site build has no ja-JP locale.
function docLinksLocale(site: SiteId, filePath: string | undefined): DocsLinkLocale {
  if (filePath && /i18n[\\/]ja-JP[\\/]/.test(filePath)) return 'ja-JP';
  return site === 'zh-CN' ? 'zh-CN' : 'en';
}

// Absolute docs.zilliz.com(.cn) and milvus.io links in prose must stay
// in-language: docs hosts become relative links (Japanese gets /ja-JP),
// milvus.io links point at the localized trees. See
// packages/docs-ui/src/shared/links/rewriteDocLinks.ts for the URL rules.
export function remarkRewriteDocLinks({site}: {site: SiteId}) {
  return (tree: AstNode, file?: {path?: string}): void => {
    const locale = docLinksLocale(site, file?.path);
    visit(tree as never, 'link', (node: AstNode) => {
      if (typeof node.url === 'string') {
        node.url = rewriteDocHref(node.url, locale);
      }
    });
    // SDK reference tables embed hand-authored HTML anchors, which remark
    // keeps as raw `html` nodes; MDX JSX anchors carry href as an attribute.
    visit(tree as never, 'html', (node: AstNode) => {
      if (typeof node.value === 'string') {
        node.value = rewriteHtmlHrefAttributes(node.value, locale);
      }
    });
    for (const jsxType of ['mdxJsxTextElement', 'mdxJsxFlowElement'] as const) {
      visit(tree as never, jsxType, (node: AstNode) => {
        for (const attribute of node.attributes ?? []) {
          if (attribute?.name === 'href' && typeof attribute.value === 'string') {
            attribute.value = rewriteDocHref(attribute.value, locale);
          }
        }
      });
    }
  };
}

// Zero-width characters are invisible paste artifacts from source wikis. When
// one lands after a hand-written `\{#anchor}`, Docusaurus's explicit-heading
// -anchor parser no longer sees `}` as the heading text's last character, so
// the anchor renders as literal text and the heading id degrades to a slug of
// the full text (observed on content/*/…/json-fields/json-indexing.md). Runs
// via beforeDefaultRemarkPlugins, ahead of the built-in headings/TOC plugins.
const ZERO_WIDTH_CHARACTERS = /[\u200B-\u200D\u2060\uFEFF]/g;

export function remarkStripHeadingZeroWidthChars() {
  const strip = (node: AstNode): void => {
    if (node.type === 'text' && typeof node.value === 'string') {
      node.value = node.value.replace(ZERO_WIDTH_CHARACTERS, '');
    }
    for (const child of node.children ?? []) strip(child);
  };
  return (tree: AstNode): void => {
    visit(tree as never, 'heading', (node: AstNode) => {
      for (const child of node.children ?? []) strip(child);
    });
  };
}

const remarkPolicies = {
  math: remarkMath,
  'math-brace-fix': remarkMathFix,
} as const;

const rehypePolicies = {
  katex: rehypeKatex,
  'wrap-tables': rehypeWrapTables,
  'emoji-marks': rehypeEmojiMarks,
} as const;

export function resolveMarkdownPolicy(markdown: DeepReadonly<MarkdownProfile>, site: SiteId) {
  const remarkPlugins = markdown.remarkPlugins.map(name => {
    if (name === 'doc-links') return () => remarkRewriteDocLinks({site});
    const plugin = remarkPolicies[name as keyof typeof remarkPolicies];
    if (!plugin) throw new Error(`Unsupported remark Markdown policy: ${name}`);
    return plugin;
  });
  const rehypePlugins = markdown.rehypePlugins.map(name => {
    const plugin = rehypePolicies[name as keyof typeof rehypePolicies];
    if (!plugin) throw new Error(`Unsupported rehype Markdown policy: ${name}`);
    return plugin;
  });
  return {
    beforeDefaultRemarkPlugins: [remarkStripHeadingZeroWidthChars],
    remarkPlugins,
    rehypePlugins,
    stylesheets: markdown.rehypePlugins.includes('katex')
      ? [{
          href: 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css',
          type: 'text/css',
          crossorigin: 'anonymous',
        }]
      : [],
  };
}
