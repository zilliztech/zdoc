// The base zh-CN guides tree carries a thin "工具" slot (a single Zilliz CLI
// link) left over from Lark nav generation. The owned Tools fragment is the
// canonical Tools entry, so drop the thin slot and insert the fragment at the
// Tools position (right before "AI 模型").
const TOOLS_NAV_POSITION = 4;

export function insertToolsSidebarFragment<T>(base: readonly T[], fragment: readonly T[]): T[] {
  const items = base.filter(item => (item as {label?: string})?.label !== '工具');
  items.splice(Math.min(TOOLS_NAV_POSITION, items.length), 0, ...fragment);
  return items;
}
