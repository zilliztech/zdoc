export interface PageContext {
  url?: string;
  content?: string;
}

function absolutePageUrl(pathname: string): string | undefined {
  const path = pathname.replace(/\/+$/, '');
  return path ? `${window.location.origin}${path}` : undefined;
}

export async function fetchPageContext(pathname: string, signal?: AbortSignal): Promise<PageContext> {
  const url = absolutePageUrl(pathname);
  const path = pathname.replace(/\/+$/, '');
  const markdownUrl = path ? `${path}.md` : undefined;

  if (!markdownUrl) return url ? {url} : {};

  try {
    const response = await fetch(markdownUrl, {
      method: 'GET',
      headers: {Accept: 'text/markdown, text/plain'},
      signal,
    });
    if (!response.ok) return url ? {url} : {};

    const content = (await response.text()).trim();
    if (!content || /^<!DOCTYPE|<html[\s>]/i.test(content)) {
      return url ? {url} : {};
    }

    return {url, content};
  } catch {
    return url ? {url} : {};
  }
}

const PAGE_CONTEXT_MAX_AGE_MS = 30_000;

// Each instance belongs to a single mounted provider, route, locale and release channel.
export function createPageContextCache(pathname: string) {
  type Entry = {
    startedAt: number;
    result: Promise<PageContext>;
    prefetch?: AbortController;
    claimed: boolean;
  };
  let entry: Entry | undefined;

  function clear() {
    if (entry && !entry.claimed) entry.prefetch?.abort();
    entry = undefined;
  }

  function current() {
    if (entry && Date.now() - entry.startedAt >= PAGE_CONTEXT_MAX_AGE_MS) clear();
    return entry;
  }

  function start(signal?: AbortSignal) {
    const prefetch = signal ? undefined : new AbortController();
    const next: Entry = {
      startedAt: Date.now(),
      result: fetchPageContext(pathname, signal ?? prefetch?.signal),
      prefetch,
      claimed: !!signal,
    };
    entry = next;
    void next.result.then(page => {
      if (entry === next && !page.content) entry = undefined;
    });
    return next;
  }

  return {
    clear,
    prefetch() {
      if (!current()) start();
      return clear;
    },
    async read(signal: AbortSignal) {
      const item = current() ?? start(signal);
      item.claimed = true;
      const cancel = () => {
        if (entry === item) entry = undefined;
        item.prefetch?.abort();
      };
      signal.addEventListener('abort', cancel, {once: true});
      try {
        const page = await item.result;
        // A speculative failure is never a reason to skip the normal send-time fetch.
        if (!page.content && item.prefetch && !signal.aborted) {
          return (current() ?? start(signal)).result;
        }
        return page;
      } finally {
        signal.removeEventListener('abort', cancel);
      }
    },
  };
}
