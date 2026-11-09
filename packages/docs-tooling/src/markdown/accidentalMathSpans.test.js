const assert = require('node:assert/strict');
const test = require('node:test');
const {
  findAccidentalMathSpans,
  repairAccidentalMathSpans,
} = require('./accidentalMathSpans');

test('prefilter short-circuits pages without any dollar', async () => {
  const clean = await findAccidentalMathSpans('no dollars on this page');
  assert.deepEqual(clean.spans, []);
  const candidate = await findAccidentalMathSpans('price $5 and `$meta`');
  assert.deepEqual(candidate.spans, []);
});

test('detects the production damage shape: dollars paired across code chips', async () => {
  const damaged = [
    '<td><p>Query via <code>$meta</code>: <code>$meta["dynamic_key"]</code></p></td>',
    '<td><p><code>$meta</code> 経由（<code>$meta["dynamic_key"]</code>）でクエリします</p></td>',
  ].join('\n');

  const {spans, compileError} = await findAccidentalMathSpans(damaged);
  assert.equal(compileError, null);
  assert.equal(spans.length, 2);
  assert.equal(spans[0].type, 'inlineMath');
  assert.match(spans[0].value, /^meta<\/code>: <code>$/);
  assert.match(spans[1].value, /^meta<\/code> 経由（<code>$/);
});

test('detects CJK-only accidental spans from translated math text', async () => {
  // Translation can localize the content between a `$` pair; strict=warn
  // flags every non-ASCII character inside such a span.
  const {spans} = await findAccidentalMathSpans('この値は $経由でクエリします$ として表示されます');
  assert.equal(spans.length, 1);
  assert.equal(spans[0].type, 'inlineMath');
  assert.ok(/経由/.test(spans[0].value));
});

test('escaped chips and genuine math stay clean', async () => {
  const clean = [
    '<td><p>Query via <code>\\$meta</code>: <code>\\$meta["dynamic_key"]</code></p></td>',
    'The decay rate $\\lambda$ controls the curve.',
    '$$\nx + y = 1\n$$',
  ].join('\n');

  const {spans, compileError} = await findAccidentalMathSpans(clean);
  assert.equal(compileError, null);
  assert.deepEqual(spans, []);
});

test('frontmatter and fenced code dollars do not grow spans', async () => {
  const source = [
    '---',
    'title: "Pricing | Cloud"',
    'description: "costs $5 per unit"',
    '---',
    '',
    '```bash',
    'export PRICE=$PRICE',
    '```',
  ].join('\n');

  const {spans} = await findAccidentalMathSpans(source);
  assert.deepEqual(spans, []);
});

test('compile failures are reported, not thrown', async () => {
  const broken = '<p>{unclosed</p> costs $5';
  const {spans, compileError} = await findAccidentalMathSpans(broken);
  assert.ok(compileError instanceof Error);
  assert.deepEqual(spans, []);
});

test('KaTeX structural failures mark a span accidental', async () => {
  // Unbalanced braces and unknown macros are what the site renders as red
  // error output; both are repairable by escaping the delimiters.
  const {spans} = await findAccidentalMathSpans('a $x {y$ b and a $\\foobarbaz$ c');
  assert.equal(spans.length, 2);
  assert.deepEqual(spans.map(span => span.value).sort(), ['\\foobarbaz', 'x {y']);
});

test('legitimate equations with spaces and LaTeX markers stay clean', async () => {
  // Real shapes from the tree: spaced equations all carry LaTeX markers, and
  // a span the site engine parses without CJK or JSX remnants is left alone.
  const clean = [
    'The score is $TF(q_i, D)$ over $|D|$ documents.',
    'Cap at $\\max(0, distance - offset)$ per $\\lambda$.',
    'Embed $E_Q = [e_{q_1}, ..., e_{q_m} ]$ from the query.',
    'Plain $x + y$ math parses fine.',
  ].join('\n');
  const {spans} = await findAccidentalMathSpans(clean);
  assert.deepEqual(spans, []);
});

test('repair escapes delimiters in place and re-checks clean', async () => {
  const damaged = '<td><p>via <code>$meta</code>: <code>$meta["dynamic_key"]</code></p></td>';
  const {markdown: repaired, repaired: spans, remaining} = await repairAccidentalMathSpans(damaged);
  assert.equal(remaining.length, 0);
  assert.equal(spans.length, 1);
  assert.equal(
    repaired,
    '<td><p>via <code>\\$meta</code>: <code>\\$meta["dynamic_key"]</code></p></td>',
  );
  const recheck = await findAccidentalMathSpans(repaired);
  assert.deepEqual(recheck.spans, []);
});

test('repair restores damaged display math delimiters', async () => {
  const damaged = '$$\n率 + x\n$$';
  const {markdown: repaired, remaining} = await repairAccidentalMathSpans(damaged);
  assert.equal(remaining.length, 0);
  assert.equal(repaired, '\\$\\$\n率 + x\n\\$\\$');
  const recheck = await findAccidentalMathSpans(repaired);
  assert.deepEqual(recheck.spans, []);
});

test('repair handles chained damage across rounds', async () => {
  // `$a$b$c$` pairs twice in one parse; the second pass catches the survivor.
  const damaged = '$a$<code>b</code>$c$';
  const {markdown: repaired, remaining} = await repairAccidentalMathSpans(damaged);
  assert.equal(remaining.length, 0);
  const recheck = await findAccidentalMathSpans(repaired);
  assert.deepEqual(recheck.spans, []);
});

test('localized \\text content and brace-escaped environments are legitimate', async () => {
  // KaTeX judges these fine once braces are restored the way the site's
  // markdownPolicy does; the old CJK regex would have flagged them.
  const clean = [
    'The score $\\text{スコア}=x$ is localized.',
    'The matrix $\\begin\\{matrix\\} a \\end\\{matrix\\}$ renders.',
    'Chinese prose with $x + y$ math.',
  ].join('\n');
  const {spans} = await findAccidentalMathSpans(clean);
  assert.deepEqual(spans, []);
});

test('span the site renders as red KaTeX output is flagged', async () => {
  // Unclosed brace group: the site engine throws, so the span is accidental
  // even though it carries no CJK and no JSX remnant.
  const {spans} = await findAccidentalMathSpans('a $x {y$ b');
  assert.equal(spans.length, 1);
  assert.equal(spans[0].value, 'x {y');
});

test('repair leaves already-escaped dollars alone', async () => {
  // `\$` inside a formula is inert to remark-math; escaping its delimiters
  // again would mint `\\$` — a literal backslash plus a live delimiter.
  const damaged = '<td><p>via <code>$meta</code>: <code>$meta["dynamic_key"]</code></p></td>\n\nFormula with \\\\$x$ stays.';
  const {markdown: repaired, repaired: spans, remaining} = await repairAccidentalMathSpans(damaged);
  assert.equal(remaining.length, 0);
  assert.ok(spans.every(span => span.value === 'meta</code>: <code>'), JSON.stringify(spans));
  assert.match(repaired, /\\\\\$x\$/);
  const recheck = await findAccidentalMathSpans(repaired);
  assert.deepEqual(recheck.spans, []);
});

test('repair handles trailing whitespace inside a display fence position', async () => {
  const damaged = '$$\n率 + x\n$$   \n\nafter';
  const {markdown: repaired, remaining} = await repairAccidentalMathSpans(damaged);
  assert.equal(remaining.length, 0);
  assert.equal(repaired, '\\$\\$\n率 + x\n\\$\\$   \n\nafter');
  const recheck = await findAccidentalMathSpans(repaired);
  assert.deepEqual(recheck.spans, []);
});

test('repair reports span objects with values for attribution logs', async () => {
  const {repaired: spans} = await repairAccidentalMathSpans('<td><p>a <code>$meta</code>: <code>$meta["k"]</code></p></td>');
  assert.ok(spans.length >= 1);
  assert.ok(typeof spans[0].value === 'string' && spans[0].value.length > 0, JSON.stringify(spans[0]));
});

test('repair falls back to the original text if escaping would grow new math', async () => {
  // Probe17 shape from review: a live delimiter preceded by a backslash could
  // mint `\\$` and a fresh formula; the invariant must roll the repair back.
  const tricky = '$\\\\$ \\times n$\n';
  const result = await repairAccidentalMathSpans(tricky);
  const finalClean = (await findAccidentalMathSpans(result.markdown)).spans.length === 0;
  assert.ok(
    finalClean || (result.markdown === tricky && result.repaired.length === 0),
    'repair output must either be clean or be the untouched original',
  );
});
