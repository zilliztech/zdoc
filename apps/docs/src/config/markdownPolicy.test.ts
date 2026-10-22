import {describe, expect, it} from 'vitest';
import {compile} from '@mdx-js/mdx';
import {
  rehypeEmojiMarks,
  rehypeWrapTables,
  remarkMathFix,
  remarkRewriteDocLinks,
  remarkStripHeadingZeroWidthChars,
  resolveMarkdownPolicy,
} from './markdownPolicy';

describe('English Markdown renderer policy', () => {
  it('resolves the named legacy policy to executable remark and rehype plugins', () => {
    const policy = resolveMarkdownPolicy({
      remarkPlugins: ['math', 'math-brace-fix'],
      rehypePlugins: ['katex', 'wrap-tables', 'emoji-marks'],
    }, 'en');

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
    }, 'en');
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

describe('heading zero-width normalization policy', () => {
  it('registers the strip plugin as a before-default remark plugin on both sites', () => {
    for (const site of ['en', 'zh-CN'] as const) {
      const policy = resolveMarkdownPolicy({remarkPlugins: [], rehypePlugins: []}, site);
      expect(policy.beforeDefaultRemarkPlugins).toHaveLength(1);
      expect(typeof policy.beforeDefaultRemarkPlugins[0]).toBe('function');
    }
  });

  it('strips zero-width characters inside headings, including nested inline nodes', () => {
    type TestNode = {type: string; depth?: number; value?: string; children?: TestNode[]};
    const tree: {type: string; children: TestNode[]} = {
      type: 'root',
      children: [
        {type: 'heading', depth: 2, children: [
          {type: 'text', value: '索引类型概览{#json-index-syntax}\u200B'},
        ]},
        {type: 'heading', depth: 3, children: [
          {type: 'emphasis', children: [{type: 'text', value: 'AUTO\u200BINDEX'}]},
          {type: 'text', value: '\uFEFF'},
        ]},
        {type: 'paragraph', children: [{type: 'text', value: '正文\u200B保持原样'}]},
      ],
    };
    remarkStripHeadingZeroWidthChars()(tree);

    expect(tree.children[0].children[0].value).toBe('索引类型概览{#json-index-syntax}');
    expect(tree.children[1].children[0].children[0].value).toBe('AUTOINDEX');
    expect(tree.children[1].children[1].value).toBe('');
    expect(tree.children[2].children[0].value).toBe('正文\u200B保持原样');
  });

  it('makes polluted anchors satisfy the Docusaurus explicit-anchor grammar', () => {
    // Copied from @docusaurus/utils parseMarkdownHeadingId: the anchor only
    // counts when `}` is the heading text's last character.
    const docusaurusExplicitAnchor = /\s*\{#(?<id>(?:.(?!\{#|\}))*.)\}$/;
    const polluted = '索引类型概览{#json-index-syntax}\u200B';
    expect(docusaurusExplicitAnchor.test(polluted)).toBe(false);

    const tree = {type: 'heading', depth: 2, children: [{type: 'text', value: polluted}]};
    remarkStripHeadingZeroWidthChars()(tree);

    const cleaned = tree.children[0].value;
    expect(docusaurusExplicitAnchor.exec(cleaned)?.groups?.id).toBe('json-index-syntax');
  });
});

describe('doc-links Markdown policy', () => {
  it('resolves doc-links for both sites and rewrites links during MDX compilation', async () => {
    const chinese = resolveMarkdownPolicy({
      remarkPlugins: ['doc-links'],
      rehypePlugins: [],
    }, 'zh-CN');
    expect(chinese.remarkPlugins).toHaveLength(1);

    const english = resolveMarkdownPolicy({
      remarkPlugins: ['doc-links'],
      rehypePlugins: [],
    }, 'en');
    expect(english.remarkPlugins).toHaveLength(1);

    const source = [
      'See [计划对比](https://docs.zilliz.com/docs/select-zilliz-cloud-service-plans#deployment)',
      'and [企业认证](https://docs.zilliz.com.cn/docs/enterprise-certification)',
      'and [模式匹配](https://milvus.io/docs/pattern-matching.md).',
      '',
      '<p>Hand-authored anchor: <a href="https://milvus.io/docs/boolean.md">Scalar Filtering Rules</a>.</p>',
    ].join('\n');

    const compiled = String(await compile(source, {remarkPlugins: chinese.remarkPlugins}));
    expect(compiled).toContain('/docs/select-zilliz-cloud-service-plans#deployment');
    expect(compiled).toContain('/docs/enterprise-certification');
    expect(compiled).toContain('https://milvus.io/docs/zh/pattern-matching.md');
    expect(compiled).toContain('https://milvus.io/docs/zh/boolean.md');
    expect(compiled).not.toContain('docs.zilliz.com');

    const englishCompiled = String(await compile(source, {remarkPlugins: english.remarkPlugins}));
    expect(englishCompiled).toContain('https://milvus.io/docs/pattern-matching.md');
  });

  it('rewrites hand-authored HTML blocks and MDX JSX href attributes directly', () => {
    const expressionValue = {type: 'mdxJsxAttributeValueExpression', value: '{href}'};
    const tree = {
      type: 'root',
      children: [
        {type: 'html', value: '<td><a href="https://milvus.io/docs/boolean.md">rules</a></td>'},
        {type: 'mdxJsxTextElement', name: 'a', attributes: [{name: 'href', value: 'https://docs.zilliz.com/docs/limits'}], children: []},
        {type: 'mdxJsxTextElement', name: 'a', attributes: [{name: 'href', value: expressionValue}], children: []},
      ],
    };

    remarkRewriteDocLinks({site: 'zh-CN'})(tree, {path: '/repo/content/zh-CN/guides/x.md'});

    expect(tree.children[0].value).toBe('<td><a href="https://milvus.io/docs/zh/boolean.md">rules</a></td>');
    expect(tree.children[1].attributes?.[0].value).toBe('/docs/limits');
    expect(tree.children[2].attributes?.[0].value).toEqual(expressionValue);
  });

  it('keeps English-site builds in the ja-JP locale for i18n files', () => {
    const tree = {
      type: 'root',
      children: [
        {type: 'link', url: 'https://docs.zilliz.com/docs/limits#ingestion', children: []},
        {type: 'link', url: 'https://milvus.io/blog/2022-2-21-compact.md', children: []},
        {type: 'link', url: 'https://example.com/untouched', children: []},
      ],
    };
    const vfile = {path: '/repo/i18n/ja-JP/docusaurus-plugin-content-docs/current/tutorials/hybrid-search.md'};

    remarkRewriteDocLinks({site: 'en'})(tree, vfile);

    expect(tree.children.map(node => node.url)).toEqual([
      '/ja-JP/docs/limits#ingestion',
      'https://milvus.io/ja/blog/2022-2-21-compact.md',
      'https://example.com/untouched',
    ]);
  });

  it('leaves code spans untouched and skips files outside the i18n root on the English site', () => {
    const tree = {
      type: 'root',
      children: [
        {type: 'link', url: 'https://docs.zilliz.com/docs/limits', children: []},
      ],
    };

    remarkRewriteDocLinks({site: 'en'})(tree, {path: '/repo/content/en/guides/quick-start.md'});

    expect(tree.children[0].url).toBe('/docs/limits');
  });
});
