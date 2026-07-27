import {randomUUID as nodeRandomUUID} from 'node:crypto';
import {appendFileSync, existsSync, lstatSync, readFileSync, realpathSync} from 'node:fs';
import {createRequire} from 'node:module';
import path from 'node:path';

import {assertSafeRepositoryRelativePath, resolveOwnedRepositoryPath} from '../validation/ownership.ts';
import {assertSafeAtomicWriteTargets, writeAtomicRepositoryFiles} from '../validation/atomicFiles.ts';

const require = createRequire(import.meta.url);
const {fetchFeishuJsonWithRetry} = require('../lark/feishuFetch.js');

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

const LEGACY_STATUS = Object.freeze({
  pending: 'waiting',
  running: 'running',
  done: 'completed',
  fail: 'failed',
})

const PHASE_LABELS = Object.freeze({
  produce: 'Produce',
  publish: 'Publish',
  source: 'Publish',
  translate: 'Translate',
  translation: 'Publish translations',
  verify: 'Verify',
})

function elapsedText(startedAt, now = new Date()) {
  const start = Date.parse(startedAt)
  if (Number.isNaN(start)) return 'elapsed time unavailable'
  const seconds = Math.max(0, Math.round((now.getTime() - start) / 1000))
  if (seconds < 60) return `${seconds}s elapsed`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s elapsed`
}

function escapeCardText(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replace(/([\\`*_[\]()])/g, '\\$1')
}

function bounded(value, limit) {
  const text = String(value ?? '').trim()
  return text.length <= limit ? text : `${text.slice(0, Math.max(0, limit - 1))}…`
}

function legacyPhase(name, status, index) {
  const text = String(name || '').trim()
  const count = text.match(/\((\d+)\/(\d+)\)\s*$/)
  const label = count ? text.slice(0, count.index).trim() : text
  return {
    key: `legacy-${index}`,
    label,
    done: count ? Number(count[1]) : LEGACY_STATUS[status] === 'completed' ? 1 : 0,
    total: count ? Number(count[2]) : 1,
    status: LEGACY_STATUS[status] || 'waiting',
  }
}

function legacyManual(manual) {
  if (manual.status) return manual
  const entries = [
    ['produce', manual.produce],
    ['publish', manual.publish || manual.source],
    ['translate', manual.translate],
    ['translation', manual.translation],
  ].map(([phase, status]) => [phase, LEGACY_STATUS[status] || 'waiting'])
  const failed = entries.find(([, status]) => status === 'failed')
  const running = entries.find(([, status]) => status === 'running')
  const waiting = entries.find(([, status]) => status === 'waiting')
  const selected = failed || running || waiting || entries.at(-1)
  return {
    group: manual.group,
    label: manual.label || manual.group,
    phase: selected[0],
    status: failed ? 'failed' : running ? 'running' : waiting ? 'waiting' : 'completed',
    currentTask: manual.currentTask || PHASE_LABELS[selected[0]],
    detail: manual.detail || null,
  }
}

function normalizeCardState(state) {
  if (Array.isArray(state?.phases)) {
    return {
      ...state,
      manuals: Array.isArray(state.manuals) ? state.manuals.map(legacyManual) : [],
      reports: Array.isArray(state.reports)
        ? state.reports
        : (state.notes || []).map(markdown => ({ markdown })),
    }
  }
  const statuses = Array.isArray(state?.statuses) ? state.statuses : []
  const overallStatus = statuses.includes('fail')
    ? 'failure'
    : statuses.length > 0 && statuses.every(status => status === 'done')
      ? 'success'
      : 'running'
  return {
    ...state,
    overallStatus,
    phases: (state?.stages || []).map((name, index) => legacyPhase(name, statuses[index], index)),
    manuals: Array.isArray(state?.manuals) ? state.manuals.map(legacyManual) : [],
    reports: (state?.notes || []).filter(note => typeof note === 'string' && note.trim()).map(markdown => ({ markdown })),
  }
}

function phaseColumn(phase) {
  const presentation = STATUS[phase.status] || STATUS.waiting
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

function phaseRow(phases) {
  return {
    tag: 'column_set',
    flex_mode: 'flow',
    horizontal_spacing: '8px',
    columns: phases.map(phaseColumn),
  }
}

function phaseLabel(phase) {
  return PHASE_LABELS[phase] || bounded(phase, 40) || 'Current phase'
}

function manualBlock(manual) {
  const presentation = STATUS[manual.status] || STATUS.waiting
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

function completedPanel(manuals) {
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

function reportTitle(markdown, index) {
  const heading = String(markdown).match(/^\s*#{1,6}\s+(.+?)\s*$/m)
  return heading ? heading[1].replace(/[*_`]/g, '').trim() : `Report ${index + 1}`
}

function hasPositiveMetric(markdown, names) {
  return names.some(name => new RegExp(`(?:^|\\n)\\s*[-*]?\\s*${name}\\s*:\\s*([1-9]\\d*)`, 'i').test(markdown))
}

function reportNeedsAttention(markdown) {
  const text = String(markdown)
  return hasPositiveMetric(text, ['warnings?', 'errors?', 'failures?', 'broken(?: content)? links?', 'broken references?']) ||
    /^\s*#{1,6}\s+.*\b(?:warning|failed?|error)\b/im.test(text)
}

function reportPanel(report, index) {
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

function buildCardV2(input, options = {}) {
  const state = normalizeCardState(input || {})
  const presentation = OVERALL[state.overallStatus] || OVERALL.running
  const now = options.now || new Date()
  const branch = options.branch || state.targetBranch || process.env.GITHUB_REF_NAME || process.env.GITHUB_HEAD_REF || 'branch unavailable'
  const workflowUrl = options.workflowUrl || (process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : null)
  const elements = []
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


function finishStatuses(stages, success, existingStatuses = null) {
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

function parseNotesJson(value) {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(item => typeof item === 'string' && item.trim())
      .map(item => item.trim())
  } catch (_) {
    return []
  }
}

function appendNotes(state, notes) {
  if (!state.notes) state.notes = []
  for (const note of notes || []) {
    if (typeof note === 'string' && note.trim()) state.notes.push(note.trim())
  }
  return state
}

function buildPhaseState({ messageId, title, stages, stageIndex, status, startedAt, note, targetBranch }) {
  if (!Array.isArray(stages) || stages.length === 0) throw new Error('stages must be a non-empty array')
  if (!Number.isInteger(stageIndex) || stageIndex < 0 || stageIndex >= stages.length) throw new Error('stageIndex is out of range')
  if (!['done', 'fail'].includes(status)) throw new Error('phase status must be done or fail')
  const statuses = stages.map((_, index) => index < stageIndex ? 'done' : 'pending')
  statuses[stageIndex] = status
  const currentIndex = status === 'done' && stageIndex + 1 < stages.length ? stageIndex + 1 : stageIndex
  if (currentIndex !== stageIndex) statuses[currentIndex] = 'running'
  return {
    messageId,
    title: title || 'Build',
    stages,
    statuses,
    currentIndex,
    notes: note && note.trim() ? [note.trim()] : [],
    startedAt: startedAt || new Date().toISOString(),
    targetBranch: targetBranch || undefined,
  }
}

function buildExactState({ messageId, title, startedAt, targetBranch, input }) {
  if (!input || !['running', 'success', 'failure', 'cancelled'].includes(input.overallStatus)) throw new Error('overallStatus is invalid')
  if (!Array.isArray(input.phases)) throw new Error('phases must be an array')
  if (!Array.isArray(input.manuals)) throw new Error('manuals must be an array')
  if (!Array.isArray(input.reports)) throw new Error('reports must be an array')
  const manualStatuses = new Set(['failed', 'running', 'waiting', 'completed', 'cancelled'])
  for (const manual of input.manuals) {
    if (!manual || !manualStatuses.has(manual.status)) throw new Error('manual status is invalid')
  }
  return {
    messageId,
    title: title || input.title || 'Global Docs Build',
    startedAt: startedAt || input.startedAt || new Date().toISOString(),
    targetBranch: targetBranch || input.targetBranch,
    overallStatus: input.overallStatus,
    phases: input.phases,
    manuals: input.manuals,
    reports: input.reports,
  }
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
}) {
  const success = status === 'success' || status === 'done'
  const effectiveStages = stages && stages.length ? stages : [success ? 'Build succeeded' : 'Build failed']
  const matchingState = existingState && (!messageId || existingState.messageId === messageId)
    ? existingState
    : null
  const state = matchingState || {
    messageId,
    title: title || 'Build',
    stages: effectiveStages,
    statuses: finishStatuses(effectiveStages, success),
    currentIndex: 0,
    notes: [],
    startedAt: startedAt || new Date().toISOString(),
    targetBranch: targetBranch || undefined,
  }

  if (matchingState) {
    state.statuses = finishStatuses(state.stages, success, state.statuses)
    if (targetBranch) state.targetBranch = targetBranch
  }

  appendNotes(state, notes)
  return state
}


const CARD_STATE_FILE = '.build-card-state.json';
const DEFAULT_RECEIVE_ID = 'oc_0e36909edb9247c7b6ecb437e99f1d68';

function required(value, label) {
  if (typeof value !== 'string' || !value.trim()) throw new Error(`${label} is required`);
  return value.trim();
}

function safeInput(repositoryRoot, relativePath, label) {
  assertSafeRepositoryRelativePath(relativePath, label);
  const target = resolveOwnedRepositoryPath(repositoryRoot, relativePath, label);
  const root = realpathSync(repositoryRoot);
  let current = root;
  for (const segment of path.relative(root, target).split(path.sep)) {
    current = path.join(current, segment);
    if (!existsSync(current)) throw new Error(`${label} does not exist`);
    if (lstatSync(current).isSymbolicLink()) throw new Error(`${label} must not use symlinks`);
  }
  if (!lstatSync(target).isFile()) throw new Error(`${label} must be a regular file`);
  return target;
}

function statePath(repositoryRoot) {
  return assertSafeAtomicWriteTargets(repositoryRoot, [CARD_STATE_FILE], 'Card state')[0].finalPath;
}

function loadState(repositoryRoot) {
  const target = statePath(repositoryRoot);
  if (!existsSync(target)) return null;
  try { return JSON.parse(readFileSync(target, 'utf8')); } catch { return null; }
}

function saveState(repositoryRoot, state) {
  writeAtomicRepositoryFiles(repositoryRoot, [{path: CARD_STATE_FILE, contents: JSON.stringify(state, null, 2)}], 'Card state');
}

async function defaultTokenProvider(credentials) {
  const data = await fetchFeishuJsonWithRetry(`${credentials.feishuHost}/open-apis/auth/v3/tenant_access_token/internal/`, {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({app_id: credentials.appId, app_secret: credentials.appSecret}),
  }, 'fetch tenant access token');
  if (data?.code !== 0 || typeof data.tenant_access_token !== 'string' || !data.tenant_access_token) {
    throw new Error('Feishu tenant token is unavailable');
  }
  return data.tenant_access_token;
}

export function createCardClient({feishuHost, appId, appSecret, tokenProvider = defaultTokenProvider, requestJson = fetchFeishuJsonWithRetry, now = () => new Date()}) {
  const host = required(feishuHost, 'feishuHost').replace(/\/$/, '');
  const credentials = {appId: required(appId, 'appId'), appSecret: required(appSecret, 'appSecret'), feishuHost: host};
  if (typeof tokenProvider !== 'function') throw new Error('tokenProvider is required');
  if (typeof requestJson !== 'function') throw new Error('requestJson is required');
  return {
    async patch({messageId, state}) {
      const id = required(messageId, 'messageId');
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

function optionsNote(repositoryRoot, options) {
  if (options.noteFile) return readFileSync(safeInput(repositoryRoot, options.noteFile, 'Note file'), 'utf8').trim();
  return typeof options.note === 'string' && options.note.trim() ? options.note.trim() : null;
}

function credentials(environment) {
  return {
    appId: required(environment.APP_ID, 'APP_ID'),
    appSecret: required(environment.APP_SECRET, 'APP_SECRET'),
    feishuHost: required(environment.FEISHU_HOST, 'FEISHU_HOST').replace(/\/$/, ''),
  };
}

export async function executeReportCard(request, dependencies = {}) {
  const {repositoryRoot, action, options = {}, environment = process.env} = request;
  if (!['create', 'advance', 'note', 'finish'].includes(action)) {
    throw new Error('report-card action must be create, advance, note, or finish');
  }
  statePath(repositoryRoot);
  const auth = credentials(environment);
  const tokenProvider = dependencies.tokenProvider || defaultTokenProvider;
  const requestJson = dependencies.requestJson || fetchFeishuJsonWithRetry;
  const now = dependencies.now || (() => new Date());
  const write = dependencies.write || (message => process.stdout.write(`${message}\n`));
  const warn = dependencies.warn || (message => process.stderr.write(`${message}\n`));
  const token = await tokenProvider(auth);
  if (typeof token !== 'string' || !token) throw new Error('Feishu token is unavailable');
  const client = createCardClient({...auth, tokenProvider: async () => token, requestJson, now});
  const noteText = optionsNote(repositoryRoot, options);

  if (action === 'create') {
    const stages = String(options.stages || '').split(',').map(value => value.trim()).filter(Boolean);
    const state = {
      title: options.title || 'Build Progress',
      stages,
      statuses: stages.map((_, index) => index === 0 ? 'running' : 'pending'),
      currentIndex: 0,
      notes: [],
      startedAt: now().toISOString(),
      targetBranch: options.targetBranch || undefined,
    };
    const data = await requestJson(`${auth.feishuHost}/open-apis/im/v1/messages?receive_id_type=chat_id`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json; charset=utf-8', Authorization: `Bearer ${token}`},
      body: JSON.stringify({
        receive_id: options.receiveId || environment.LARK_RECEIVE_ID || DEFAULT_RECEIVE_ID,
        msg_type: 'interactive',
        content: JSON.stringify(buildCardV2(state, {now: now()})),
        uuid: (dependencies.randomUUID || nodeRandomUUID)(),
      }),
    }, 'report-to-lark create card');
    const messageId = data?.data?.message_id;
    if (typeof messageId !== 'string' || !messageId) throw new Error('Feishu card creation did not return a message id');
    state.messageId = messageId;
    saveState(repositoryRoot, state);
    if (environment.GITHUB_OUTPUT) {
      appendFileSync(environment.GITHUB_OUTPUT, `card_id=${messageId}\ncard_started_at=${state.startedAt}\ncard_stages=${stages.join(',')}\ncard_title=${state.title}\n`);
    }
    if (environment.GITHUB_ENV) appendFileSync(environment.GITHUB_ENV, `CARD_MSG_ID=${messageId}\n`);
    write(messageId);
    return state;
  }

  if (action === 'note') {
    const file = required(options.file || options.noteFile, 'note file');
    const state = loadState(repositoryRoot);
    if (!state) { warn('[report-card] no card state - skipping note update'); return null; }
    const note = readFileSync(safeInput(repositoryRoot, file, 'Note file'), 'utf8').trim();
    if (note) state.notes.push(note);
    saveState(repositoryRoot, state);
    await client.patch({messageId: state.messageId, state});
    return state;
  }

  if (action === 'advance' && options.stateFile) {
    const messageId = required(options.messageId, 'message id');
    const input = JSON.parse(readFileSync(safeInput(repositoryRoot, options.stateFile, 'Card state input'), 'utf8'));
    const state = buildExactState({
      messageId,
      title: options.title,
      startedAt: options.startedAt,
      targetBranch: options.targetBranch || input.targetBranch,
      input,
    });
    await client.patch({messageId, state});
    return state;
  }

  if (action === 'advance' && options.messageId && options.stages && (options.stage !== undefined || options.stageIndex !== undefined)) {
    const stages = String(options.stages).split(',').map(value => value.trim()).filter(Boolean);
    const stageIndex = options.stageIndex === undefined ? stages.indexOf(options.stage) : Number(options.stageIndex);
    const state = buildPhaseState({
      messageId: options.messageId,
      title: options.title,
      stages,
      stageIndex,
      status: options.status || 'done',
      startedAt: options.startedAt,
      note: noteText,
      targetBranch: options.targetBranch,
    });
    await client.patch({messageId: options.messageId, state});
    return state;
  }

  if (action === 'advance') {
    const state = loadState(repositoryRoot);
    if (!state) { warn('[report-card] no card state - skipping update'); return null; }
    const status = options.status || 'done';
    state.statuses[state.currentIndex] = status;
    if (noteText) state.notes.push(noteText);
    if (status !== 'fail' && state.currentIndex + 1 < state.stages.length) {
      state.currentIndex += 1;
      state.statuses[state.currentIndex] = 'running';
    }
    saveState(repositoryRoot, state);
    await client.patch({messageId: state.messageId, state});
    return state;
  }

  const messageId = required(options.messageId, 'message id');
  const stages = options.stages ? String(options.stages).split(',').map(value => value.trim()).filter(Boolean) : null;
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
