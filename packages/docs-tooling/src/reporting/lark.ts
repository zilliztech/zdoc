import {randomUUID as nodeRandomUUID} from 'node:crypto';
import {appendFileSync, existsSync, lstatSync, readFileSync, realpathSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';

import {assertSafeRepositoryRelativePath, resolveOwnedRepositoryPath} from '../validation/ownership.ts';
import {assertSafeAtomicWriteTargets, writeAtomicRepositoryFiles} from '../validation/atomicFiles.ts';

export type LegacyProgressStatus = 'pending' | 'running' | 'done' | 'fail';
export type PhaseStatus = 'waiting' | 'running' | 'completed' | 'failed' | 'cancelled';
export type ManualStatus = PhaseStatus;
export type OverallStatus = 'running' | 'success' | 'failure' | 'cancelled';
export type PhaseCompletionStatus = 'done' | 'fail';
export type FinishStatus = 'success' | 'done' | 'failure' | 'fail' | 'cancelled';
export type ReportCardAction = 'create' | 'advance' | 'note' | 'finish';

export interface CardPhase {
  key: string;
  label: string;
  done: number;
  total: number;
  status: PhaseStatus;
}

export interface CardManual {
  group: string;
  label: string;
  phase: string;
  status: ManualStatus;
  currentTask: string;
  detail: string | null;
}

export interface CardReport {
  markdown: string;
  title?: string;
  attention?: boolean;
}

export type CardReportInput = string | CardReport;

export interface ExactCardState {
  messageId?: string;
  title: string;
  startedAt: string;
  targetBranch?: string;
  overallStatus: OverallStatus;
  phases: CardPhase[];
  manuals: CardManual[];
  reports: CardReportInput[];
}

export interface PersistedCardState {
  messageId?: string;
  title: string;
  stages: string[];
  statuses: LegacyProgressStatus[];
  currentIndex: number;
  notes: string[];
  startedAt: string;
  targetBranch?: string;
}

export interface PersistedCardStateWithMessage extends PersistedCardState {
  messageId: string;
}

export type StoredCardState = PersistedCardState | ExactCardState;

export interface CardElement {
  tag: string;
  content?: string;
  text_size?: string;
  expanded?: boolean;
  columns?: CardElement[];
  elements?: CardElement[];
  header?: {title: {tag: string; content: string}; [key: string]: unknown};
  border?: {color: string; [key: string]: unknown};
  [key: string]: unknown;
}

export interface CardV2 {
  schema: '2.0';
  config: {wide_screen_mode: true};
  header: {
    title: {tag: 'plain_text'; content: string};
    subtitle: {tag: 'plain_text'; content: string};
    template: string;
    text_tag_list: Array<{tag: 'text_tag'; text: {tag: 'plain_text'; content: string}; color: string}>;
  };
  body: {direction: 'vertical'; padding: string; elements: CardElement[]};
}

export type FeishuCredentials = Readonly<{appId: string; appSecret: string; feishuHost: string}>;
export type FeishuRequestOptions = Readonly<{method: string; headers: Record<string, string>; body: string}>;
export type TokenProvider = (credentials: FeishuCredentials) => Promise<string>;
export type RequestJson = (url: string, options: FeishuRequestOptions, label: string) => Promise<unknown>;

export interface CardClientDependencies extends Partial<FeishuCredentials> {
  tokenProvider?: TokenProvider;
  requestJson?: RequestJson;
  now?: () => Date;
}

export interface ReportCardOptions {
  [key: string]: unknown;
  title?: unknown;
  stages?: unknown;
  targetBranch?: unknown;
  receiveId?: unknown;
  file?: unknown;
  noteFile?: unknown;
  note?: unknown;
  stateFile?: unknown;
  messageId?: unknown;
  startedAt?: unknown;
  stage?: unknown;
  stageIndex?: unknown;
  status?: unknown;
  notesJson?: unknown;
}

export interface ReportCardRequest {
  repositoryRoot: string;
  action: string;
  options?: ReportCardOptions;
  environment?: NodeJS.ProcessEnv;
}

export interface ReportCardDependencies {
  tokenProvider?: TokenProvider;
  requestJson?: RequestJson;
  now?: () => Date;
  write?: (message: string) => void;
  warn?: (message: string) => void;
  randomUUID?: () => string;
}

type NormalizedCardState = ExactCardState;
export type BuildCardOptions = Readonly<{now?: Date; branch?: string; workflowUrl?: string | null}>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function optionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function scalarIdentifier(value: string, label: string): string {
  if (/[\u0000-\u001f\u007f]/u.test(value)) throw new Error(`${label} must not contain control characters`);
  return value;
}

function githubMultilineEntry(name: string, value: string, randomUUID: () => string): string {
  const base = randomUUID();
  const lines = value.split(/\r?\n/u);
  let index = 0;
  let delimiter = `__ZDOC_${base}_${index}__`;
  while (lines.includes(delimiter)) {
    index += 1;
    delimiter = `__ZDOC_${base}_${index}__`;
  }
  return `${name}<<${delimiter}\n${value}\n${delimiter}\n`;
}

function isLegacyProgressStatus(value: unknown): value is LegacyProgressStatus {
  return value === 'pending' || value === 'running' || value === 'done' || value === 'fail';
}

function isPhaseStatus(value: unknown): value is PhaseStatus {
  return value === 'waiting' || value === 'running' || value === 'completed' || value === 'failed' || value === 'cancelled';
}

function isOverallStatus(value: unknown): value is OverallStatus {
  return value === 'running' || value === 'success' || value === 'failure' || value === 'cancelled';
}

function isReportCardAction(value: string): value is ReportCardAction {
  return value === 'create' || value === 'advance' || value === 'note' || value === 'finish';
}

const require = createRequire(import.meta.url);
const feishuFetchModule: unknown = require('../lark/feishuFetch.js');
if (!isRecord(feishuFetchModule) || typeof feishuFetchModule.fetchFeishuJsonWithRetry !== 'function') {
  throw new Error('Feishu request module is unavailable');
}
const fetchFeishuJsonWithRetry = feishuFetchModule.fetchFeishuJsonWithRetry as RequestJson;

const STATUS = Object.freeze({
  waiting: { label: 'Waiting', color: 'grey', icon: '○', background: 'grey-50' },
  running: { label: 'Running', color: 'blue', icon: '◉', background: 'blue-50' },
  completed: { label: 'Done', color: 'green', icon: '✓', background: 'grey-50' },
  failed: { label: 'Failed', color: 'red', icon: '✕', background: 'red-50' },
  cancelled: { label: 'Cancelled', color: 'red', icon: '✕', background: 'red-50' },
})

const OVERALL = Object.freeze({
  running: { template: 'blue', label: 'Running', color: 'blue' },
  success: { template: 'green', label: 'Succeeded', color: 'green' },
  failure: { template: 'red', label: 'Failed', color: 'red' },
  cancelled: { template: 'red', label: 'Cancelled', color: 'red' },
})

const LEGACY_STATUS: Readonly<Record<LegacyProgressStatus, PhaseStatus>> = Object.freeze({
  pending: 'waiting',
  running: 'running',
  done: 'completed',
  fail: 'failed',
})

const PHASE_LABELS: Readonly<Record<string, string>> = Object.freeze({
  produce: 'Produce',
  publish: 'Publish',
  source: 'Publish',
  translate: 'Translate',
  translation: 'Publish translations',
  verify: 'Verify',
})

function elapsedText(startedAt: string, now = new Date()): string {
  const start = Date.parse(startedAt)
  if (Number.isNaN(start)) return 'elapsed time unavailable'
  const seconds = Math.max(0, Math.round((now.getTime() - start) / 1000))
  if (seconds < 60) return `${seconds}s elapsed`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s elapsed`
}

function escapeCardText(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replace(/([\\`*_[\]()])/g, '\\$1')
}

function bounded(value: unknown, limit: number): string {
  const text = String(value ?? '').trim()
  return text.length <= limit ? text : `${text.slice(0, Math.max(0, limit - 1))}…`
}

function legacyPhase(name: unknown, status: LegacyProgressStatus | undefined, index: number): CardPhase {
  const text = String(name || '').trim()
  const count = text.match(/\((\d+)\/(\d+)\)\s*$/)
  const label = count ? text.slice(0, count.index).trim() : text
  return {
    key: `legacy-${index}`,
    label,
    done: count ? Number(count[1]) : status && LEGACY_STATUS[status] === 'completed' ? 1 : 0,
    total: count ? Number(count[2]) : 1,
    status: status ? LEGACY_STATUS[status] : 'waiting',
  }
}

function legacyManual(value: unknown): CardManual {
  const manual = isRecord(value) ? value : {};
  if (isPhaseStatus(manual.status)) {
    return {
      group: optionalString(manual.group) || 'unknown',
      label: optionalString(manual.label) || optionalString(manual.group) || 'Unknown manual',
      phase: optionalString(manual.phase) || 'produce',
      status: manual.status,
      currentTask: optionalString(manual.currentTask) || 'Waiting to start',
      detail: optionalString(manual.detail) || null,
    };
  }
  const entries: Array<[string, PhaseStatus]> = [
    ['produce', isLegacyProgressStatus(manual.produce) ? LEGACY_STATUS[manual.produce] : 'waiting'],
    ['publish', isLegacyProgressStatus(manual.publish) ? LEGACY_STATUS[manual.publish] : isLegacyProgressStatus(manual.source) ? LEGACY_STATUS[manual.source] : 'waiting'],
    ['translate', isLegacyProgressStatus(manual.translate) ? LEGACY_STATUS[manual.translate] : 'waiting'],
    ['translation', isLegacyProgressStatus(manual.translation) ? LEGACY_STATUS[manual.translation] : 'waiting'],
  ]
  const failed = entries.find(([, status]) => status === 'failed')
  const running = entries.find(([, status]) => status === 'running')
  const waiting = entries.find(([, status]) => status === 'waiting')
  const selected = failed || running || waiting || entries.at(-1)
  return {
    group: optionalString(manual.group) || 'unknown',
    label: optionalString(manual.label) || optionalString(manual.group) || 'Unknown manual',
    phase: selected[0],
    status: failed ? 'failed' : running ? 'running' : waiting ? 'waiting' : 'completed',
    currentTask: optionalString(manual.currentTask) || PHASE_LABELS[selected[0]],
    detail: optionalString(manual.detail) || null,
  }
}

function parseCardPhase(value: unknown): CardPhase {
  if (!isRecord(value) || !isPhaseStatus(value.status)) throw new Error('phase status is invalid');
  return {
    key: optionalString(value.key) || 'phase',
    label: optionalString(value.label) || 'Phase',
    done: typeof value.done === 'number' && Number.isFinite(value.done) ? value.done : 0,
    total: typeof value.total === 'number' && Number.isFinite(value.total) ? value.total : 1,
    status: value.status,
  };
}

function parseCardReport(value: unknown): CardReportInput {
  if (typeof value === 'string') return value;
  if (!isRecord(value) || typeof value.markdown !== 'string') throw new Error('report is invalid');
  return {
    markdown: value.markdown,
    ...(optionalString(value.title) ? {title: optionalString(value.title)} : {}),
    ...(typeof value.attention === 'boolean' ? {attention: value.attention} : {}),
  };
}

function normalizeCardState(input: unknown): NormalizedCardState {
  const state = isRecord(input) ? input : {};
  if (Array.isArray(state.phases)) {
    return {
      messageId: optionalString(state.messageId),
      title: optionalString(state.title) || 'Build Progress',
      startedAt: optionalString(state.startedAt) || new Date().toISOString(),
      targetBranch: optionalString(state.targetBranch),
      overallStatus: isOverallStatus(state.overallStatus) ? state.overallStatus : 'running',
      phases: state.phases.map(parseCardPhase),
      manuals: Array.isArray(state.manuals) ? state.manuals.map(legacyManual) : [],
      reports: Array.isArray(state.reports)
        ? state.reports.map(parseCardReport)
        : (Array.isArray(state.notes) ? state.notes : []).filter((note): note is string => typeof note === 'string').map(markdown => ({markdown})),
    }
  }
  const statuses = Array.isArray(state.statuses) ? state.statuses.filter(isLegacyProgressStatus) : []
  const overallStatus = statuses.includes('fail')
    ? 'failure'
    : statuses.length > 0 && statuses.every(status => status === 'done')
      ? 'success'
      : 'running'
  return {
    messageId: optionalString(state.messageId),
    title: optionalString(state.title) || 'Build Progress',
    startedAt: optionalString(state.startedAt) || new Date().toISOString(),
    targetBranch: optionalString(state.targetBranch),
    overallStatus,
    phases: (Array.isArray(state.stages) ? state.stages : []).map((name, index) => legacyPhase(name, statuses[index], index)),
    manuals: Array.isArray(state.manuals) ? state.manuals.map(legacyManual) : [],
    reports: (Array.isArray(state.notes) ? state.notes : []).filter((note): note is string => typeof note === 'string' && Boolean(note.trim())).map(markdown => ({markdown})),
  }
}

function phaseColumn(phase: CardPhase): CardElement {
  const presentation = STATUS[phase.status]
  const progress = Number(phase.total) > 1 ? `\n${Number(phase.done) || 0}/${phase.total}` : ''
  return {
    tag: 'column',
    width: 'weighted',
    weight: 1,
    vertical_align: 'center',
    background_style: presentation.background,
    padding: '8px',
    elements: [{
      tag: 'markdown',
      content: `**${presentation.icon} ${escapeCardText(phase.label)}**${progress}\n<text_tag color='${presentation.color}'>${presentation.label}</text_tag>`,
      text_align: 'center',
      text_size: 'notation',
    }],
  }
}

function phaseRow(phases: CardPhase[]): CardElement {
  return {
    tag: 'column_set',
    flex_mode: 'flow',
    horizontal_spacing: '8px',
    columns: phases.map(phaseColumn),
  }
}

function phaseLabel(phase: string): string {
  return PHASE_LABELS[phase] || bounded(phase, 40) || 'Current phase'
}

function manualBlock(manual: CardManual): CardElement {
  const presentation = STATUS[manual.status]
  const label = escapeCardText(bounded(manual.label || manual.group, 80))
  const task = escapeCardText(bounded(manual.currentTask || 'Waiting to start', 160))
  const detail = manual.detail ? `\n${escapeCardText(bounded(manual.detail, 240))}` : ''
  return {
    tag: 'column_set',
    flex_mode: 'flow',
    columns: [{
      tag: 'column',
      width: 'weighted',
      weight: 1,
      background_style: presentation.background,
      padding: '10px',
      elements: [{
        tag: 'markdown',
        text_size: 'normal',
        content: `**${label} · ${escapeCardText(phaseLabel(manual.phase))}**  <text_tag color='${presentation.color}'>${presentation.label}</text_tag>\n<font color='grey'>CURRENT TASK</font>\n${task}${detail}`,
      }],
    }],
  }
}

function completedPanel(manuals: CardManual[]): CardElement {
  return {
    tag: 'collapsible_panel',
    expanded: false,
    header: {
      title: { tag: 'markdown', content: `**Completed (${manuals.length})**` },
      icon: { tag: 'standard_icon', token: 'down-small-ccm_outlined', size: '16px 16px' },
      icon_position: 'right',
      icon_expanded_angle: -180,
    },
    border: { color: 'grey', corner_radius: '5px' },
    padding: '8px',
    elements: [{
      tag: 'markdown',
      text_size: 'notation',
      content: manuals.map(manual => `- ${escapeCardText(bounded(manual.label || manual.group, 80))} · ${escapeCardText(phaseLabel(manual.phase))}`).join('\n'),
    }],
  }
}

function reportTitle(markdown: string, index: number): string {
  const heading = String(markdown).match(/^\s*#{1,6}\s+(.+?)\s*$/m)
  return heading ? heading[1].replace(/[*_`]/g, '').trim() : `Report ${index + 1}`
}

function hasPositiveMetric(markdown: string, names: string[]): boolean {
  return names.some(name => new RegExp(`(?:^|\\n)\\s*[-*]?\\s*${name}\\s*:\\s*([1-9]\\d*)`, 'i').test(markdown))
}

function reportNeedsAttention(markdown: unknown): boolean {
  const text = String(markdown)
  return hasPositiveMetric(text, ['warnings?', 'errors?', 'failures?', 'broken(?: content)? links?', 'broken references?']) ||
    /^\s*#{1,6}\s+.*\b(?:warning|failed?|error)\b/im.test(text)
}

function reportPanel(report: CardReportInput, index: number): CardElement {
  const markdown = bounded(typeof report === 'string' ? report : report?.markdown, 12000)
  const title = bounded(typeof report === 'object' && report?.title ? report.title : reportTitle(markdown, index), 120)
  const attention = typeof report === 'object' && typeof report?.attention === 'boolean'
    ? report.attention
    : reportNeedsAttention(markdown)
  return {
    tag: 'collapsible_panel',
    expanded: attention,
    header: {
      title: { tag: 'markdown', content: `**${escapeCardText(title)}**` },
      icon: { tag: 'standard_icon', token: 'down-small-ccm_outlined', size: '16px 16px' },
      icon_position: 'right',
      icon_expanded_angle: -180,
    },
    border: { color: attention ? 'red' : 'grey', corner_radius: '5px' },
    padding: '8px',
    elements: [{ tag: 'markdown', content: markdown, text_size: 'normal' }],
  }
}

function buildCardV2(input: unknown, options: BuildCardOptions = {}): CardV2 {
  const state = normalizeCardState(input)
  const presentation = OVERALL[state.overallStatus]
  const now = options.now || new Date()
  const branch = options.branch || state.targetBranch || process.env.GITHUB_REF_NAME || process.env.GITHUB_HEAD_REF || 'branch unavailable'
  const workflowUrl = options.workflowUrl || (process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : null)
  const elements: CardElement[] = []
  if (state.phases.length) elements.push(phaseRow(state.phases.slice(0, 3)))
  if (state.phases.length > 3) elements.push(phaseRow(state.phases.slice(3, 5)))

  const activeManuals = state.manuals.filter(manual => manual.status !== 'completed')
  const completedManuals = state.manuals.filter(manual => manual.status === 'completed')
  elements.push(...activeManuals.map(manualBlock))
  if (completedManuals.length) elements.push(completedPanel(completedManuals))
  for (const [index, report] of state.reports.entries()) elements.push(reportPanel(report, index))
  elements.push({ tag: 'hr' })
  const started = Number.isNaN(Date.parse(state.startedAt)) ? 'unavailable' : new Date(state.startedAt).toUTCString()
  const footer = [
    `Started ${started}`,
    elapsedText(state.startedAt, now),
    `Target ${branch}`,
    workflowUrl ? `[Open workflow](${workflowUrl})` : null,
  ].filter(Boolean).join(' · ')
  elements.push({ tag: 'markdown', content: footer, text_size: 'notation', text_align: 'left' })

  return {
    schema: '2.0',
    config: { wide_screen_mode: true },
    header: {
      title: { tag: 'plain_text', content: state.title || 'Build Progress' },
      subtitle: { tag: 'plain_text', content: `${branch} · ${elapsedText(state.startedAt, now)}` },
      template: presentation.template,
      text_tag_list: [{ tag: 'text_tag', text: { tag: 'plain_text', content: presentation.label }, color: presentation.color }],
    },
    body: {
      direction: 'vertical',
      padding: '12px 12px 12px 12px',
      elements,
    },
  }
}


function finishStatuses(
  stages: readonly string[],
  success: boolean,
  existingStatuses: readonly LegacyProgressStatus[] | null = null,
): LegacyProgressStatus[] {
  if (success) return stages.map(() => 'done')

  if (existingStatuses) {
    const failedIndex = existingStatuses.findIndex(s => s === 'running' || s === 'pending')
    if (failedIndex === -1) {
      return existingStatuses.map((s, i) => i === existingStatuses.length - 1 ? 'fail' : s)
    }
    return existingStatuses.map((s, i) => i === failedIndex ? 'fail' : s)
  }

  return stages.map((_, i) => i === 0 ? 'fail' : 'pending')
}

function parseNotesJson(value: unknown): string[] {
  if (typeof value !== 'string' || !value) return []
  try {
    const parsed: unknown = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(item => typeof item === 'string' && item.trim())
      .map(item => item.trim())
  } catch (_) {
    return []
  }
}

function appendNotes<T extends {notes: string[]}>(state: T, notes: readonly unknown[]): T {
  for (const note of notes) {
    if (typeof note === 'string' && note.trim()) state.notes.push(note.trim())
  }
  return state
}

export type BuildPhaseStateOptions = Readonly<{
  messageId?: unknown;
  title?: unknown;
  stages: readonly string[];
  stageIndex: number;
  status: unknown;
  startedAt?: unknown;
  note?: unknown;
  targetBranch?: unknown;
}>;

function phaseCompletionStatus(value: unknown): PhaseCompletionStatus {
  if (typeof value === 'string') scalarIdentifier(value, 'phase status');
  if (value !== 'done' && value !== 'fail') throw new Error('phase status must be done or fail');
  return value;
}

function buildPhaseState({messageId, title, stages, stageIndex, status: rawStatus, startedAt, note, targetBranch}: BuildPhaseStateOptions): PersistedCardState {
  if (!Array.isArray(stages) || stages.length === 0) throw new Error('stages must be a non-empty array')
  if (!Number.isInteger(stageIndex) || stageIndex < 0 || stageIndex >= stages.length) throw new Error('stageIndex is out of range')
  const status = phaseCompletionStatus(rawStatus)
  const statuses: LegacyProgressStatus[] = stages.map((_, index) => index < stageIndex ? 'done' : 'pending')
  statuses[stageIndex] = status
  const currentIndex = status === 'done' && stageIndex + 1 < stages.length ? stageIndex + 1 : stageIndex
  if (currentIndex !== stageIndex) statuses[currentIndex] = 'running'
  return {
    messageId: optionalString(messageId),
    title: optionalString(title) || 'Build',
    stages: [...stages],
    statuses,
    currentIndex,
    notes: optionalString(note) ? [optionalString(note)!] : [],
    startedAt: optionalString(startedAt) || new Date().toISOString(),
    targetBranch: optionalString(targetBranch),
  }
}

export type BuildExactStateOptions = Readonly<{
  messageId?: unknown;
  title?: unknown;
  startedAt?: unknown;
  targetBranch?: unknown;
  input: unknown;
}>;

function parseExactManual(value: unknown): CardManual {
  if (!isRecord(value) || !isPhaseStatus(value.status)) throw new Error('manual status is invalid');
  return {
    group: optionalString(value.group) || 'unknown',
    label: optionalString(value.label) || optionalString(value.group) || 'Unknown manual',
    phase: optionalString(value.phase) || 'produce',
    status: value.status,
    currentTask: optionalString(value.currentTask) || 'Waiting to start',
    detail: optionalString(value.detail) || null,
  };
}

function buildExactState({messageId, title, startedAt, targetBranch, input}: BuildExactStateOptions): ExactCardState {
  if (!isRecord(input) || !isOverallStatus(input.overallStatus)) throw new Error('overallStatus is invalid')
  if (!Array.isArray(input.phases)) throw new Error('phases must be an array')
  if (!Array.isArray(input.manuals)) throw new Error('manuals must be an array')
  if (!Array.isArray(input.reports)) throw new Error('reports must be an array')
  const phases = input.phases.map(parseCardPhase);
  const manuals = input.manuals.map(parseExactManual);
  const reports = input.reports.map(parseCardReport);
  const effectiveStartedAt = optionalString(startedAt) || optionalString(input.startedAt);
  if (!effectiveStartedAt) throw new Error('startedAt is required for exact card state');
  return {
    messageId: optionalString(messageId),
    title: optionalString(title) || optionalString(input.title) || 'Global Docs Build',
    startedAt: effectiveStartedAt,
    targetBranch: optionalString(targetBranch) || optionalString(input.targetBranch),
    overallStatus: input.overallStatus,
    phases,
    manuals,
    reports,
  }
}

export type BuildFinishStateOptions = Readonly<{
  existingState: PersistedCardState | null;
  messageId?: unknown;
  title?: unknown;
  stages?: readonly string[] | null;
  status?: unknown;
  startedAt?: unknown;
  notes?: readonly unknown[];
  targetBranch?: unknown;
}>;

function finishStatus(value: unknown): FinishStatus {
  if (value === undefined) return 'failure';
  if (value === 'success' || value === 'done' || value === 'failure' || value === 'fail' || value === 'cancelled') return value;
  throw new Error('finish status must be success, done, failure, fail, or cancelled');
}

function buildFinishState({
  existingState,
  messageId,
  title,
  stages,
  status,
  startedAt,
  notes = [],
  targetBranch,
}: BuildFinishStateOptions): PersistedCardState {
  const parsedStatus = finishStatus(status)
  const success = parsedStatus === 'success' || parsedStatus === 'done'
  const effectiveStages = stages && stages.length ? stages : [success ? 'Build succeeded' : 'Build failed']
  const parsedMessageId = optionalString(messageId)
  const matchingState = existingState && (!parsedMessageId || existingState.messageId === parsedMessageId)
    ? existingState
    : null
  const state: PersistedCardState = matchingState ? {
    ...matchingState,
    stages: [...matchingState.stages],
    statuses: [...matchingState.statuses],
    notes: [...matchingState.notes],
  } : {
    messageId: parsedMessageId,
    title: optionalString(title) || 'Build',
    stages: [...effectiveStages],
    statuses: finishStatuses(effectiveStages, success),
    currentIndex: 0,
    notes: [],
    startedAt: optionalString(startedAt) || new Date().toISOString(),
    targetBranch: optionalString(targetBranch),
  }

  if (matchingState) {
    state.statuses = finishStatuses(state.stages, success, state.statuses)
    const branch = optionalString(targetBranch)
    if (branch) state.targetBranch = branch
  }

  appendNotes(state, notes)
  return state
}


const CARD_STATE_FILE = '.build-card-state.json';
const DEFAULT_RECEIVE_ID = 'oc_0e36909edb9247c7b6ecb437e99f1d68';

function required(value: unknown, label: string): string {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required`);
  return value.trim();
}

function safeInput(repositoryRoot: string, relativePath: string, label: string): string {
  assertSafeRepositoryRelativePath(relativePath, label);
  const root = realpathSync(repositoryRoot);
  const target = resolveOwnedRepositoryPath(root, relativePath, label);
  let current = root;
  for (const segment of path.relative(root, target).split(path.sep)) {
    current = path.join(current, segment);
    if (!existsSync(current)) throw new Error(`${label} does not exist`);
    if (lstatSync(current).isSymbolicLink()) throw new Error(`${label} must not use symlinks`);
  }
  if (!lstatSync(target).isFile()) throw new Error(`${label} must be a regular file`);
  return target;
}

function statePath(repositoryRoot: string): string {
  return assertSafeAtomicWriteTargets(repositoryRoot, [CARD_STATE_FILE], 'Card state')[0].finalPath;
}

function parsePersistedCardState(value: unknown): PersistedCardState {
  if (!isRecord(value)) throw new Error('Card state must be an object');
  if (!Array.isArray(value.stages) || value.stages.some(stage => typeof stage !== 'string')) throw new Error('Card state stages are invalid');
  if (!Array.isArray(value.statuses) || value.statuses.some(status => !isLegacyProgressStatus(status))) throw new Error('Card state statuses are invalid');
  if (typeof value.currentIndex !== 'number' || !Number.isInteger(value.currentIndex) || value.currentIndex < 0) throw new Error('Card state currentIndex is invalid');
  if (!Array.isArray(value.notes) || value.notes.some(note => typeof note !== 'string')) throw new Error('Card state notes are invalid');
  if (value.statuses.length !== value.stages.length) throw new Error('Card state stage/status lengths do not match');
  if ((value.stages.length === 0 && value.currentIndex !== 0) || (value.stages.length > 0 && value.currentIndex >= value.stages.length)) {
    throw new Error('Card state currentIndex is out of range');
  }
  return {
    messageId: optionalString(value.messageId),
    title: required(value.title, 'Card state title'),
    stages: [...value.stages],
    statuses: [...value.statuses] as LegacyProgressStatus[],
    currentIndex: value.currentIndex,
    notes: [...value.notes] as string[],
    startedAt: required(value.startedAt, 'Card state startedAt'),
    targetBranch: optionalString(value.targetBranch),
  };
}

function loadState(repositoryRoot: string): PersistedCardState | null {
  const target = statePath(repositoryRoot);
  if (!existsSync(target)) return null;
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(target, 'utf8')) as unknown;
  } catch (error) {
    throw new Error('Card state is not valid JSON', {cause: error});
  }
  return parsePersistedCardState(parsed);
}

function saveState(repositoryRoot: string, state: StoredCardState): void {
  writeAtomicRepositoryFiles(repositoryRoot, [{path: CARD_STATE_FILE, contents: JSON.stringify(state, null, 2)}], 'Card state');
}

function responseMessageId(value: unknown): string | undefined {
  if (!isRecord(value) || !isRecord(value.data)) return undefined;
  const messageId = value.data.message_id;
  if (typeof messageId !== 'string' || !messageId.trim()) return undefined;
  scalarIdentifier(messageId, 'Feishu message id');
  return messageId.trim();
}

async function defaultTokenProvider(credentials: FeishuCredentials): Promise<string> {
  const data = await fetchFeishuJsonWithRetry(`${credentials.feishuHost}/open-apis/auth/v3/tenant_access_token/internal/`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({app_id: credentials.appId, app_secret: credentials.appSecret}),
  }, 'fetch tenant access token');
  if (!isRecord(data) || data.code !== 0 || typeof data.tenant_access_token !== 'string' || !data.tenant_access_token) {
    throw new Error('Feishu tenant token is unavailable');
  }
  return data.tenant_access_token;
}

export function createCardClient({feishuHost, appId, appSecret, tokenProvider = defaultTokenProvider, requestJson = fetchFeishuJsonWithRetry, now = () => new Date()}: CardClientDependencies) {
  const host = required(feishuHost, 'feishuHost').replace(/\/$/, '');
  const credentials = {appId: required(appId, 'appId'), appSecret: required(appSecret, 'appSecret'), feishuHost: host};
  if (typeof tokenProvider !== 'function') throw new Error('tokenProvider is required');
  if (typeof requestJson !== 'function') throw new Error('requestJson is required');
  return {
    async patch({messageId, state}: {messageId: unknown; state: unknown}): Promise<unknown> {
      const id = scalarIdentifier(required(messageId, 'messageId'), 'messageId');
      const token = await tokenProvider(credentials);
      if (typeof token !== 'string' || !token) throw new Error('Feishu token is unavailable');
      return requestJson(`${host}/open-apis/im/v1/messages/${encodeURIComponent(id)}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json; charset=utf-8', Authorization: `Bearer ${token}`},
        body: JSON.stringify({content: JSON.stringify(buildCardV2(state, {now: now()}))}),
      }, 'report-to-lark patch card');
    },
  };
}

function optionsNote(repositoryRoot: string, options: ReportCardOptions): string | null {
  const noteFile = optionalString(options.noteFile);
  if (noteFile) return readFileSync(safeInput(repositoryRoot, noteFile, 'Note file'), 'utf8').trim();
  return typeof options.note === 'string' && options.note.trim() ? options.note.trim() : null;
}

function credentials(environment: NodeJS.ProcessEnv): FeishuCredentials {
  return {
    appId: required(environment.APP_ID, 'APP_ID'),
    appSecret: required(environment.APP_SECRET, 'APP_SECRET'),
    feishuHost: required(environment.FEISHU_HOST, 'FEISHU_HOST').replace(/\/$/, ''),
  };
}

function commaSeparatedStrings(value: unknown): string[] {
  if (value === undefined || value === null || value === false) return [];
  return String(value).split(',').map(item => item.trim()).filter(Boolean);
}

function requireStateMessageId(state: PersistedCardState): asserts state is PersistedCardStateWithMessage {
  if (!state.messageId) throw new Error('Card state message id is required');
  scalarIdentifier(state.messageId, 'Card state message id');
}

export type ReportCardResult = PersistedCardState | PersistedCardStateWithMessage | ExactCardState | null;

export interface ReportCardActionResults {
  create: PersistedCardStateWithMessage;
  advance: PersistedCardState | ExactCardState | null;
  note: PersistedCardStateWithMessage | null;
  finish: PersistedCardState;
}

export function executeReportCard(
  request: ReportCardRequest & {action: 'create'},
  dependencies?: ReportCardDependencies,
): Promise<PersistedCardStateWithMessage>;
export function executeReportCard(
  request: ReportCardRequest,
  dependencies?: ReportCardDependencies,
): Promise<ReportCardResult>;

export async function executeReportCard(
  request: ReportCardRequest,
  dependencies: ReportCardDependencies = {},
): Promise<ReportCardResult> {
  const {repositoryRoot, action, options = {}, environment = process.env} = request;
  if (!isReportCardAction(action)) {
    throw new Error('report-card action must be create, advance, note, or finish');
  }
  statePath(repositoryRoot);
  const auth = credentials(environment);
  const tokenProvider = dependencies.tokenProvider || defaultTokenProvider;
  const requestJson = dependencies.requestJson || fetchFeishuJsonWithRetry;
  const now = dependencies.now || (() => new Date());
  const write = dependencies.write || (message => process.stdout.write(`${message}\n`));
  const warn = dependencies.warn || (message => process.stderr.write(`${message}\n`));
  const randomUUID = dependencies.randomUUID || nodeRandomUUID;
  const token = await tokenProvider(auth);
  if (typeof token !== 'string' || !token) throw new Error('Feishu token is unavailable');
  const client = createCardClient({...auth, tokenProvider: async () => token, requestJson, now});
  const noteText = optionsNote(repositoryRoot, options);

  if (action === 'create') {
    const stages = commaSeparatedStrings(options.stages);
    const state: PersistedCardState = {
      title: optionalString(options.title) || 'Build Progress',
      stages,
      statuses: stages.map<LegacyProgressStatus>((_, index) => index === 0 ? 'running' : 'pending'),
      currentIndex: 0,
      notes: [],
      startedAt: now().toISOString(),
      targetBranch: optionalString(options.targetBranch),
    };
    const data = await requestJson(`${auth.feishuHost}/open-apis/im/v1/messages?receive_id_type=chat_id`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json; charset=utf-8', Authorization: `Bearer ${token}`},
      body: JSON.stringify({
        receive_id: optionalString(options.receiveId) || environment.LARK_RECEIVE_ID || DEFAULT_RECEIVE_ID,
        msg_type: 'interactive',
        content: JSON.stringify(buildCardV2(state, {now: now()})),
        uuid: randomUUID(),
      }),
    }, 'report-to-lark create card');
    const messageId = responseMessageId(data);
    if (!messageId) throw new Error('Feishu card creation did not return a message id');
    const createdState: PersistedCardStateWithMessage = {...state, messageId};
    saveState(repositoryRoot, createdState);
    if (environment.GITHUB_OUTPUT) {
      appendFileSync(environment.GITHUB_OUTPUT, `card_id=${messageId}\ncard_started_at=${scalarIdentifier(createdState.startedAt, 'Card startedAt')}\n`);
      appendFileSync(environment.GITHUB_OUTPUT, githubMultilineEntry('card_stages', stages.join(','), randomUUID));
      appendFileSync(environment.GITHUB_OUTPUT, githubMultilineEntry('card_title', createdState.title, randomUUID));
    }
    if (environment.GITHUB_ENV) appendFileSync(environment.GITHUB_ENV, `CARD_MSG_ID=${messageId}\n`);
    write(messageId);
    return createdState;
  }

  if (action === 'note') {
    const file = required(optionalString(options.file) || optionalString(options.noteFile), 'note file');
    const state = loadState(repositoryRoot);
    if (!state) { warn('[report-card] no card state - skipping note update'); return null; }
    requireStateMessageId(state);
    const note = readFileSync(safeInput(repositoryRoot, file, 'Note file'), 'utf8').trim();
    const nextState: PersistedCardStateWithMessage = {
      ...state,
      stages: [...state.stages],
      statuses: [...state.statuses],
      notes: note ? [...state.notes, note] : [...state.notes],
    };
    await client.patch({messageId: nextState.messageId, state: nextState});
    saveState(repositoryRoot, nextState);
    return nextState;
  }

  const stateFile = optionalString(options.stateFile);
  if (action === 'advance' && stateFile) {
    const messageId = required(options.messageId, 'message id');
    const input: unknown = JSON.parse(readFileSync(safeInput(repositoryRoot, stateFile, 'Card state input'), 'utf8'));
    const state = buildExactState({
      messageId,
      title: options.title,
      startedAt: options.startedAt,
      targetBranch: optionalString(options.targetBranch) || (isRecord(input) ? optionalString(input.targetBranch) : undefined),
      input,
    });
    await client.patch({messageId, state});
    saveState(repositoryRoot, state);
    return state;
  }

  const explicitMessageId = optionalString(options.messageId);
  const explicitStages = commaSeparatedStrings(options.stages);
  if (action === 'advance' && explicitMessageId && explicitStages.length > 0 && (options.stage !== undefined || options.stageIndex !== undefined)) {
    const selectedStage = optionalString(options.stage);
    if (selectedStage) scalarIdentifier(selectedStage, 'stage');
    const stageIndex = options.stageIndex === undefined ? explicitStages.indexOf(selectedStage || '') : Number(options.stageIndex);
    const state = buildPhaseState({
      messageId: explicitMessageId,
      title: options.title,
      stages: explicitStages,
      stageIndex,
      status: options.status || 'done',
      startedAt: options.startedAt,
      note: noteText,
      targetBranch: options.targetBranch,
    });
    await client.patch({messageId: explicitMessageId, state});
    saveState(repositoryRoot, state);
    return state;
  }

  if (action === 'advance') {
    const state = loadState(repositoryRoot);
    if (!state) { warn('[report-card] no card state - skipping update'); return null; }
    requireStateMessageId(state);
    const status = phaseCompletionStatus(options.status ?? 'done');
    const statuses = [...state.statuses];
    const notes = noteText ? [...state.notes, noteText] : [...state.notes];
    let currentIndex = state.currentIndex;
    statuses[currentIndex] = status;
    if (status !== 'fail' && currentIndex + 1 < state.stages.length) {
      currentIndex += 1;
      statuses[currentIndex] = 'running';
    }
    const nextState: PersistedCardStateWithMessage = {
      ...state,
      stages: [...state.stages],
      statuses,
      currentIndex,
      notes,
    };
    await client.patch({messageId: nextState.messageId, state: nextState});
    saveState(repositoryRoot, nextState);
    return nextState;
  }

  const messageId = required(options.messageId, 'message id');
  const parsedStages = commaSeparatedStrings(options.stages);
  const stages = parsedStages.length > 0 ? parsedStages : null;
  const notes = parseNotesJson(options.notesJson);
  if (noteText) notes.push(noteText);
  const state = buildFinishState({
    existingState: loadState(repositoryRoot),
    messageId,
    title: options.title || 'Build',
    stages,
    status: options.status,
    startedAt: options.startedAt,
    notes,
    targetBranch: options.targetBranch,
  });
  await client.patch({messageId, state});
  saveState(repositoryRoot, state);
  return state;
}

export {
  appendNotes,
  buildCardV2,
  buildExactState,
  buildFinishState,
  buildPhaseState,
  finishStatuses,
  normalizeCardState,
  parseNotesJson,
  reportNeedsAttention,
};
