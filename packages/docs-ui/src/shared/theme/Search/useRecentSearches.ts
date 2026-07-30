import {useState, useCallback} from 'react';

const STORAGE_KEY = 'zdoc-recent-searches';
const MAX_RECENT = 5;

function read(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function write(items: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // silently ignore storage errors
  }
}

export function useRecentSearches() {
  const [recent, setRecent] = useState<string[]>(read);

  const add = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setRecent(prev => {
      const next = [trimmed, ...prev.filter(q => q !== trimmed)].slice(0, MAX_RECENT);
      write(next);
      return next;
    });
  }, []);

  const remove = useCallback((query: string) => {
    setRecent(prev => {
      const next = prev.filter(q => q !== query);
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setRecent([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // silently ignore storage errors
    }
  }, []);

  return {recent, add, remove, clear};
}
