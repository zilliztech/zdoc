import {useState, useRef, useCallback, useEffect} from 'react';
import type {SearchResult} from './utils';

const DEBOUNCE_MS = 400;

export function useSearch(endpoint: string) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(
    (q: string) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!q.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      debounceRef.current = setTimeout(async () => {
        try {
          const res = await fetch(`${endpoint}?q=${encodeURIComponent(q.trim())}`);
          if (res.ok) {
            const data = (await res.json()) as {results?: SearchResult[]};
            setResults(data.results || []);
          } else {
            setResults([]);
          }
        } catch {
          setResults([]);
        } finally {
          setLoading(false);
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
