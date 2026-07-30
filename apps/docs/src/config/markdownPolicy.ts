import rehypeKatex from 'rehype-katex';
import remarkMath from 'remark-math';
import {visit} from 'unist-util-visit';
import type {DeepReadonly, MarkdownProfile} from '@zilliz/site-config';

type AstNode = {
  type?: string;
  name?: string;
  tagName?: string;
  value?: string;
  properties?: {className?: unknown[]; [key: string]: unknown};
  children?: AstNode[];
};

export function remarkMathFix() {
  return (tree: AstNode): void => {
    visit(tree as never, (node: AstNode) => {
      if ((node.type === 'math' || node.type === 'inlineMath') && typeof node.value === 'string') {
        node.value = node.value.replace(/\\\{/g, '{').replace(/\\\}/g, '}');
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

const remarkPolicies = {
  math: remarkMath,
  'math-brace-fix': remarkMathFix,
} as const;

const rehypePolicies = {
  katex: rehypeKatex,
  'wrap-tables': rehypeWrapTables,
  'emoji-marks': rehypeEmojiMarks,
} as const;

export function resolveMarkdownPolicy(markdown: DeepReadonly<MarkdownProfile>) {
  const remarkPlugins = markdown.remarkPlugins.map(name => {
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
