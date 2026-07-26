type RuntimeSidebarItem = string | Record<string, unknown>;

function adaptItem(item: RuntimeSidebarItem): RuntimeSidebarItem | null {
  if (typeof item === 'string') return item;
  const {key: _internalTranslationKey, items, ...runtimeItem} = item;
  if (!Array.isArray(items)) return runtimeItem;
  const runtimeItems = items
    .map(child => adaptItem(child as RuntimeSidebarItem))
    .filter((child): child is RuntimeSidebarItem => child !== null);
  if (runtimeItem.type === 'category' && runtimeItems.length === 0 && !runtimeItem.link) return null;
  return {...runtimeItem, items: runtimeItems};
}

export function toDocusaurusSidebar(items: readonly RuntimeSidebarItem[]): RuntimeSidebarItem[] {
  return items.map(adaptItem).filter((item): item is RuntimeSidebarItem => item !== null);
}
