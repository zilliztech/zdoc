import type { Component } from './types'

/**
 * Import specifiers the generator may emit for recognized components.
 * Theme components come from `@theme/*`; Cloud-only components use their
 * site-relative component path. Extend this registry to author a new
 * component from transform content files.
 */
export const componentImports: Readonly<Record<Component, string>> = {
  Admonition: '@theme/Admonition',
  Tabs: '@theme/Tabs',
  TabItem: '@theme/TabItem',
  Supademo: '@site/src/components/Supademo',
  Procedures: '@site/src/components/Procedures',
  DocCardList: '@theme/DocCardList',
}

/** Canonical emission order; imports are deduplicated and emitted once. */
export const componentOrder: readonly Component[] = ['Admonition', 'Tabs', 'TabItem', 'Supademo', 'Procedures', 'DocCardList']

/** True when the generator knows how to import this authored component. */
export const isImportableComponent = (name: string): name is Component => name in componentImports

/**
 * Tags the merge pipeline recognises as authored compatibility syntax even
 * though the generator never imports them. Content files may author
 * `NextChannel` gates; the merge preserves compatible gates and rejects
 * nested ones with `MERGE_NESTED_CHANNEL`.
 */
const compatibilityTags = new Set(['NextChannel'])

/** True when a content-file tag is either importable or merge-recognized. */
export const isRecognizedContentTag = (name: string): boolean => isImportableComponent(name) || compatibilityTags.has(name)

/** Recognize the exact generated import line for a registered component. */
export const componentImportLine = (line: string): Component | undefined =>
  componentOrder.find(component => line === `import ${component} from '${componentImports[component]}';`)
