import {useState, useRef, useCallback, useEffect} from 'react';
import type {SearchResult} from './utils';

const DEBOUNCE_MS = 400;

export function useSearch(endpoint: string) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // The query that owns results/loading. A fetch whose query was superseded
  // while in flight must not touch state: its results would briefly replace
  // the newer query's in the UI, and any consumer keying off the settle
  // transition (the search_performed analytics) would read the wrong count.
  const ownerRef = useRef('');

  const doSearch = useCallback(
    (q: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      ownerRef.current = q.trim();
      if (!q.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      debounceRef.current = setTimeout(async () => {
        const term = q.trim();
        try {
          const res = await fetch(`${endpoint}?q=${encodeURIComponent(term)}`);
          if (term !== ownerRef.current) return;
          if (res.ok) {
            const data = (await res.json()) as {results?: SearchResult[]};
            if (term !== ownerRef.current) return;
            setResults(data.results || []);
          } else {
            setResults([]);
          }
        } catch {
          if (term !== ownerRef.current) return;
          setResults([]);
        } finally {
          if (term === ownerRef.current) setLoading(false);
        }
      }, DEBOUNCE_MS);
    },
    [endpoint]
  );

  useEffect(() => {
    doSearch(query);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  return {query, setQuery, results, loading};
}
