export type TOCItemWithChildren = {
  readonly id?: string;
  readonly value?: string;
  readonly children?: readonly TOCItemWithChildren[];
};

/** Drops TOC items whose heading anchor is absent from the rendered document.
 * Block-level channel gates (<NextChannel>) hide headings at runtime while the
 * TOC is generated at build time, so on the channel that hides a section its
 * TOC entries — which would be dead links — are removed after mount. A dropped
 * item takes its whole subtree: gated sections are authored as whole sections,
 * and a visible descendant under a hidden heading must not be re-parented into
 * fabricated TOC hierarchy. */
export function filterTOCItemsWithoutTargets<T extends TOCItemWithChildren>(
  items: readonly T[] | undefined,
  hasTarget: (id: string) => boolean,
): readonly T[] | undefined {
  if (!items) return items;
  const kept = items.filter(item => (typeof item.id === 'string' ? hasTarget(item.id) : true));
  return kept.length === items.length ? items : kept;
}
