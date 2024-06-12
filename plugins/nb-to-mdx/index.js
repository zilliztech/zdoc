const fs = require('node:fs')
const fetch = require('node-fetch')
const { URL } = require('node:url')
const xml2js = require('xml2js')
const node_path = require('path')
const _ = require('lodash')
require('dotenv/config')

module.exports = function (context, options) {
    async function fetchNotebook(url) {
        const response = await fetch(url)
        var json;
        try {
            json = await response.json()
        } catch (e) {
            
        }
        

        console.log(json)
    }

    return {
        name: "nb-to-mdx",
        extendCli(cli) {
            cli.command('nb-to-mdx')
               .option('-s, --src <url>', 'Source file URL')
               .option('-o, --output <file>', 'Output file name')
               .action(async (opts) => {
                    const { src, output } = opts

                    await fetchNotebook(src)
               })
        }
    }
}