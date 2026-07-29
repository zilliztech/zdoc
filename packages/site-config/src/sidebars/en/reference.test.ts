import {describe, expect, it} from 'vitest';

import sidebars from './reference';

const names = [
  'pythonSidebar',
  'javaSidebar',
  'nodeSidebar',
  'goSidebar',
  'restfulSidebar',
  'cliSidebar',
] as const;

type SidebarNode = Readonly<{
  type?: string;
  id?: string;
  items?: readonly SidebarNode[];
}>;

function collectDocumentIds(items: readonly SidebarNode[]): string[] {
  return items.flatMap(item => {
    if (item.type === 'doc' && item.id) return [item.id];
    if (item.items) return collectDocumentIds(item.items);
    return [];
  });
}

describe('en reference sidebars', () => {
  it('contains each generated document exactly once after applying overrides', () => {
    for (const name of names) {
      const ids = collectDocumentIds(sidebars[name] as SidebarNode[]);
      const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
      expect(duplicates, name).toEqual([]);
    }
  });
});
