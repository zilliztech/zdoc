import {describe, expect, it} from 'vitest';

import {containsChannelCodeDirectives, parseChannelCodeDirective, resolveChannelCode} from './channelCode';

describe('parseChannelCodeDirective', () => {
  it('accepts every documented comment style', () => {
    expect(parseChannelCodeDirective('# next-channel-start')).toEqual({channel: 'next', operation: 'start'});
    expect(parseChannelCodeDirective('  // next-channel-end')).toEqual({channel: 'next', operation: 'end'});
    expect(parseChannelCodeDirective('/* current-channel-start */')).toEqual({channel: 'current', operation: 'start'});
    expect(parseChannelCodeDirective('<!-- current-channel-end -->')).toEqual({channel: 'current', operation: 'end'});
    expect(parseChannelCodeDirective('{/* next-channel-next-line */}')).toEqual({channel: 'next', operation: 'next-line'});
    expect(parseChannelCodeDirective('# current-channel-next-line')).toEqual({channel: 'current', operation: 'next-line'});
  });

  it('rejects near misses and unrelated comments', () => {
    expect(parseChannelCodeDirective('# include-start zilliz')).toBeNull();
    expect(parseChannelCodeDirective('# next-channel-start extra')).toBeNull();
    expect(parseChannelCodeDirective('# next-channels-start')).toBeNull();
    expect(parseChannelCodeDirective('next-channel-start')).toBeNull();
    expect(parseChannelCodeDirective('client.create_index() # next-channel')).toBeNull();
  });
});

describe('resolveChannelCode', () => {
  const code = [
    'from pymilvus import MilvusClient',
    '# current-channel-start',
    'client = MilvusClient("http://localhost:19530")',
    '# current-channel-end',
    '# next-channel-start',
    'client = MilvusClient("https://cloud.zilliz.com")',
    '# next-channel-end',
    '# next-channel-next-line',
    'client.flush()',
    'print("done")',
  ].join('\n');

  it('keeps untagged lines and drops next lines for the current channel', () => {
    expect(resolveChannelCode(code, 'current')).toBe(
      [
        'from pymilvus import MilvusClient',
        'client = MilvusClient("http://localhost:19530")',
        'print("done")',
      ].join('\n'),
    );
  });

  it('reveals next lines and drops current lines for the next channel', () => {
    expect(resolveChannelCode(code, 'next')).toBe(
      [
        'from pymilvus import MilvusClient',
        'client = MilvusClient("https://cloud.zilliz.com")',
        'client.flush()',
        'print("done")',
      ].join('\n'),
    );
  });

  it('preserves the trailing newline of fenced code', () => {
    expect(resolveChannelCode('# next-channel-next-line\nstaged()\n', 'current')).toBe('\n');
    expect(resolveChannelCode('# next-channel-next-line\nstaged()\n', 'next')).toBe('staged()\n');
  });

  it('treats indented directive lines inside snippets', () => {
    const indented = [
      'if True:',
      '    # next-channel-start',
      '    new_call()',
      '    # next-channel-end',
      '    # current-channel-start',
      '    old_call()',
      '    # current-channel-end',
    ].join('\n') + '\n';
    expect(resolveChannelCode(indented, 'current')).toBe('if True:\n    old_call()\n');
    expect(resolveChannelCode(indented, 'next')).toBe('if True:\n    new_call()\n');
  });
});

describe('containsChannelCodeDirectives', () => {
  it('is a cheap presence guard', () => {
    expect(containsChannelCodeDirectives('// current-channel-end')).toBe(true);
    expect(containsChannelCodeDirectives('client.flush()')).toBe(false);
  });
});
