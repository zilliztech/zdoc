import {describe, expect, it} from 'vitest';

import {referenceSidebarPaths, validatePathFiltersReferenceSidebars} from './referencePresentation';

describe('reference presentation path-filters drift check', () => {
  it('derives the English reference sidebar paths in nav order', () => {
    expect(referenceSidebarPaths()).toEqual([
      'generated/en/sidebars/python.sidebar.js',
      'generated/en/sidebars/java.sidebar.js',
      'generated/en/sidebars/node.sidebar.js',
      'generated/en/sidebars/go.sidebar.js',
      'generated/en/sidebars/restful.sidebar.js',
      'generated/en/sidebars/cli.sidebar.js',
    ]);
  });

  it('accepts a committed path-filters shape carrying the derived sidebars', () => {
    const expected = referenceSidebarPaths();
    const pathFilters = {
      rules: {
        canonicalEnglishReference: {include: [...expected, 'content/en/reference/**']},
        'siteOwned.en': {exclude: ['generated/en/sidebars/guides.sidebar.js', ...expected]},
      },
    };
    expect(validatePathFiltersReferenceSidebars(pathFilters, expected)).toEqual([]);
  });

  it('reports missing and stale reference sidebars', () => {
    const expected = referenceSidebarPaths();
    const pathFilters = {
      rules: {
        canonicalEnglishReference: {include: expected.slice(0, -1)},
        'siteOwned.en': {exclude: ['generated/en/sidebars/guides.sidebar.js', ...expected, 'generated/en/sidebars/stale.sidebar.js']},
      },
    };
    const problems = validatePathFiltersReferenceSidebars(pathFilters, expected);
    expect(problems.join('\n')).toContain('canonicalEnglishReference.include is missing');
    expect(problems.join('\n')).toContain('siteOwned.en.exclude contains stale generated/en/sidebars/stale.sidebar.js');
  });
});

