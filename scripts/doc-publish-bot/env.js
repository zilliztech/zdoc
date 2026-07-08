const path = require('node:path')
const dotenv = require('dotenv')

function loadEnv() {
  dotenv.config({ path: path.resolve('.env') })
  dotenv.config({ path: path.resolve('scripts/doc-publish-bot/.env'), override: true })
}

module.exports = {
  loadEnv,
}
