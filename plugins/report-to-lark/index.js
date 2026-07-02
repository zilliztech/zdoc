const path = require('node:path')
const fs = require('node:fs')
const { v4: uuidv4 } = require('uuid')
const tokenFetcher = require('../lark-docs/larkTokenFetcher')
const { fetchFeishuJsonWithRetry } = require('../lark-docs/feishuFetch')
require('dotenv/config')

// ---------------------------------------------------------------------------
// Build-progress card helpers
// ---------------------------------------------------------------------------

const CARD_STATE_FILE = '.build-card-state.json'
const EMOJI = { pending: '⬜', running: '⏳', done: '✅', fail: '❌' }

function buildCardContent(state) {
  const stageLines = state.stages.map((name, i) => {
    const s = state.statuses[i] || 'pending'
    const e = EMOJI[s] || '⬜'
    return s === 'running' ? `${e} **${name}**` : `${e} ${name}`
  })

  const hasFail = state.statuses.some(s => s === 'fail')
  const allDone = state.stages.length > 0 && state.statuses.every(s => s === 'done')
  const template = hasFail ? 'red' : allDone ? 'green' : 'blue'

  const started = new Date(state.startedAt)
  const sec = Math.round((Date.now() - started.getTime()) / 1000)
  const elapsed = sec < 60 ? `${sec}s` : `${Math.floor(sec / 60)}m ${sec % 60}s`

  const elements = [
    { tag: 'div', text: { tag: 'lark_md', content: stageLines.join('\n') } },
  ]
  if (state.notes && state.notes.length) {
    elements.push({ tag: 'hr' })
    elements.push({ tag: 'div', text: { tag: 'lark_md', content: state.notes.join('\n') } })
  }
  elements.push({
    tag: 'note',
    elements: [{ tag: 'plain_text', content: `Started ${started.toUTCString()} · ${elapsed} elapsed` }],
  })

  return JSON.stringify({
    config: { wide_screen_mode: true },
    header: { title: { tag: 'plain_text', content: state.title }, template },
    elements,
  })
}

function loadState(siteDir) {
  const p = path.join(siteDir, CARD_STATE_FILE)
  if (!fs.existsSync(p)) return null
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return null }
}

function saveState(siteDir, state) {
  fs.writeFileSync(path.join(siteDir, CARD_STATE_FILE), JSON.stringify(state, null, 2))
}

function finishStatuses(stages, success, existingStatuses=null) {
  if (success) {
    return stages.map(() => 'done')
  }

  if (existingStatuses) {
    const failedIndex = existingStatuses.findIndex(s => s === 'running' || s === 'pending')
    if (failedIndex === -1) {
      return existingStatuses.map((s, i) => i === existingStatuses.length - 1 ? 'fail' : s)
    }
    return existingStatuses.map((s, i) => i === failedIndex ? 'fail' : s)
  }

  return stages.map((_, i) => i === 0 ? 'fail' : 'pending')
}

async function patchCard(token, messageId, state, feishuHost) {
  return fetchFeishuJsonWithRetry(`${feishuHost}/open-apis/im/v1/messages/${messageId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json; charset=utf-8', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ content: buildCardContent(state) }),
  }, 'report-to-lark patch card')
}

// ---------------------------------------------------------------------------
// Plugin
// ---------------------------------------------------------------------------

module.exports = function (context) {
  const pluginCfg = context.siteConfig.plugins
    .find(p => p[0]?.includes('report-to-lark'))?.[1] ?? {}

  return {
    name: 'report-to-lark',
    extendCli(cli) {
      cli.command('report-to-lark')
        .description('Send messages or update a build progress card in Feishu/Lark')
        // ---- legacy options ----
        .option('-rId, --receiveId <receiveId>', 'Chat ID for new messages', pluginCfg.receiveId)
        .option('-type, --type <type>', 'Message type: text | interactive', 'interactive')
        .option('-cId, --cardId <cardId>', 'Template card ID', pluginCfg.cardId)
        .option('-cVer, --cardVersion <cardVersion>', 'Template card version', pluginCfg.cardVersion)
        .option('-m, --msg <message>', 'Message text')
        // ---- card commands ----
        .option('--card-create', 'POST a new progress card; writes card_id to $GITHUB_OUTPUT and $GITHUB_ENV')
        .option('--card-advance', 'Mark current stage done/fail and advance to next (reads state file)')
        .option('--card-finish', 'Final card update from a cross-job context (requires --message-id)')
        // ---- card options ----
        .option('--title <title>', 'Card title')
        .option('--stages <stages>', 'Comma-separated stage names (for --card-create)')
        .option('--status <status>', 'Stage status: done (default) | fail | success')
        .option('--note <note>', 'Optional note to append to the card')
        .option('--note-file <path>', 'Read note text from a file (supports multiline; overrides --note)')
        .option('--card-note-file <path>', 'Append a note file to the current progress card without advancing the stage')
        .option('--message-id <id>', 'Card message ID for cross-job --card-finish')
        .option('--started-at <iso>', 'startedAt ISO string passed from card-create job output')
        .action(async (opts) => {
          const FEISHU_HOST = process.env.FEISHU_HOST
          const noteText = opts.noteFile
            ? fs.readFileSync(opts.noteFile, 'utf8').trim()
            : (opts.note || null)

          const fetcher = new tokenFetcher()
          await fetcher.fetchToken()
          const token = await fetcher.token()

          // ----------------------------------------------------------------
          // --card-create  POST a new card, persist state, export card_id
          // ----------------------------------------------------------------
          if (opts.cardCreate) {
            const stages = (opts.stages || '').split(',').map(s => s.trim()).filter(Boolean)
            const state = {
              title: opts.title || 'Build Progress',
              stages,
              statuses: stages.map((_, i) => i === 0 ? 'running' : 'pending'),
              currentIndex: 0,
              notes: [],
              startedAt: new Date().toISOString(),
            }
            const data = await fetchFeishuJsonWithRetry(`${FEISHU_HOST}/open-apis/im/v1/messages?receive_id_type=chat_id`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json; charset=utf-8', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                receive_id: opts.receiveId,
                msg_type: 'interactive',
                content: buildCardContent(state),
                uuid: uuidv4(),
              }),
            }, 'report-to-lark create card')
            const messageId = data.data?.message_id
            if (messageId) {
              state.messageId = messageId
              saveState(context.siteDir, state)
              // Export to GitHub Actions so subsequent steps and jobs can use it
              if (process.env.GITHUB_OUTPUT) {
                fs.appendFileSync(process.env.GITHUB_OUTPUT, `card_id=${messageId}\n`)
                fs.appendFileSync(process.env.GITHUB_OUTPUT, `card_started_at=${state.startedAt}\n`)
                fs.appendFileSync(process.env.GITHUB_OUTPUT, `card_stages=${stages.join(',')}\n`)
                fs.appendFileSync(process.env.GITHUB_OUTPUT, `card_title=${state.title}\n`)
              }
              if (process.env.GITHUB_ENV) {
                fs.appendFileSync(process.env.GITHUB_ENV, `CARD_MSG_ID=${messageId}\n`)
              }
              process.stdout.write(messageId + '\n')
            } else {
              process.stderr.write(`[report-to-lark] card-create failed: ${JSON.stringify(data)}\n`)
            }
            return
          }

          // ----------------------------------------------------------------
          // --card-note-file  Append a note without advancing the stage
          // ----------------------------------------------------------------
          if (opts.cardNoteFile) {
            const state = loadState(context.siteDir)
            if (!state) {
              process.stderr.write('[report-to-lark] no card state — skipping note update\n')
              return
            }
            const note = fs.readFileSync(opts.cardNoteFile, 'utf8').trim()
            if (note) state.notes.push(note)
            saveState(context.siteDir, state)
            await patchCard(token, state.messageId, state, FEISHU_HOST)
            return
          }

          // ----------------------------------------------------------------
          // --card-advance  Mark current stage done/fail, advance to next
          // ----------------------------------------------------------------
          if (opts.cardAdvance) {
            const state = loadState(context.siteDir)
            if (!state) {
              process.stderr.write('[report-to-lark] no card state — skipping update\n')
              return
            }
            const status = opts.status || 'done'
            state.statuses[state.currentIndex] = status
            if (noteText) state.notes.push(noteText)
            if (status !== 'fail' && state.currentIndex + 1 < state.stages.length) {
              state.currentIndex++
              state.statuses[state.currentIndex] = 'running'
            }
            saveState(context.siteDir, state)
            await patchCard(token, state.messageId, state, FEISHU_HOST)
            return
          }

          // ----------------------------------------------------------------
          // --card-finish  Final PATCH from a cross-job (failure/success job)
          // ----------------------------------------------------------------
          if (opts.cardFinish) {
            const messageId = opts.messageId
            if (!messageId) {
              process.stderr.write('[report-to-lark] --message-id required for --card-finish\n')
              return
            }
            // State file not available across jobs — reconstruct from job outputs
            const success = opts.status === 'success' || opts.status === 'done'
            const passedStages = opts.stages ? opts.stages.split(',').map(s => s.trim()).filter(Boolean) : null
            const state = loadState(context.siteDir) || {
              title: opts.title || 'Build',
              stages: passedStages || [success ? 'Build succeeded' : 'Build failed'],
              statuses: finishStatuses(
                passedStages || [success ? 'Build succeeded' : 'Build failed'],
                success
              ),
              currentIndex: 0,
              notes: noteText ? [noteText] : [],
              startedAt: opts.startedAt || new Date().toISOString(),
            }
            if (loadState(context.siteDir)) {
              // State file present (same runner reused): apply final status
              state.statuses = finishStatuses(state.stages, success, state.statuses)
              if (noteText) state.notes.push(noteText)
            }
            await patchCard(token, messageId, state, FEISHU_HOST)
            return
          }

          // ----------------------------------------------------------------
          // Legacy: plain text or template-based interactive message
          // ----------------------------------------------------------------
          const content = opts.type === 'text'
            ? { text: opts.msg }
            : { template_id: opts.cardId, template_version_name: opts.cardVersion }

          const data = await fetchFeishuJsonWithRetry(`${FEISHU_HOST}/open-apis/im/v1/messages?receive_id_type=chat_id`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json; charset=utf-8', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              receive_id: opts.receiveId,
              msg_type: opts.type,
              content: JSON.stringify(content),
              uuid: uuidv4(),
            }),
          }, 'report-to-lark send message')
          console.log(data.msg)
        })
    },
  }
}
