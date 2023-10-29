const fetch = require('node-fetch')
const fs = require('node:fs')
const path = require('node:path')
const cheerio = require('cheerio')

// pymilvus latest version
const fetch_latest_version = async (url) => {
    const res = await fetch(url)
    const $ = cheerio.load(await res.text())
    const version = $('section > h2').first().text().match(/\d+\.\d+\.\d+/)[0]
    const released = $('section').first().find('relative-time').attr('datetime')
    return {
        version: version,
        released: released
    }
}

module.exports = function (context, options) {
    return {
        name: 'sdk-versions',
        extendCli(cli) {
            cli
                .command('sdk-versions')
                .description('Fetch pymilvus latest version')
                .option('-p, --path <path>', 'Directory to iterate over', 'docs/tutorials')
                .action(async (opts) => {
                    const python = await fetch_latest_version('https://github.com/milvus-io/pymilvus/releases')
                    const node = await fetch_latest_version('https://github.com/milvus-io/milvus-sdk-node/releases')
                    const java = await fetch_latest_version('https://github.com/milvus-io/milvus-sdk-java/releases')
                    const go = await fetch_latest_version('https://github.com/milvus-io/milvus-sdk-go/releases')

                    const versions = {
                        python: python,
                        node: node,
                        java: java,
                        go: go
                    }

                    const files = fs.readdirSync(opts.path, { recursive: true }).filter((file) => file.endsWith('.md'))

                    files.forEach((file) => {
                        var file_path = path.join(opts.path, file)
                        var content = fs.readFileSync(file_path).toString()
                        var lines = content.split('\n')
                        lines = lines.map(line => {
                            line = line.replace(/\{versions.python.version\}/g, versions.python.version)
                            line = line.replace(/\{versions.java.version\}/g, versions.java.version)
                            line = line.replace(/\{versions.node.version\}/g, versions.node.version)
                            line = line.replace(/\{versions.go.version\}/g, versions.go.version)

                            return line
                        })
                        content = lines.join('\n')
                        fs.writeFileSync(file_path, content)
                    })
                })
        }
    }
}