export interface SearchResult {
  title: string;
  url: string;
  section?: string;
  snippet?: string;
}

export function highlightMatches(query: string, text: string): string {
  if (!query.trim() || !text) return text;
  const terms = query.trim().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return text;
  const pattern = new RegExp(
    `(${terms.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`,
    'gi'
  );
  return text.replace(pattern, '<mark>$1</mark>');
}

export interface SectionGroup {
  section: string;
  items: SearchResult[];
}

export function groupBySection(results: SearchResult[]): SectionGroup[] {
  const map = new Map<string, SearchResult[]>();
  for (const item of results) {
    const section = item.section || 'Results';
    if (!map.has(section)) map.set(section, []);
    map.get(section)!.push(item);
  }
  return Array.from(map.entries()).map(([section, items]) => ({section, items}));
}
