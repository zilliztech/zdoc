import {describe, expect, it} from 'vitest';

import {toDocusaurusSidebar} from './runtime';

describe('runtime sidebar adaptation', () => {
  it('removes internal translation keys without mutating the publication artifact', () => {
    const published = [{
      type: 'category',
      label: 'Development',
      key: 'category:tutorials/development',
      items: [{
        type: 'doc',
        id: 'tutorials/development/database',
        label: 'Database',
        key: 'doc:tutorials/development/database',
        customProps: {badge: 'new'},
      }],
    }];

    expect(toDocusaurusSidebar(published)).toEqual([{
      type: 'category',
      label: 'Development',
      items: [{
        type: 'doc',
        id: 'tutorials/development/database',
        label: 'Database',
        customProps: {badge: 'new'},
      }],
    }]);
    expect(published[0].key).toBe('category:tutorials/development');
    expect(published[0].items[0].key).toBe('doc:tutorials/development/database');
  });

  it('drops empty categories but preserves empty categories with a landing link', () => {
    expect(toDocusaurusSidebar([
      {type: 'category', label: 'Empty', key: 'category:empty', items: []},
      {type: 'category', label: 'Landing', key: 'category:landing', link: {type: 'doc', id: 'landing'}, items: []},
    ])).toEqual([
      {type: 'category', label: 'Landing', link: {type: 'doc', id: 'landing'}, items: []},
    ]);
  });
});
