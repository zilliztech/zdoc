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

// Explicit heading anchors ({#id}) bypass Docusaurus's slugger: they are
// consumed verbatim, unlike implicit slugs. Wiki sources that repeat a section
// heading inside one page ("Via RESTful API") therefore mint identical
// anchors — every copy shares one DOM id and in-page navigation can only ever
// reach the first (observed on manage-on-demand-clusters, four id="via-restful
// -api" headings). Rewrite the 2nd+ occurrence of each anchor with the
// slugger's -1/-2… suffix convention; the first keeps the bare id, so existing
// #anchor links keep landing on it, and unique anchors are never touched.
// Reserved suffix-shaped ids ({#x-1} authored by hand) never receive a
// colliding suffix. Runs in beforeDefaultRemarkPlugins, after the zero-width
// strip and ahead of the built-in headings/TOC plugins, which then consume the
// rewritten anchors as ordinary explicit ids.
const HEADING_ANCHOR_PATTERN = /\s*\{#(?<id>(?:.(?!\{#|\}))*.)\}$/;
// The token alone, so a rewrite replaces exactly what Docusaurus consumes even
// when an unbalanced `{#` precedes it in the same text node.
const HEADING_ANCHOR_TOKEN = /\{#(?:.(?!\{#|\}))*.\}$/;

// Mirrors mdast-util-to-string over the nodes Docusaurus concatenates, minus
// image alt text; a trailing image fails the text-node gate below either way.
function headingTextOf(node: AstNode): string {
  if (typeof node.value === 'string') return node.value;
  return (node.children ?? []).map(headingTextOf).join('');
}

// Mirrors @docusaurus/mdx-loader's extraction: html/jsx children are excluded
// from the heading text, and the anchor only counts when it closes that text.
// Returns the trailing text node carrying the token so the rewrite stays
// inside it. Anchors Docusaurus consumes from elsewhere — a token wrapped in
// emphasis, carried by trailing inline code, or written as an MDX/HTML comment
// — are deliberately neither counted nor rewritten: touching those nodes is
// where display text could be damaged, so such shapes may still share an id.
function headingAnchor(node: AstNode): {node: AstNode; id: string} | undefined {
  const textChildren = (node.children ?? []).filter(
    child => child.type !== 'html' && child.type !== 'jsx',
  );
  const id = HEADING_ANCHOR_PATTERN.exec(textChildren.map(headingTextOf).join(''))
    ?.groups?.id.trim();
  if (!id) return undefined;
  const last = textChildren[textChildren.length - 1];
  if (last?.type !== 'text' || typeof last.value !== 'string') return undefined;
  if (HEADING_ANCHOR_PATTERN.exec(last.value)?.groups?.id.trim() !== id) return undefined;
  return {node: last, id};
}

export function remarkDedupeHeadingAnchors() {
  return (tree: AstNode): void => {
    // All state is per tree: mdx-loader compiles each file independently, and
    // anchors are page-scoped.
    const anchors: Array<{node: AstNode; id: string}> = [];
    visit(tree as never, 'heading', (node: AstNode) => {
      const anchor = headingAnchor(node);
      if (anchor) anchors.push(anchor);
    });
    const counts = new Map<string, number>();
    const reserved = new Set<string>();
    for (const anchor of anchors) {
      counts.set(anchor.id, (counts.get(anchor.id) ?? 0) + 1);
      reserved.add(anchor.id);
    }
    const ordinal = new Map<string, number>();
    const assigned = new Set<string>();
    for (const anchor of anchors) {
      const base = anchor.id;
      const occurrence = (ordinal.get(base) ?? 0) + 1;
      ordinal.set(base, occurrence);
      let final = base;
      if (counts.get(base)! > 1 && occurrence > 1) {
        let suffix = 1;
        while (reserved.has(`${base}-${suffix}`) || assigned.has(`${base}-${suffix}`)) {
          suffix += 1;
        }
        final = `${base}-${suffix}`;
        assigned.add(final);
      }
      if (final !== base) {
        anchor.node.value = (anchor.node.value as string).replace(HEADING_ANCHOR_TOKEN, `{#${final}}`);
      }
    }
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
    beforeDefaultRemarkPlugins: [remarkStripHeadingZeroWidthChars, remarkDedupeHeadingAnchors],
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
