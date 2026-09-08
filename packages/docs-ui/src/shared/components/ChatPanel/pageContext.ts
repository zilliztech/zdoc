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

    return {content};
  } catch {
    return url ? {url} : {};
  }
}
