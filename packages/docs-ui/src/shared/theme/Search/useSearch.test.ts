import {describe, it, expect, vi, beforeEach, afterEach} from 'vitest';
import {renderHook, act, waitFor} from '@testing-library/react';
import {useSearch} from './useSearch';

describe('useSearch', () => {
  beforeEach(() => {
    vi.useFakeTimers({shouldAdvanceTime: true});
  });
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns empty results and not loading for empty query', () => {
    const {result} = renderHook(() => useSearch('https://api.example.com/search'));
    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
  });

  it('debounces fetch by 400ms', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({ok: true, json: () => Promise.resolve({results: []})} as Response)
    );
    const {result} = renderHook(() => useSearch('https://api.example.com/search'));
    act(() => result.current.setQuery('hello'));
    expect(result.current.loading).toBe(true);
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('https://api.example.com/search?q=hello');
  });

  it('normalizes results on success', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({results: [{title: 'T', url: '/u', section: 'Docs', snippet: 's'}]}),
      } as Response)
    );
    const {result} = renderHook(() => useSearch('https://api.example.com/search'));
    act(() => result.current.setQuery('test'));
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() => expect(result.current.results).toHaveLength(1));
    expect(result.current.results[0]).toMatchObject({title: 'T', url: '/u', section: 'Docs', snippet: 's'});
  });

  it('returns empty results on fetch error', async () => {
    global.fetch = vi.fn(() => Promise.reject(new Error('network')));
    const {result} = renderHook(() => useSearch('https://api.example.com/search'));
    act(() => result.current.setQuery('fail'));
    act(() => vi.advanceTimersByTime(400));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.results).toEqual([]);
  });
});
