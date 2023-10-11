const RefGen = require('./refGen');
const fs = require('node:fs')


module.exports = function (context, options) {
    return {
        name: "fetch-apifox-docs",
        extendCli(cli) {
            cli
                .command('fetch-apifox-docs')
                .option('-s, --specifications <specifications>', 'Specifications of the API')
                .option('-l, --lang <lang>', 'Language of the API Reference', 'en-US')
                .option('-o, --output_path <target_path>', 'Target path of the API Reference', 'reference/api/restful')
                .option('-i, --strings <strings>', 'Localization strings for Chinese docs')
                .action((opts) => {
                    let lang = opts.lang
                    let target_path = opts.output_path
                    let specifications;
                    let strings;

                    console.log('Fetching docs from Apifox...')

                    if (opts.specifications === undefined) {
                        console.log('Please provide specifications')
                        return
                    } else {
                        specifications = JSON.parse(fs.readFileSync(opts.specifications, 'utf-8'))
                    }

                    if (opts.lang === 'zh-CN' && opts.strings === undefined) {
                        console.log('Please provide the localization strings for Chinese docs')
                        return
                    } 

                    if (opts.lang === 'zh-CN') {
                        strings = fs.readFileSync(opts.strings, 'utf-8').split('\n')
                    }

                    const refGen = new RefGen({
                        specifications,
                        lang,
                        target_path,
                        strings,
                    })

                    refGen.make_groups()
                    refGen.write_refs()
                })
            }
        }
    }