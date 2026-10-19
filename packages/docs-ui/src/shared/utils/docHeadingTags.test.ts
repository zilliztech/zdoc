import {describe, expect, it} from 'vitest';

import {stripDocHeadingTag} from './docHeadingTags';

describe('stripDocHeadingTag', () => {
  it('strips every registered heading tag suffix', () => {
    expect(stripDocHeadingTag('Custom privilege groups | PRIVATE')).toBe('Custom privilege groups');
    expect(stripDocHeadingTag('Manage indexes | PUBLIC')).toBe('Manage indexes');
    expect(stripDocHeadingTag('Export dedicated clusters | ON REQUEST')).toBe('Export dedicated clusters');
    expect(stripDocHeadingTag('Legacy backups | NEAR DEPRECATE')).toBe('Legacy backups');
    expect(stripDocHeadingTag('Dedicated clusters | CONTACT SALES')).toBe('Dedicated clusters');
    expect(stripDocHeadingTag('Cluster settings | BYOC')).toBe('Cluster settings');
    expect(stripDocHeadingTag('Legacy endpoint | DEPRECATED')).toBe('Legacy endpoint');
  });

  it('trims trailing whitespace left by the suffix', () => {
    expect(stripDocHeadingTag('Manage indexes | PUBLIC  ')).toBe('Manage indexes');
  });

  it('keeps heading text without a tag suffix unchanged', () => {
    expect(stripDocHeadingTag('Plain heading')).toBe('Plain heading');
  });

  it('leaves pipe-separated text alone when no tag follows the last pipe', () => {
    expect(stripDocHeadingTag('Input | Output')).toBe('Input | Output');
    expect(stripDocHeadingTag('A | B | C')).toBe('A | B | C');
  });
});
