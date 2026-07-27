const TOOLS_NAV_POSITION = 5;

export function insertToolsSidebarFragment<T>(base: readonly T[], fragment: readonly T[]): T[] {
  const items = [...base];
  items.splice(Math.min(TOOLS_NAV_POSITION, items.length), 0, ...fragment);
  return items;
}
