'use strict'

const STATUS = {
  pending: { label: 'Pending', color: 'grey', icon: '○' },
  running: { label: 'Running', color: 'blue', icon: '◉' },
  done: { label: 'Done', color: 'green', icon: '✓' },
  fail: { label: 'Failed', color: 'red', icon: '✕' },
}

function elapsedText(startedAt, now = new Date()) {
  const start = Date.parse(startedAt)
  if (Number.isNaN(start)) return 'elapsed time unavailable'
  const seconds = Math.max(0, Math.round((now.getTime() - start) / 1000))
  if (seconds < 60) return `${seconds}s elapsed`
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s elapsed`
}

function overallPresentation(statuses) {
  if (statuses.includes('fail')) return { template: 'red', label: 'Failed', color: 'red' }
  if (statuses.length > 0 && statuses.every(status => status === 'done')) return { template: 'green', label: 'Succeeded', color: 'green' }
  return { template: 'blue', label: 'Running', color: 'blue' }
}

function phaseColumn(name, status) {
  const presentation = STATUS[status] || STATUS.pending
  return {
    tag: 'column',
    width: 'weighted',
    weight: 1,
    vertical_align: 'center',
    background_style: status === 'fail' ? 'red-50' : status === 'done' ? 'green-50' : status === 'running' ? 'blue-50' : 'grey-50',
    padding: '8px',
    elements: [{
      tag: 'markdown',
      content: `**${presentation.icon} ${name}**\n<text_tag color='${presentation.color}'>${presentation.label}</text_tag>`,
      text_align: 'center',
      text_size: 'notation',
    }],
  }
}

function statusOption(status) {
  const presentation = STATUS[status] || STATUS.pending
  return [{ text: presentation.label, color: presentation.color }]
}

function manualTable(manuals) {
  return {
    tag: 'table',
    page_size: Math.min(10, Math.max(1, manuals.length)),
    row_height: 'auto',
    freeze_first_column: true,
    header_style: {
      text_align: 'left',
      text_size: 'normal',
      background_style: 'none',
      text_color: 'grey',
      bold: true,
      lines: 1,
    },
    columns: [
      { name: 'manual', display_name: 'Manual', data_type: 'text', width: 'auto' },
      { name: 'produce', display_name: 'Produce', data_type: 'options', width: 'auto' },
      { name: 'source', display_name: 'Source', data_type: 'options', width: 'auto' },
      { name: 'translate', display_name: 'Translate', data_type: 'options', width: 'auto' },
      { name: 'translation', display_name: 'Translation', data_type: 'options', width: 'auto' },
    ],
    rows: manuals.map(manual => ({
      manual: manual.group,
      produce: statusOption(manual.produce),
      source: statusOption(manual.source),
      translate: statusOption(manual.translate),
      translation: statusOption(manual.translation),
    })),
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

function reportPanel(markdown, index) {
  return {
    tag: 'collapsible_panel',
    expanded: reportNeedsAttention(markdown),
    header: {
      title: { tag: 'markdown', content: `**${reportTitle(markdown, index)}**` },
      icon: { tag: 'standard_icon', token: 'down-small-ccm_outlined', size: '16px 16px' },
      icon_position: 'right',
      icon_expanded_angle: -180,
    },
    border: { color: 'grey', corner_radius: '5px' },
    padding: '8px',
    elements: [{ tag: 'markdown', content: markdown, text_size: 'normal' }],
  }
}

function buildCardV2(state, options = {}) {
  const statuses = Array.isArray(state.statuses) ? state.statuses : []
  const presentation = overallPresentation(statuses)
  const now = options.now || new Date()
  const branch = options.branch || state.targetBranch || process.env.GITHUB_REF_NAME || process.env.GITHUB_HEAD_REF || 'branch unavailable'
  const workflowUrl = options.workflowUrl || (process.env.GITHUB_SERVER_URL && process.env.GITHUB_REPOSITORY && process.env.GITHUB_RUN_ID
    ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}`
    : null)
  const elements = [{
    tag: 'column_set',
    flex_mode: 'flow',
    horizontal_spacing: '8px',
    columns: (state.stages || []).map((name, index) => phaseColumn(name, statuses[index])),
  }]

  if (Array.isArray(state.manuals) && state.manuals.length) elements.push(manualTable(state.manuals))
  for (const [index, note] of (state.notes || []).entries()) elements.push(reportPanel(note, index))
  elements.push({ tag: 'hr' })
  const footer = [
    `Started ${new Date(state.startedAt).toUTCString()}`,
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

module.exports = { buildCardV2, reportNeedsAttention }
