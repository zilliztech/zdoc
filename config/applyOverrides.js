'use strict'
const fs = require('node:fs')

// ── Tree helpers ──────────────────────────────────────────────────────────────

function findDocItem(items, id) {
  for (const item of items) {
    if (item.type === 'doc' && item.id === id) return true
    if (item.items && findDocItem(item.items, id)) return true
  }
  return false
}

function findDocItemByLabel(items, label) {
  for (const item of items) {
    if (item.type === 'doc' && item.label === label) return true
    if (item.items && findDocItemByLabel(item.items, label)) return true
  }
  return false
}

function findCategory(items, label) {
  for (const item of items) {
    if (item.type === 'category' && item.label === label) return true
    if (item.items && findCategory(item.items, label)) return true
  }
  return false
}

/** Remove doc item with `id` from tree. Returns [extracted item | null, new tree]. */
function extractItem(items, id) {
  let extracted = null
  const next = []
  for (const item of items) {
    if (item.type === 'doc' && item.id === id) {
      extracted = item
    } else if (item.items) {
      const [found, newChildren] = extractItem(item.items, id)
      if (found) extracted = found
      next.push({ ...item, items: newChildren })
    } else {
      next.push(item)
    }
  }
  return [extracted, next]
}

/** Remove doc item with `label` from tree. Returns [extracted item | null, new tree]. */
function extractItemByLabel(items, label) {
  let extracted = null
  const next = []
  for (const item of items) {
    if (item.type === 'doc' && item.label === label) {
      extracted = item
    } else if (item.items) {
      const [found, newChildren] = extractItemByLabel(item.items, label)
      if (found) extracted = found
      next.push({ ...item, items: newChildren })
    } else {
      next.push(item)
    }
  }
  return [extracted, next]
}

/** Remove category with `label` from tree. Returns [extracted item | null, new tree]. */
function extractCategoryItem(items, label) {
  let extracted = null
  const next = []
  for (const item of items) {
    if (item.type === 'category' && item.label === label) {
      extracted = item
    } else if (item.items) {
      const [found, newChildren] = extractCategoryItem(item.items, label)
      if (found) extracted = found
      next.push({ ...item, items: newChildren })
    } else {
      next.push(item)
    }
  }
  return [extracted, next]
}

function insertBefore(items, targetId, newItem) {
  const next = []
  for (const item of items) {
    if (item.type === 'doc' && item.id === targetId) {
      next.push(newItem, item)
    } else if (item.items) {
      next.push({ ...item, items: insertBefore(item.items, targetId, newItem) })
    } else {
      next.push(item)
    }
  }
  return next
}

function insertAfter(items, targetId, newItem) {
  const next = []
  for (const item of items) {
    if (item.type === 'doc' && item.id === targetId) {
      next.push(item, newItem)
    } else if (item.items) {
      next.push({ ...item, items: insertAfter(item.items, targetId, newItem) })
    } else {
      next.push(item)
    }
  }
  return next
}

/** Insert newItem before/after a category label — top-level only. */
function insertBeforeCategory(items, targetLabel, newItem) {
  const idx = items.findIndex(i => i.type === 'category' && i.label === targetLabel)
  if (idx === -1) return [newItem, ...items]
  const result = [...items]
  result.splice(idx, 0, newItem)
  return result
}

function insertAfterCategory(items, targetLabel, newItem) {
  const idx = items.findIndex(i => i.type === 'category' && i.label === targetLabel)
  if (idx === -1) return [...items, newItem]
  const result = [...items]
  result.splice(idx + 1, 0, newItem)
  return result
}

function insertInto(items, label, newItem, position = 'last', afterSibling = null) {
  return items.map(item => {
    if (item.type === 'category' && item.label === label) {
      const children = item.items ?? []
      let updated
      if (afterSibling) {
        const idx = children.findIndex(c => c.label === afterSibling || c.id === afterSibling)
        if (idx !== -1) {
          updated = [...children.slice(0, idx + 1), newItem, ...children.slice(idx + 1)]
        } else {
          updated = [...children, newItem]  // fallback: append
        }
      } else {
        updated = position === 'first' ? [newItem, ...children] : [...children, newItem]
      }
      return { ...item, items: updated }
    }
    if (item.items) {
      return { ...item, items: insertInto(item.items, label, newItem, position, afterSibling) }
    }
    return item
  })
}

function removeEmptyCategories(items) {
  return items
    .map(item => {
      if (!item.items) return item
      const cleaned = removeEmptyCategories(item.items)
      return { ...item, items: cleaned }
    })
    .filter(item => !item.items || item.items.length > 0 || item.link)
}

/** Recursively promote same-name child docs to category links. */
function promoteSameNameLinks(items) {
  return items.map(item => {
    if (item.type !== 'category' || !item.items) return item
    // Recurse into children first (bottom-up)
    const children = promoteSameNameLinks(item.items)
    // Find a direct child doc whose label matches this category's label
    const matchIdx = children.findIndex(
      c => c.type === 'doc' && c.label === item.label
    )
    if (matchIdx === -1) return { ...item, items: children }
    // Don't override an existing link
    if (item.link) return { ...item, items: children }
    const matchedDoc = children[matchIdx]
    const newChildren = [
      ...children.slice(0, matchIdx),
      ...children.slice(matchIdx + 1),
    ]
    return {
      ...item,
      link: { type: 'doc', id: matchedDoc.id },
      items: newChildren,
    }
  })
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Apply a sidebar override JSON file to a generated sidebar item list.
 *
 * Override JSON supports these keys (processed in this order):
 *   override           — { [docId]: { label?, className?, ... } }
 *   overrideCategories — { [categoryLabel]: { collapsed?, collapsible?, className?, ... } }
 *   linkSameNameChildren — true  (auto-link categories to same-name child docs)
 *   group              — [{ label, categories[], afterDoc? | afterCategory? | beforeCategory? | prepend? | append? }]
 *   moveCategory       — [{ label, into, position? }]
 *   move               — [{ id, before? | after? | into?, position? }]
 *   hide               — [docId, ...]
 *   hideCategories     — [categoryLabel, ...]   (removes top-level categories by label)
 *   hideCategoriesDeep — [categoryLabel, ...]   (removes categories by label at any depth)
 *   flattenCategories  — [categoryLabel, ...]   (replaces top-level category with its children)
 *   inject             — [{ item, prepend? | append? | before? | after? | into?, position? }]
 *   sectionGroupers    — [categoryLabel, ...]  (replaces top-level categories with HTML section labels + promoted children)
 *
 * @param {any[]} items        Raw sidebar items (from generated .sidebar.js)
 * @param {string} overridePath Absolute path to the override JSON file
 * @returns {any[]}            Transformed sidebar items
 */
function applyOverrides(items, overridePath) {
  let overrides
  try {
    overrides = JSON.parse(fs.readFileSync(overridePath, 'utf-8'))
  } catch {
    return removeEmptyCategories(items)
  }

  // 1. override — relabel / restyle doc items by id
  if (overrides.override) {
    const apply = (list) => list.map(item => {
      if (item.type === 'doc' && overrides.override[item.id]) {
        return { ...item, ...overrides.override[item.id] }
      }
      if (item.items) return { ...item, items: apply(item.items) }
      return item
    })
    items = apply(items)
  }

  // 2. overrideCategories — restyle / reconfigure categories by label
  // Supports plain labels (matches anywhere) and scoped paths like "Parent/Label"
  if (overrides.overrideCategories) {
    const apply = (list, parentLabel = null) => list.map(item => {
      if (item.type === 'category') {
        const scopedKey = parentLabel ? `${parentLabel}/${item.label}` : null
        const scoped = scopedKey && overrides.overrideCategories[scopedKey]
        const plain = overrides.overrideCategories[item.label]
        if (scoped || plain) {
          const overridden = { ...item, ...(scoped || plain) }
          return item.items ? { ...overridden, items: apply(item.items, item.label) } : overridden
        }
      }
      if (item.items) return { ...item, items: apply(item.items, item.label) }
      return item
    })
    items = apply(items)
  }

  // 2.5. linkSameNameChildren — promote same-name child docs to category links
  if (overrides.linkSameNameChildren) {
    items = promoteSameNameLinks(items)
  }

  // 3. group — extract existing categories and wrap them under a new parent category
  if (overrides.group && overrides.group.length > 0) {
    for (const grp of overrides.group) {
      const { label, categories, afterDoc, afterCategory, beforeCategory, prepend, append, ...rest } = grp

      // Validate all source categories exist
      let allFound = true
      for (const catLabel of categories) {
        if (!findCategory(items, catLabel)) {
          console.warn(`[applyOverrides] group "${label}": category "${catLabel}" not found — skipping group`)
          allFound = false
          break
        }
      }
      if (!allFound) continue

      // Extract categories in declared order
      const extracted = []
      for (const catLabel of categories) {
        const [cat, remaining] = extractCategoryItem(items, catLabel)
        items = remaining
        if (cat) extracted.push(cat)
      }

      // Build the new wrapper category; spread any extra props (className, collapsed, etc.)
      const newCategory = { type: 'category', label, items: extracted, ...rest }

      // Insert at specified position
      if (prepend) {
        items = [newCategory, ...items]
      } else if (afterDoc) {
        if (!findDocItem(items, afterDoc)) {
          console.warn(`[applyOverrides] group "${label}": afterDoc "${afterDoc}" not found — appending`)
          items = [...items, newCategory]
        } else {
          items = insertAfter(items, afterDoc, newCategory)
        }
      } else if (afterCategory) {
        items = insertAfterCategory(items, afterCategory, newCategory)
      } else if (beforeCategory) {
        items = insertBeforeCategory(items, beforeCategory, newCategory)
      } else {
        items = [...items, newCategory]  // default: append
      }

      items = removeEmptyCategories(items)
    }
  }

  // 4. moveCategory — extract a category by label and insert it into another category or to root
  if (overrides.moveCategory && overrides.moveCategory.length > 0) {
    for (const op of overrides.moveCategory) {
      const { label, into, position, afterSibling, afterDoc, afterCategory, beforeCategory, prepend, append, ...extraProps } = op

      if (!findCategory(items, label)) {
        console.warn(`[applyOverrides] moveCategory: source "${label}" not found — skipping`)
        continue
      }

      // Root-level placement (no `into`)
      if (!into) {
        const [extracted, remaining] = extractCategoryItem(items, label)
        if (!extracted) continue
        const patched = Object.keys(extraProps).length ? { ...extracted, ...extraProps } : extracted
        if (prepend) {
          items = [patched, ...remaining]
        } else if (afterDoc) {
          items = insertAfter(remaining, afterDoc, patched)
        } else if (afterCategory) {
          items = insertAfterCategory(remaining, afterCategory, patched)
        } else if (beforeCategory) {
          items = insertBeforeCategory(remaining, beforeCategory, patched)
        } else {
          items = [...remaining, patched]  // default: append
        }
        items = removeEmptyCategories(items)
        continue
      }

      // Nested placement (into a parent category)
      if (!findCategory(items, into)) {
        console.warn(`[applyOverrides] moveCategory: target "${into}" not found — skipping`)
        continue
      }

      const [extracted, remaining] = extractCategoryItem(items, label)
      if (!extracted) continue
      const patched = Object.keys(extraProps).length ? { ...extracted, ...extraProps } : extracted

      items = insertInto(remaining, into, patched, position ?? 'last', afterSibling ?? null)
      items = removeEmptyCategories(items)
    }
  }

  // 5. move — extract a doc item (by id or label) and reinsert it elsewhere
  if (overrides.move && overrides.move.length > 0) {
    for (const op of overrides.move) {
      const { id, label: srcLabel, before, after, into, position, afterSibling } = op
      const byLabel = !id && !!srcLabel

      // Two-pass validation
      if (byLabel) {
        if (!findDocItemByLabel(items, srcLabel)) {
          console.warn(`[applyOverrides] move: source label "${srcLabel}" not found — skipping`)
          continue
        }
      } else {
        if (!findDocItem(items, id)) {
          console.warn(`[applyOverrides] move: source id "${id}" not found — skipping`)
          continue
        }
      }
      if (before && !findDocItem(items, before)) {
        console.warn(`[applyOverrides] move: before target "${before}" not found — skipping`)
        continue
      }
      if (after && !findDocItem(items, after)) {
        console.warn(`[applyOverrides] move: after target "${after}" not found — skipping`)
        continue
      }
      if (into && !findCategory(items, into)) {
        console.warn(`[applyOverrides] move: category "${into}" not found — skipping`)
        continue
      }

      const [extracted, remaining] = byLabel
        ? extractItemByLabel(items, srcLabel)
        : extractItem(items, id)
      if (!extracted) continue  // shouldn't happen after validation

      const key = byLabel ? srcLabel : id
      if (before) {
        items = insertBefore(remaining, before, extracted)
      } else if (after) {
        items = insertAfter(remaining, after, extracted)
      } else if (into) {
        items = insertInto(remaining, into, extracted, position ?? 'last', afterSibling ?? null)
      } else {
        console.warn(`[applyOverrides] move: no placement directive for "${key}" — appending to root`)
        items = [...remaining, extracted]
      }

      items = removeEmptyCategories(items)
    }
  }

  // 6. hide — filter doc items by id set, recursive
  if (overrides.hide && overrides.hide.length > 0) {
    const hidden = new Set(overrides.hide)
    const filterHidden = (list) => list
      .filter(item => !(item.type === 'doc' && hidden.has(item.id)))
      .map(item => item.items ? { ...item, items: filterHidden(item.items) } : item)
    items = filterHidden(items)
  }

  // 7. hideCategories — remove top-level categories by label
  if (overrides.hideCategories && overrides.hideCategories.length > 0) {
    const hidden = new Set(overrides.hideCategories)
    items = items.filter(item => !(item.type === 'category' && hidden.has(item.label)))
  }

  // 7.5 hideCategoriesDeep — recursively remove categories by label at any depth
  if (overrides.hideCategoriesDeep && overrides.hideCategoriesDeep.length > 0) {
    const hidden = new Set(overrides.hideCategoriesDeep)
    const filterDeep = (list) => list
      .filter(item => !(item.type === 'category' && hidden.has(item.label)))
      .map(item => item.items ? { ...item, items: filterDeep(item.items) } : item)
    items = filterDeep(items)
  }

  // 8. flattenCategories — replace top-level category with its own children
  if (overrides.flattenCategories && overrides.flattenCategories.length > 0) {
    const toFlatten = new Set(overrides.flattenCategories)
    const next = []
    for (const item of items) {
      if (item.type === 'category' && toFlatten.has(item.label)) {
        next.push(...(item.items || []))
      } else {
        next.push(item)
      }
    }
    items = next
  }

  // 9. inject — insert arbitrary items at top level or into a named category
  if (overrides.inject && overrides.inject.length > 0) {
    for (const injection of overrides.inject) {
      if (injection.prepend) { items.unshift(injection.item); continue }
      if (injection.append)  { items.push(injection.item);    continue }
      if (injection.into) {
        if (!findCategory(items, injection.into)) {
          console.warn(`[applyOverrides] inject: category "${injection.into}" not found — skipping`)
          continue
        }
        items = insertInto(items, injection.into, injection.item, injection.position ?? 'last', injection.afterSibling ?? null)
        continue
      }
      if (injection.afterCategory) {
        items = insertAfterCategory(items, injection.afterCategory, injection.item)
        continue
      }
      if (injection.beforeCategory) {
        items = insertBeforeCategory(items, injection.beforeCategory, injection.item)
        continue
      }
      if (injection.after) {
        const idx = items.findIndex(i => i.type === 'doc' && i.id === injection.after)
        if (idx !== -1) items.splice(idx + 1, 0, injection.item)
      }
      if (injection.before) {
        const idx = items.findIndex(i => i.type === 'doc' && i.id === injection.before)
        if (idx !== -1) items.splice(idx, 0, injection.item)
      }
    }
  }

  // 10. sectionGroupers — convert top-level categories into HTML section labels
  //     with their children promoted to the root level
  if (overrides.sectionGroupers && overrides.sectionGroupers.length > 0) {
    const grouperLabels = new Set(overrides.sectionGroupers)
    const next = []
    for (const item of items) {
      if (item.type === 'category' && grouperLabels.has(item.label)) {
        next.push({
          type: 'html',
          value: `<span class='sidebar-section-label'>${item.label}</span>`,
          defaultStyle: false,
          customProps: item.customProps,
        })
        if (item.items && item.items.length > 0) {
          next.push(...item.items)
        }
      } else {
        next.push(item)
      }
    }
    items = next
  }

  return removeEmptyCategories(items)
}

module.exports = applyOverrides
