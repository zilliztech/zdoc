import {createRequire} from 'node:module';
import {describe, expect, it} from 'vitest';
import {compile} from '@mdx-js/mdx';
import {
  rehypeEmojiMarks,
  rehypeWrapTables,
  remarkDedupeHeadingAnchors,
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
  it('registers the zero-width strip ahead of anchor dedup as before-default plugins on both sites', () => {
    for (const site of ['en', 'zh-CN'] as const) {
      const policy = resolveMarkdownPolicy({remarkPlugins: [], rehypePlugins: []}, site);
      expect(policy.beforeDefaultRemarkPlugins).toEqual([
        remarkStripHeadingZeroWidthChars,
        remarkDedupeHeadingAnchors,
      ]);
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

describe('heading anchor deduplication policy', () => {
  type TestNode = {type?: string; value?: string; children?: TestNode[]};
  const heading = (value: string | undefined, children?: TestNode[]) => ({
    type: 'heading',
    depth: 3,
    children: children ?? [{type: 'text', value}],
  });
  const textOf = (node: TestNode): string =>
    typeof node.value === 'string' ? node.value : (node.children ?? []).map(textOf).join('');
  const values = (tree: {children: TestNode[]}) => tree.children.map(textOf);

  it('suffixes duplicate anchors with the slugger convention and keeps the first bare', () => {
    const tree = {
      type: 'root',
      children: [
        heading('Via RESTful API{#via-restful-api}'),
        heading('Via web console{#via-web-console}'),
        heading('Via RESTful API{#via-restful-api}'),
        heading('Via RESTful API{#via-restful-api}'),
      ],
    };
    remarkDedupeHeadingAnchors()(tree);

    expect(values(tree)).toEqual([
      'Via RESTful API{#via-restful-api}',
      'Via web console{#via-web-console}',
      'Via RESTful API{#via-restful-api-1}',
      'Via RESTful API{#via-restful-api-2}',
    ]);
  });

  it('leaves unique anchors and non-anchor headings byte-identical', () => {
    const tree = {
      type: 'root',
      children: [
        heading('Overview{#overview}'),
        heading('Use `{age}` as a placeholder'),
        heading('Mid-text {#not-an-anchor} mention'),
        heading('Unterminated brace {#open'),
      ],
    };
    const before = JSON.stringify(tree);
    remarkDedupeHeadingAnchors()(tree);

    expect(JSON.stringify(tree)).toBe(before);
  });

  it('never lands a suffix on an explicitly authored suffixed id, in either order', () => {
    const explicitLast = {
      type: 'root',
      children: [heading('A{#a}'), heading('A{#a}'), heading('B{#a-1}')],
    };
    const explicitFirst = {
      type: 'root',
      children: [heading('B{#a-1}'), heading('A{#a}'), heading('A{#a}')],
    };
    remarkDedupeHeadingAnchors()(explicitLast);
    remarkDedupeHeadingAnchors()(explicitFirst);

    expect(values(explicitLast)).toEqual(['A{#a}', 'A{#a-2}', 'B{#a-1}']);
    expect(values(explicitFirst)).toEqual(['B{#a-1}', 'A{#a}', 'A{#a-2}']);
  });

  it('dedupes headings whose anchor follows inline nodes and trims ids like Docusaurus', () => {
    const tree = {
      type: 'root',
      children: [
        heading(undefined, [
          {type: 'emphasis', children: [{type: 'text', value: 'Filtered'}]},
          {type: 'text', value: ' search{# filtered }'},
        ]),
        heading(undefined, [
          {type: 'inlineCode', value: 'filtered_search'},
          {type: 'text', value: '{#filtered}'},
        ]),
      ],
    };
    remarkDedupeHeadingAnchors()(tree);

    // The first occurrence keeps its token verbatim (spaces included); its id
    // is what Docusaurus trims out of it, so the second still suffixes.
    expect(values(tree)).toEqual([
      'Filtered search{# filtered }',
      'filtered_search{#filtered-1}',
    ]);
  });

  it('keeps per-file state per tree even when the same transformer is reused', () => {
    const page = () => ({
      type: 'root',
      children: [heading('Same{#same}'), heading('Same{#same}')],
    });
    const dedupe = remarkDedupeHeadingAnchors();
    const first = page();
    const second = page();
    dedupe(first);
    dedupe(second);

    expect(values(first)).toEqual(['Same{#same}', 'Same{#same-1}']);
    expect(values(second)).toEqual(['Same{#same}', 'Same{#same-1}']);
  });

  it('neither counts nor rewrites anchors that do not sit in a trailing text node', () => {
    // Docusaurus still consumes these shapes, so the wrapped copy keeps the bare
    // id; the plugin stays out of nested nodes rather than risk display text.
    const tree = {
      type: 'root',
      children: [
        heading('Plain tail{#c}'),
        heading(undefined, [{type: 'strong', children: [{type: 'text', value: 'Entirely bold {#c}'}]}]),
        heading('Plain2 tail{#c}'),
        heading(undefined, [{type: 'text', value: 'Code tail '}, {type: 'inlineCode', value: 'probe{#d}'}]),
        heading(undefined, [{type: 'text', value: 'Code tail '}, {type: 'inlineCode', value: 'probe{#d}'}]),
      ],
    };
    const untouched = () => JSON.stringify([tree.children[1], tree.children[3], tree.children[4]]);
    const before = untouched();
    remarkDedupeHeadingAnchors()(tree);

    expect(values(tree)).toEqual([
      'Plain tail{#c}',
      'Entirely bold {#c}',
      'Plain2 tail{#c-1}',
      'Code tail probe{#d}',
      'Code tail probe{#d}',
    ]);
    expect(untouched()).toBe(before);
  });

  it('rewrites only the token Docusaurus consumes when an unbalanced {# precedes it', () => {
    const tree = {
      type: 'root',
      children: [heading('A{#p{#id}'), heading('A{#p{#id}')],
    };
    remarkDedupeHeadingAnchors()(tree);

    expect(values(tree)).toEqual(['A{#p{#id}', 'A{#p{#id-1}']);
  });

  it('yields distinct ids from the real Docusaurus headings plugin, which collide without it', async () => {
    // The headings plugin is a transitive dependency; resolve it through the
    // docs plugin that ships it so the test runs what the site build runs.
    const docsPluginRequire = createRequire(createRequire(import.meta.url).resolve('@docusaurus/plugin-content-docs'));
    const docusaurusHeadings = docsPluginRequire('@docusaurus/mdx-loader/lib/remark/headings').default;
    const source = [
      '### Via RESTful API\\{#via-restful-api}',
      '',
      '### Via web console\\{#via-web-console}',
      '',
      '### Via RESTful API\\{#via-restful-api}',
      '',
      '### Via RESTful API\\{#via-restful-api}',
    ].join('\n');
    const idsOf = (compiled: string) => Array.from(compiled.matchAll(/\bid:\s*"([^"]+)"/g), match => match[1]);
    const policy = resolveMarkdownPolicy({remarkPlugins: [], rehypePlugins: []}, 'en');

    const fixed = String(await compile(source, {
      remarkPlugins: [...policy.beforeDefaultRemarkPlugins, [docusaurusHeadings, {anchorsMaintainCase: false}]],
    }));
    const control = String(await compile(source, {
      remarkPlugins: [[docusaurusHeadings, {anchorsMaintainCase: false}]],
    }));

    expect(idsOf(fixed)).toEqual(['via-restful-api', 'via-web-console', 'via-restful-api-1', 'via-restful-api-2']);
    expect(fixed).not.toContain('{#');
    expect(idsOf(control)).toEqual(['via-restful-api', 'via-web-console', 'via-restful-api', 'via-restful-api']);
  });

  it('compiles escaped writer output so every duplicate anchor carries its own id', async () => {
    const source = [
      '### Via RESTful API\\{#via-restful-api}',
      '',
      '### Via web console\\{#via-web-console}',
      '',
      '### Via RESTful API\\{#via-restful-api}',
    ].join('\n');
    const policy = resolveMarkdownPolicy({remarkPlugins: [], rehypePlugins: []}, 'en');

    const compiled = String(await compile(source, {
      remarkPlugins: policy.beforeDefaultRemarkPlugins,
    }));

    expect(compiled.match(/\{#via-restful-api\}/g)).toHaveLength(1);
    expect(compiled).toContain('{#via-restful-api-1}');
    expect(compiled).toContain('{#via-web-console}');
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
