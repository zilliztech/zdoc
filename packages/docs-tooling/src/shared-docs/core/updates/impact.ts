import { codeGroupAt, fencesIn, markdownLines } from '../blocks'
import { alignBlocks, segmentMarkdown } from '../merge'
import type { MergeBlock } from '../merge'
import { analyzeAnchorRelations, promotionEligibility } from './anchors'
import { computeUpdateUnits, referencesPage } from './units'
import { immutable, imageIdentity } from './types'
import type { AdoptionDependency, BlockContext, ChangedBlock, ChangedInput, ComparisonAxis, ImpactComparison, ImpactReport, PageObservation, UpdateInput } from './types'

const sha = /^[0-9a-f]{40}$/
const digest = /^[0-9a-f]{64}$/
function unique(values: readonly string[], label: string) {
  if (values.some(value => !value) || new Set(values).size !== values.length) throw new Error(`Missing or duplicate ${label} identity`)
}
export function validateUpdateInput(input: UpdateInput): void {
  if (input.schema_version !== 1) throw new Error('Unsupported update input schema_version')
  for (const name of ['master', 'dev'] as const) if (!sha.test(input.versions?.[name])) throw new Error(`Missing or invalid ${name} identity`)
  if (!input.versions.tools || !Object.keys(input.versions.tools).length || Object.values(input.versions.tools).some(value => !value)) throw new Error('Missing tool versions')
  unique(input.pages.map(page => page.pageId), 'page')
  for (const page of input.pages) for (const role of ['oldNext', 'current', 'candidateNext'] as const) {
    const observation = page[role]
    if (!observation || !sha.test(observation.commit)) throw new Error(`Missing or invalid ${role} identity for ${page.pageId}`)
    if (observation.buildLock && (!sha.test(observation.buildLock.current) || !sha.test(observation.buildLock.next))) throw new Error('Invalid observed build lock identity')
    if (observation.outputStatus === 'observed' && (!observation.buildLock || !observation.engine?.name || !observation.engine.version)) throw new Error('Missing build or engine identity')
    if (!observation.repository || !observation.track || !observation.sourceFile) throw new Error(`Missing ${role} source identity`)
    if (!['observed', 'unobserved', 'error'].includes(observation.outputStatus)) throw new Error(`Missing ${role} output status`)
    unique(observation.localInputs.map(file => file.file), `${role} local input`)
    if (!observation.localInputs.length || observation.localInputs.some(file => !digest.test(file.sha256))) throw new Error('Missing local input digests')
    unique(observation.files.map(file => file.file), `${role} source file`)
    if (observation.files.some(file => !digest.test(file.sha256))) throw new Error('Missing source file digests')
    if (observation.source && (observation.source.file !== observation.sourceFile || !digest.test(observation.source.sha256))) throw new Error('Invalid source evidence')
    if (!observation.source && observation.outputStatus !== 'error') throw new Error('Missing source must be an error')
    unique(observation.dependencies.map(dependency => JSON.stringify([dependency.kind, dependency.identity])), `${role} dependency`)
    if (observation.dependencies.some(dependency => !dependency.identity || (dependency.state === 'resolved' ? !digest.test(dependency.sha256 ?? '') : dependency.state !== 'unresolved' || dependency.sha256 !== null))) throw new Error('Invalid dependency evidence')
    if (!Array.isArray(observation.rawErrors)) throw new Error('Missing raw dependency diagnostics')
    if (!['observed', 'unavailable'].includes(observation.imageStatus)) throw new Error('Missing image evidence status')
    unique(observation.images.map(imageIdentity), `${role} image`)
    for (const image of observation.images) {
      if (!image.original || !digest.test(image.emitted.sha256) || !image.emitted.address || !image.uses.length) throw new Error('Incomplete used image evidence')
      if (image.observed && (!digest.test(image.observed.sha256) || !Number.isSafeInteger(image.observed.bytes) || image.observed.bytes < 0)) throw new Error('Invalid observed image bytes')
      if (image.origin.kind === 'repository' ? !sha.test(image.origin.commit) || image.origin.commit !== observation.commit || !image.origin.path
        : image.origin.kind === 'external' ? image.origin.uri !== image.original || image.origin.policy !== 'paired-read'
          : image.origin.kind !== 'unavailable' || !image.origin.reason) throw new Error('Invalid image origin evidence')
      for (const use of image.uses) if (use.commit !== observation.commit || use.reference.url !== image.original || !observation.targets.some(target => target.manual === use.manual && target.path === use.path)) throw new Error('Image use does not belong to its fixed page observation')
    }
    unique(observation.targets.map(target => JSON.stringify([target.manual, target.path])), `${role} publish target`)
    if (!observation.targets.length || observation.targets.some(target => !target.manual || !target.path)) throw new Error('Incomplete publish target identities')
    unique(observation.manuals.map(manual => JSON.stringify([manual.manual, manual.path])), `${role} manual`)
    if (observation.outputStatus === 'observed' && (observation.manuals.length !== observation.targets.length || observation.errors.length || observation.manuals.some(manual => manual.output === undefined || !observation.targets.some(target => target.manual === manual.manual && target.path === manual.path)))) throw new Error('Observed output requires complete error-free manual evidence')
    if (observation.outputStatus === 'error' && !observation.errors.length) throw new Error('Error output requires diagnostics')
    if (observation.manuals.some(manual => !manual.manual || !manual.path)) throw new Error('Incomplete manual identity')
  }
}
function changedInputs(before: PageObservation, after: PageObservation): ChangedInput[] {
  const result: ChangedInput[] = []
  if (before.source?.sha256 !== after.source?.sha256 || before.sourceFile !== after.sourceFile) result.push({ kind: 'source', identity: after.sourceFile,
    before: before.source?.sha256 ?? null, after: after.source?.sha256 ?? null, beforeState: before.source ? 'resolved' : 'absent', afterState: after.source ? 'resolved' : 'absent' })
  const key = (dependency: PageObservation['dependencies'][number]) => JSON.stringify([dependency.kind, dependency.identity])
  const old = new Map(before.dependencies.map(dependency => [key(dependency), dependency]))
  const next = new Map(after.dependencies.map(dependency => [key(dependency), dependency]))
  for (const id of [...new Set([...old.keys(), ...next.keys()])].sort()) {
    const from = old.get(id), to = next.get(id)
    if (from?.state !== to?.state || from?.sha256 !== to?.sha256) result.push({ kind: (to ?? from)!.kind, identity: (to ?? from)!.identity, before: from?.sha256 ?? null, after: to?.sha256 ?? null, beforeState: from?.state ?? 'absent', afterState: to?.state ?? 'absent' })
  }
  if (before.imageStatus === 'observed' && after.imageStatus === 'observed') {
    const oldImages = new Map(before.images.map(image => [imageIdentity(image), image]))
    const newImages = new Map(after.images.map(image => [imageIdentity(image), image]))
    for (const key of [...new Set([...oldImages.keys(), ...newImages.keys()])].sort()) {
      const from = oldImages.get(key), to = newImages.get(key)
      if (!from || !to || from.observed?.sha256 !== to.observed?.sha256 || from.emitted.sha256 !== to.emitted.sha256 || from.emitted.address !== to.emitted.address) {
        const image = (to ?? from)!
        result.push({ kind: 'image', identity: image.origin.kind === 'repository' ? image.origin.path : image.original,
          before: from?.observed?.sha256 ?? null, after: to?.observed?.sha256 ?? null,
          beforeState: !from ? 'absent' : from.observed ? 'resolved' : 'unresolved', afterState: !to ? 'absent' : to.observed ? 'resolved' : 'unresolved',
          image: { before: from ?? null, after: to ?? null } })
      }
    }
  }
  return result
}
function changedBlocks(before: PageObservation, after: PageObservation): ChangedBlock[] {
  const context = (observation: PageObservation, startLine: number, endLine: number): BlockContext | undefined => {
    if (!observation.source) return undefined
    const lines = markdownLines(observation.source.text)
    const parsed = segmentMarkdown({ markdown: observation.source.text })
    const neighbors = 'document' in parsed ? parsed.document.blocks.filter(block => ['paragraph', 'heading', 'list', 'table', 'blockquote'].includes(block.kind)) : []
    return { file: observation.sourceFile, startLine, endLine, text: lines.slice(startLine - 1, endLine - 1).join('\n'),
      contextBefore: neighbors.filter(block => block.span.endLine <= startLine).slice(-3).map(block => block.text).join('\n'),
      contextAfter: neighbors.find(block => block.span.startLine >= endLine)?.text ?? '' }
  }
  const result: ChangedBlock[] = []
  const old = new Map(before.blocks.map(block => [block.id, block])), next = new Map(after.blocks.map(block => [block.id, block]))
  for (const id of [...new Set([...old.keys(), ...next.keys()])].sort()) {
    const from = old.get(id), to = next.get(id)
    const a = from && context(before, from.startLine, from.endLine + 1), b = to && context(after, to.startLine, to.endLine + 1)
    if (a?.text !== b?.text) result.push({ id, type: (to ?? from)!.type, ...(a ? { before: a } : {}), ...(b ? { after: b } : {}) })
  }
  const a = segmentMarkdown({ markdown: before.source?.text ?? '' }), b = segmentMarkdown({ markdown: after.source?.text ?? '' })
  if ('document' in a && 'document' in b) {
    const outside = (observation: PageObservation, start: number, end: number) => !observation.blocks.some(block => start >= block.startLine && end <= block.endLine + 1)
    const grouped = (observation: PageObservation, blocks: MergeBlock[]): MergeBlock[] => {
      if (!observation.source) return []
      const text = observation.source.text, lines = markdownLines(text), fences = fencesIn(text, lines)
      const offsets = [0, ...[...text.matchAll(/\r\n|\r|\n/g)].map(match => match.index! + match[0].length)]
      const groups: MergeBlock[] = []
      for (let line = 0; line < lines.length; line++) {
        const group = codeGroupAt(lines, fences, line)
        if (!group) continue
        const start = offsets[line], end = offsets[group.end + 1] ?? text.length
        groups.push({ kind: 'tabs', text: text.slice(start, end), span: { start, end, startLine: line + 1, endLine: group.end + 2 }, origins: [] })
        line = group.end
      }
      return [...blocks.filter(block => !groups.some(group => block.span.start < group.span.end && block.span.end > group.span.start)), ...groups]
        .sort((a, b) => a.span.start - b.span.start).filter(block => outside(observation, block.span.startLine, block.span.endLine))
    }
    const from = grouped(before, a.document.blocks)
    const to = grouped(after, b.document.blocks)
    for (const aligned of alignBlocks(from, to)) {
      if (aligned.kind !== 'change') continue
      const count = Math.max(aligned.current.length, aligned.next.length)
      for (let i = 0; i < count; i++) {
        const oldBlock = from[aligned.current[i]], newBlock = to[aligned.next[i]]
        const oldContext = oldBlock && context(before, oldBlock.span.startLine, oldBlock.span.endLine)
        const newContext = newBlock && context(after, newBlock.span.startLine, newBlock.span.endLine)
        result.push({ id: `source:${oldBlock?.span.startLine ?? '-'}:${newBlock?.span.startLine ?? '-'}`, type: ['fence', 'tabs'].includes((newBlock ?? oldBlock).kind) ? 'code-group' : 'markdown',
          ...(oldContext ? { before: oldContext } : {}), ...(newContext ? { after: newContext } : {}) })
      }
    }
  }
  return result
}
function compare(before: PageObservation, after: PageObservation, axis: ComparisonAxis): ImpactComparison {
  const changes = changedInputs(before, after)
  const old = new Map(before.manuals.map(manual => [JSON.stringify([manual.manual, manual.path]), manual]))
  const next = new Map(after.manuals.map(manual => [JSON.stringify([manual.manual, manual.path]), manual]))
  const observed = before.outputStatus === 'observed' && after.outputStatus === 'observed'
  const complete = old.size === next.size && [...old.keys()].every(key => next.has(key))
  const outputChanged = !observed || !complete ? 'unknown' : [...old.keys()].some(key => old.get(key)!.output !== next.get(key)!.output)
  return { axis, from: before.commit, to: after.commit, candidate: changes.length > 0, outputChanged,
    changes, blocks: [...changedBlocks(before, after), ...changes.filter(change => change.kind === 'fragment').flatMap(change => {
      const from = before.files.find(file => file.file === change.identity) ?? null
      const to = after.files.find(file => file.file === change.identity) ?? null
      return changedBlocks({ ...before, sourceFile: change.identity, source: from, blocks: [] }, { ...after, sourceFile: change.identity, source: to, blocks: [] })
    })], anchors: observed ? [...old.keys()].sort().flatMap(key => next.has(key) ? analyzeAnchorRelations({ axis, before: old.get(key)!, after: next.get(key)! }) : []) : [] }
}
export function analyzeUpdates(input: UpdateInput): ImpactReport {
  validateUpdateInput(input)
  const snapshot = structuredClone(input)
  const pages = [...snapshot.pages].sort((a, b) => a.pageId.localeCompare(b.pageId)).map(page => ({ pageId: page.pageId,
    sourceImpact: compare(page.oldNext, page.candidateNext, 'old-next-to-target'),
    promotion: { ...compare(page.current, page.candidateNext, 'current-to-candidate-next'), ...promotionEligibility({ currentCommit: page.current.commit,
      candidateCommit: page.candidateNext.commit, hasChannelRules: page.current.hasChannelRules || page.candidateNext.hasChannelRules }) },
    errors: [...new Map([page.oldNext, page.current, page.candidateNext].flatMap(observation => observation.errors).map(error => [JSON.stringify(error), error])).values()],
    rawErrors: [...new Map([page.oldNext, page.current, page.candidateNext].flatMap(observation => observation.rawErrors).map(error => [JSON.stringify(error), error])).values()] }))
  const identities = snapshot.pages.flatMap(page => page.candidateNext.targets.map(target => ({ pageId: page.pageId, ...target })))
  const dependencies: AdoptionDependency[] = []
  for (const target of pages) for (const relation of target.promotion.anchors) {
    if (relation.status !== 'confirmed' || relation.kind !== 'renamed' || !relation.after) continue
    const to = { pageId: target.pageId, manual: relation.manual, path: relation.path }
    for (const source of snapshot.pages) for (const manual of source.candidateNext.manuals) {
      if (source.pageId === target.pageId) continue
      const from = { pageId: source.pageId, manual: manual.manual, path: manual.path }
      for (const reference of manual.references) if (reference.url.split('#')[1] === relation.after.anchor && referencesPage(from, to, reference.url)) {
        dependencies.push({ from, to, evidence: { axis: 'current-to-candidate-next', relation, reference } })
      }
    }
  }
  for (const dependency of snapshot.adoptionDependencies ?? []) {
    const relation = pages.find(page => page.pageId === dependency.to.pageId)?.promotion.anchors.find(relation => JSON.stringify(relation) === JSON.stringify(dependency.evidence.relation))
    const reference = snapshot.pages.find(page => page.pageId === dependency.from.pageId)?.candidateNext.manuals.find(manual => manual.manual === dependency.from.manual && manual.path === dependency.from.path)?.references.find(reference => JSON.stringify(reference) === JSON.stringify(dependency.evidence.reference))
    if (!relation || !reference) throw new Error('Adoption evidence is not present in fixed page observations')
    dependencies.push(dependency)
  }
  const units = computeUpdateUnits({ pages: identities, dependencies, existingUnits: snapshot.existingUnits })
  return immutable({ schema_version: 1 as const, input: snapshot, pages, units })
}
export function renderImpactJson(report: ImpactReport): string { return JSON.stringify(report, null, 2) + '\n' }
export function renderImpactMarkdown(report: ImpactReport): string {
  const code = (value: string) => '`' + value.replace(/`/g, '\\`').replace(/[\r\n]/g, ' ') + '`'
  const lines = ['# Shared documentation impact report', '', `Schema: ${report.schema_version}`, `Master: ${code(report.input.versions.master)}`, `Dev: ${code(report.input.versions.dev)}`, '']
  for (const page of report.pages) {
    lines.push(`## ${page.pageId}`, '')
    for (const comparison of [page.sourceImpact, page.promotion]) {
      lines.push(`### ${comparison.axis}`, '', `${code(comparison.from)} → ${code(comparison.to)}`, '',
        `Candidate: ${comparison.candidate}; output changed: ${comparison.outputChanged}.`, '')
      for (const change of comparison.changes) lines.push(`- ${change.kind}: ${code(change.identity)} (${change.before ?? change.beforeState} → ${change.after ?? change.afterState}) [${change.beforeState} → ${change.afterState}]`)
      for (const block of comparison.blocks) for (const side of ['before', 'after'] as const) {
        const context = block[side]
        if (!context) continue
        lines.push('', `${block.type} ${code(block.id)} ${side}, ${code(context.file)}:${context.startLine}–${context.endLine - 1}`, '')
        // Indentation preserves arbitrary source fences without inventing delimiters.
        lines.push(...[context.contextBefore, context.text, context.contextAfter].filter(Boolean).join('\n\n').split('\n').map(line => `    ${line}`))
      }
      for (const relation of comparison.anchors) lines.push('', `- ${relation.manual}: ${relation.status} ${relation.kind} ${code(relation.before?.anchor ?? '')} → ${code(relation.after?.anchor ?? '')}: ${relation.reason}`)
      lines.push('')
    }
    const fixedPage = report.input.pages.find(fixed => fixed.pageId === page.pageId)!
    for (const role of ['oldNext', 'current', 'candidateNext'] as const) {
      const observation = fixedPage[role]
      lines.push(`Image evidence (${role}): ${observation.imageStatus}.`, '')
      for (const image of observation.images) {
        const origin = image.origin.kind === 'repository' ? `${image.origin.commit}:${image.origin.path}` : image.origin.kind === 'external' ? `${image.origin.uri} (${image.origin.policy})` : `unavailable: ${image.origin.reason}`
        lines.push(`- image ${code(image.original)}; origin ${code(origin)}; observed ${image.observed ? `${image.observed.sha256} (${image.observed.bytes} bytes)` : 'unavailable'}; emitted ${image.emitted.sha256} at ${code(image.emitted.address)}; uses: ${image.uses.length}`)
      }
      lines.push('')
    }
    for (const error of page.rawErrors) lines.push(`- Raw diagnostic ${error.code}: ${code(error.file ?? 'unlocated')}${error.line === undefined ? '' : `:${error.line}`} — ${error.message}`)
    lines.push(`Promotion eligible: ${page.promotion.eligible}; reasons: ${page.promotion.reasons.join(', ') || 'none'}.`, '')
    for (const error of page.errors) lines.push(`- ${error.code}: ${code(error.file ?? 'unlocated')}${error.line === undefined ? '' : `:${error.line}`} — ${error.message}`)
    lines.push('')
  }
  lines.push('## Adoption units', '')
  for (const unit of report.units) lines.push(`- ${code(unit.id)}`)
  return lines.join('\n').trimEnd() + '\n'
}
