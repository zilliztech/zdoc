const assert = require('node:assert/strict')
const { test } = require('node:test')

const { buildReactionCommand } = require('./index')

test('buildReactionCommand attaches the Feishu typing keyboard emoji by default', () => {
  assert.deepEqual(buildReactionCommand('om_123'), [
    'lark-cli', 'im', 'reactions', 'create',
    '--message-id', 'om_123',
    '--data', '{"reaction_type":{"emoji_type":"Typing"}}',
    '--as', 'bot',
  ])
})
