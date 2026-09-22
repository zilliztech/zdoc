import {describe, expect, it} from 'vitest';

import {filterTOCItemsWithoutTargets} from './filterGatedHeadings';

type Item = {id?: string; value: string; children?: readonly Item[]};

describe('filterTOCItemsWithoutTargets', () => {
  it('drops items whose heading anchor is absent, together with their subtree', () => {
    const items: readonly Item[] = [
      {id: 'present-section', value: 'Present section'},
      {
        id: 'gated-section',
        value: 'Gated section',
        children: [{id: 'gated-subsection', value: 'Gated subsection'}],
      },
      {id: 'trailing-section', value: 'Trailing section'},
    ];

    const filtered = filterTOCItemsWithoutTargets(items, id => id !== 'gated-section');

    expect(filtered).toEqual([{id: 'present-section', value: 'Present section'}, {id: 'trailing-section', value: 'Trailing section'}]);
  });

  it('keeps every item when all anchors exist', () => {
    const items: readonly Item[] = [
      {id: 'a', value: 'A', children: [{id: 'a-1', value: 'A.1'}]},
      {id: 'b', value: 'B'},
    ];

    expect(filterTOCItemsWithoutTargets(items, () => true)).toBe(items);
  });

  it('keeps items without an id so unknown TOC shapes fail open to rendering', () => {
    const items: readonly Item[] = [{value: 'No anchor identity'}];

    expect(filterTOCItemsWithoutTargets(items, () => false)).toEqual(items);
  });

  it('passes undefined through', () => {
    expect(filterTOCItemsWithoutTargets(undefined, () => false)).toBeUndefined();
  });
});
