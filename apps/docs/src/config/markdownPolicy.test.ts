import {describe, expect, it} from 'vitest';
import {compile} from '@mdx-js/mdx';
import {
  rehypeEmojiMarks,
  rehypeWrapTables,
  remarkMathFix,
  resolveMarkdownPolicy,
} from './markdownPolicy';

describe('English Markdown renderer policy', () => {
  it('resolves the named legacy policy to executable remark and rehype plugins', () => {
    const policy = resolveMarkdownPolicy({
      remarkPlugins: ['math', 'math-brace-fix'],
      rehypePlugins: ['katex', 'wrap-tables', 'emoji-marks'],
    });

    expect(policy.remarkPlugins).toHaveLength(2);
    expect(policy.rehypePlugins).toHaveLength(3);
    expect(policy.stylesheets).toContainEqual(expect.objectContaining({
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.11/dist/katex.min.css',
    }));
  });

  it('normalizes escaped braces in math values and remark-math cached output', () => {
    const tree = {
      type: 'root',
      children: [
        {
          type: 'math',
          value: String.raw`\frac\{x\}\{y\}`,
          data: {hChildren: [{type: 'element', children: [{type: 'text', value: String.raw`\frac\{x\}\{y\}`}]}]},
        },
        {type: 'inlineMath', value: String.raw`\{y\}`},
      ],
    };
    remarkMathFix()(tree);
    expect(tree.children.map(node => node.value)).toEqual([String.raw`\frac{x}{y}`, '{y}']);
    expect(tree.children[0].data?.hChildren[0].children?.[0].value).toBe(String.raw`\frac{x}{y}`);
  });

  it('renders legacy escaped Gaussian decay formulas without a KaTeX error', async () => {
    const policy = resolveMarkdownPolicy({
      remarkPlugins: ['math', 'math-brace-fix'],
      rehypePlugins: ['katex'],
    });
    const legacyFormula = String.raw`$$
S(doc) = \exp\left( -\frac\{\left( \max\left(0, \left|fieldvalue_\{doc\} - origin\right| - offset \right) \right)^2\}\{2\sigma^2\} \right)
$$`;
    const compiled = String(await compile(legacyFormula, {
      remarkPlugins: policy.remarkPlugins,
      rehypePlugins: policy.rehypePlugins,
    }));

    expect(compiled).not.toContain('katex-error');
    expect(compiled).toContain('mfrac');
  });

  it('wraps raw HTML tables and replaces emoji marks while leaving code alone', () => {
    const rawTable = {type: 'mdxJsxFlowElement', name: 'table', children: []};
    const tree = {
      type: 'root',
      children: [
        rawTable,
        {type: 'element', tagName: 'p', properties: {}, children: [{type: 'text', value: '✅ no ❌'}]},
        {type: 'element', tagName: 'code', properties: {}, children: [{type: 'text', value: '✅'}]},
      ],
    };
    rehypeWrapTables()(tree);
    rehypeEmojiMarks()(tree);

    expect(tree.children[0]).toMatchObject({
      type: 'element',
      tagName: 'div',
      properties: {className: ['zd-table-scroll']},
      children: [rawTable],
    });
    expect(tree.children[1].children.filter((node: {type: string}) => node.type === 'element')).toHaveLength(2);
    expect(tree.children[2].children).toEqual([{type: 'text', value: '✅'}]);
  });
});
