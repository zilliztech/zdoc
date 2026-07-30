import {describe, it, expect} from 'vitest';
import {highlightMatches, groupBySection} from './utils';

describe('highlightMatches', () => {
  it('wraps matching terms in mark tags case-insensitively', () => {
    const result = highlightMatches('vector search', 'How to run a Vector Search');
    expect(result).toBe('How to run a <mark>Vector</mark> <mark>Search</mark>');
  });

  it('returns original text when no matches', () => {
    const result = highlightMatches('python', 'Java SDK guide');
    expect(result).toBe('Java SDK guide');
  });

  it('handles empty query gracefully', () => {
    const result = highlightMatches('', 'Any text');
    expect(result).toBe('Any text');
  });

  it('escapes regex special characters in query', () => {
    const result = highlightMatches('c++', 'Learn c++ today');
    expect(result).toBe('Learn <mark>c++</mark> today');
  });
});

describe('groupBySection', () => {
  it('groups results by section', () => {
    const results = [
      {title: 'A', url: '/a', section: 'Docs'},
      {title: 'B', url: '/b', section: 'Reference'},
      {title: 'C', url: '/c', section: 'Docs'},
    ];
    const grouped = groupBySection(results);
    expect(grouped).toEqual([
      {section: 'Docs', items: [results[0], results[2]]},
      {section: 'Reference', items: [results[1]]},
    ]);
  });

  it('uses "Results" as fallback when section is missing', () => {
    const results = [{title: 'A', url: '/a'}];
    const grouped = groupBySection(results);
    expect(grouped).toEqual([{section: 'Results', items: results}]);
  });
});
