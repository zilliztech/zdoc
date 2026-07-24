import {describe, it, expect, beforeEach} from 'vitest';
import {renderHook, act} from '@testing-library/react';
import {useRecentSearches} from './useRecentSearches';

const STORAGE_KEY = 'zdoc-recent-searches';

describe('useRecentSearches', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('returns empty array initially', () => {
    const {result} = renderHook(() => useRecentSearches());
    expect(result.current.recent).toEqual([]);
  });

  it('adds a search and persists to localStorage', () => {
    const {result} = renderHook(() => useRecentSearches());
    act(() => result.current.add('vector search'));
    expect(result.current.recent).toEqual(['vector search']);
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY)!)).toEqual(['vector search']);
  });

  it('deduplicates and moves recent to front', () => {
    const {result} = renderHook(() => useRecentSearches());
    act(() => result.current.add('first'));
    act(() => result.current.add('second'));
    act(() => result.current.add('first'));
    expect(result.current.recent).toEqual(['first', 'second']);
  });

  it('caps at 5 items', () => {
    const {result} = renderHook(() => useRecentSearches());
    for (let i = 1; i <= 6; i++) {
      act(() => result.current.add(`query ${i}`));
    }
    expect(result.current.recent).toHaveLength(5);
    expect(result.current.recent[0]).toBe('query 6');
  });

  it('removes a single item', () => {
    const {result} = renderHook(() => useRecentSearches());
    act(() => result.current.add('a'));
    act(() => result.current.add('b'));
    act(() => result.current.remove('a'));
    expect(result.current.recent).toEqual(['b']);
  });

  it('clears all items', () => {
    const {result} = renderHook(() => useRecentSearches());
    act(() => result.current.add('a'));
    act(() => result.current.clear());
    expect(result.current.recent).toEqual([]);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });
});
