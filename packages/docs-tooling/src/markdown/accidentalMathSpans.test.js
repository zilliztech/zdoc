const assert = require('node:assert/strict');
const test = require('node:test');
const {
  findAccidentalMathSpans,
  repairAccidentalMathSpans,
  looksAccidentalMathValue,
  mightContainMathDelimiters,
} = require('./accidentalMathSpans');

test('prefilter short-circuits pages without any dollar', () => {
  assert.equal(mightContainMathDelimiters('no dollars on this page'), false);
  assert.equal(mightContainMathDelimiters('price $5 and `$meta`'), true);
  assert.equal(mightContainMathDelimiters(null), false);
});

test('accident signature matches swallowed JSX tags or CJK content', () => {
  assert.equal(looksAccidentalMathValue('meta</code>: <code>'), true);
  assert.equal(looksAccidentalMathValue('経由でクエリします：'), true);
  assert.equal(looksAccidentalMathValue('x + y'), false);
  assert.equal(looksAccidentalMathValue('\\lambda'), false);
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
