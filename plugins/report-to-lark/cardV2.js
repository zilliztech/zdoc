'use strict'

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

module.exports = { buildCardV2, normalizeCardState, reportNeedsAttention }
