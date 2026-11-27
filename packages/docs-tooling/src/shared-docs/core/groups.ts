/** Shared-docs groups the whole pipeline accepts, from the engine gate through
 *  handoff validation to the production Lark lanes. One authority: a group here
 *  must have a seeded `shared-docs/<group>/` overlay, and every consumer below
 *  (adapters, lark scripts, receipt validation) derives its behavior from this
 *  list instead of a local literal. */
export const SHARED_DOC_GROUPS: readonly string[] = Object.freeze(['guides', 'node', 'rust'])
export function isSharedDocGroup(group: string): boolean {
  return SHARED_DOC_GROUPS.includes(group)
}
