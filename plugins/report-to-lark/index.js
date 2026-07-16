const path = require('node:path')
const fs = require('node:fs')
const { v4: uuidv4 } = require('uuid')
const tokenFetcher = require('../lark-docs/larkTokenFetcher')
const { fetchFeishuJsonWithRetry } = require('../lark-docs/feishuFetch')
const { buildCardV2 } = require('./cardV2')
const { createCardClient } = require('./cardClient')
const {
  buildFinishState,
  buildExactState,
  buildPhaseState,
  parseNotesJson,
} = require('./reportCardState')
require('dotenv/config')

// ---------------------------------------------------------------------------
// Build-progress card helpers
// ---------------------------------------------------------------------------

const CARD_STATE_FILE = '.build-card-state.json'

function loadState(siteDir) {
  const p = path.join(siteDir, CARD_STATE_FILE)
  if (!fs.existsSync(p)) return null
  try { return JSON.parse(fs.readFileSync(p, 'utf8')) } catch { return null }
}

function saveState(siteDir, state) {
  fs.writeFileSync(path.join(siteDir, CARD_STATE_FILE), JSON.stringify(state, null, 2))
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
        .option('--card-phase', 'Update one workflow phase from a cross-job context')
        .option('--card-state-file <path>', 'Replace a cross-job card with exact JSON state')
        // ---- card options ----
        .option('--title <title>', 'Card title')
        .option('--stages <stages>', 'Comma-separated stage names (for --card-create)')
        .option('--status <status>', 'Stage status: done (default) | fail | success')
        .option('--note <note>', 'Optional note to append to the card')
        .option('--note-file <path>', 'Read note text from a file (supports multiline; overrides --note)')
        .option('--notes-json <json>', 'JSON array of note strings to append to the card')
        .option('--card-note-file <path>', 'Append a note file to the current progress card without advancing the stage')
        .option('--message-id <id>', 'Card message ID for cross-job --card-finish')
        .option('--started-at <iso>', 'startedAt ISO string passed from card-create job output')
        .option('--stage-index <index>', 'Zero-based stage index for --card-phase')
        .option('--stage <name>', 'Stage name for --card-phase')
        .option('--target-branch <branch>', 'Publication target branch shown on progress cards')
        .action(async (opts) => {
          const FEISHU_HOST = process.env.FEISHU_HOST
          const noteText = opts.noteFile
            ? fs.readFileSync(opts.noteFile, 'utf8').trim()
            : (opts.note || null)

          const fetcher = new tokenFetcher()
          await fetcher.fetchToken()
          const token = await fetcher.token()
          const cardClient = createCardClient({
            feishuHost: FEISHU_HOST,
            appId: process.env.APP_ID,
            appSecret: process.env.APP_SECRET,
            tokenProvider: async () => token,
          })

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
              targetBranch: opts.targetBranch || undefined,
            }
            const data = await fetchFeishuJsonWithRetry(`${FEISHU_HOST}/open-apis/im/v1/messages?receive_id_type=chat_id`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json; charset=utf-8', Authorization: `Bearer ${token}` },
              body: JSON.stringify({
                receive_id: opts.receiveId,
                msg_type: 'interactive',
                content: JSON.stringify(buildCardV2(state)),
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
            await cardClient.patch({ messageId: state.messageId, state })
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
            await cardClient.patch({ messageId: state.messageId, state })
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
            const passedStages = opts.stages ? opts.stages.split(',').map(s => s.trim()).filter(Boolean) : null
            const notes = parseNotesJson(opts.notesJson)
            if (noteText) notes.push(noteText)
            const state = buildFinishState({
              existingState: loadState(context.siteDir),
              messageId,
              title: opts.title || 'Build',
              stages: passedStages,
              status: opts.status,
              startedAt: opts.startedAt,
              notes,
              targetBranch: opts.targetBranch,
            })
            await cardClient.patch({ messageId, state })
            return
          }

          if (opts.cardPhase) {
            const stages = (opts.stages || '').split(',').map(s => s.trim()).filter(Boolean)
            const state = buildPhaseState({
              messageId: opts.messageId,
              title: opts.title,
              stages,
              stageIndex: opts.stageIndex === undefined ? stages.indexOf(opts.stage) : Number(opts.stageIndex),
              status: opts.status || 'done',
              startedAt: opts.startedAt,
              note: noteText,
              targetBranch: opts.targetBranch,
            })
            await cardClient.patch({ messageId: opts.messageId, state })
            return
          }

          if (opts.cardStateFile) {
            if (!opts.messageId) throw new Error('--message-id required for --card-state-file')
            const input = JSON.parse(fs.readFileSync(opts.cardStateFile, 'utf8'))
            const state = buildExactState({
              messageId: opts.messageId,
              title: opts.title,
              startedAt: opts.startedAt,
              targetBranch: opts.targetBranch || input.targetBranch,
              input,
            })
            await cardClient.patch({ messageId: opts.messageId, state })
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
