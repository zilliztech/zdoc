const fs = require('node:fs')
const fetch = require('node-fetch')
const { URL } = require('node:url')
const xml2js = require('xml2js')
const node_path = require('path')
const _ = require('lodash')
require('dotenv/config')

module.exports = function (context, options) {
    return {
        name: "report-to-lark",
        extendCli(cli) {
            cli.command('report-to-lark')
               .description('Send messages to lark')
               .option('-rId, --receiveId <receiveId>', 'A unique ID for the message receiver, possible types are open_id, user_id, union_id, email, chat_id')
               .option('-m, --msg <message>', 'message')
               .action(async (options) => {
                    const receiveId = options.receiveId
                    const message = options.msg
                    const FEISHU_HOST = process.env.FEISHU_HOST
               })

        }
    }
}