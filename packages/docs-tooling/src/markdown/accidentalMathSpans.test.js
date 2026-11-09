const assert = require('node:assert/strict');
const test = require('node:test');
const {
  findAccidentalMathSpans,
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
