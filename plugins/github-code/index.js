const fetch = require('node-fetch')
const yaml = require('js-yaml')
const fs = require('node:fs')

// github:
//   repo: zilliztech/zdoc-demos
//   branch: master
//   paths: 
//     - python/00_quick_start.ipynb#2913a8f9-c7be-4dd2-a2e5-b8878b6b6a9e
//     - python/00_quick_start.ipynb#ebf0da44-0868-4b4f-bbab-564f5d6dabe0
const fetch_code_snippet = async (config) => {
    const { github } = yaml.load(config)
    const paths = github.paths

    const results = await Promise.all(paths.map(async (path) => {
        if (!path.includes('#')) {
            throw new Error(`Invalid github config: ${config}`)
        }

        const link = path.split('#')[0]
        const raw_url = `https://raw.githubusercontent.com/${github.repo}/${github.branch}/${link}`

        const res = await fetch(raw_url)

        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}\nurl: ${raw_url}`)
        }

        const text = await res.text()

        if (link.endsWith('.ipynb')) {
            const notebook = JSON.parse(text)
            const cells = notebook.cells
            const cellId = path.split('#')[1]
            const cell = cells.filter((cell) => cell.id === cellId)[0]
            const snippet = cell.source.join('')
            const output = cell.outputs.filter((output) => output.name === 'stdout').map((output) => output.text).join('')

            return snippet + (output ? `\n\n# Output\n\n${output.split('\n').map(line => "# " + line.replace(/^,/g, '')).join('\n')}` : '')
        } else {
            const range = path.split('#')[1]
            const lines = text.split('\n')
            const start = parseInt(range.split('-')[0].slice(1))
            const end = parseInt(range.split('-')[1].slice(1))
            const snippet = lines.slice(start - 1, end).join('\n')
            const snippet_indent = snippet.match(/^\s*/g)[0].length
        
            return snippet.split('\n').map((line) => line.slice(snippet_indent)).join('\n')
        }
    }))

    return results.join('\n\n')
}

// iterate over the docs folder and gather all code blocks that contains a github link
// for each code block, fetch the code snippet from github
const iterate = async (dir, mode) => {
    const paths = fs.readdirSync(dir)

    var results = (await Promise.all(paths.map(async (path) => {
        if (fs.statSync(`${dir}/${path}`).isDirectory()) {
            return iterate(`${dir}/${path}`, mode)
        } 

        if (fs.statSync(`${dir}/${path}`).isFile() && path.endsWith('.md')) {
            if (mode === 'l') {
                return list_code_configs_on_page(`${dir}/${path}`)
            } 

            if (mode === 'r') {
                return await replace_code_snippets_on_page(`${dir}/${path}`)
            }
        }
    })))

    results = results.filter(result => result !== undefined).flat().filter(result => Object.keys(result).length !== 0)
    results = Object.assign({}, ...results)

    return results
}

const list_code_configs_on_page = (path) => {
    const file = fs.readFileSync(path).toString()
    const boundaries = file.split('\n')
        .map((line, idx) => line.includes('```') ? idx : undefined)
        .filter((idx) => idx !== undefined)

    const results = {}

    boundaries.map((boundary, idx) => {
        const start = boundary + 1
        const end = boundaries[idx + 1]
        const block = file.split('\n').slice(start, end).join('\n')
        const indent = block.match(/^\s*/g)[0].length

        if (block.includes('github:')) {
            const yml = block.split('\n').map((line) => line.slice(indent)).join('\n')
            
            if (results[path] === undefined) {
                results[path] = []
                results[path].push(yml)
            } else {
                results[path].push(yml)
            }
        }
    })

    return results
}

const replace_code_snippets_on_page = async (path) => {
    var file = fs.readFileSync(path).toString()
    const boundaries = file.split('\n')
        .map((line, idx) => line.includes('```') ? idx : undefined)
        .filter((idx) => idx !== undefined)

    const results = {}
    
    await Promise.all(boundaries.map(async (boundary, idx) => {
        const start = boundary + 1
        const end = boundaries[idx + 1]
        const block = file.split('\n').slice(start, end).join('\n')
        const indent = block.match(/^\s*/g)[0].length

        if (block.includes('github:')) {
            const yml = block.split('\n').map((line) => line.slice(indent)).join('\n')
            const snippet = await fetch_code_snippet(yml)
            file = file.replace(block, snippet.split('\n').map((line) => ' '.repeat(indent) + line).join('\n'))

            if (results[path] === undefined) {
                results[path] = []
                results[path].push(snippet)
            } else {
                results[path].push(snippet)
            }
        }
    }))

    fs.writeFileSync(path, file)

    return results
}

module.exports = function (context, options) {
    return {
        name: 'github-code',
        extendCli(cli) {
            cli
                .command('github-code')
                .option('-d, --dir <dir>', 'Directory to iterate over', 'docs/tutorials')
                .option('-f, --file <file>', 'File to replace code snippets in')
                .option('-l --list', 'List yaml configs')
                .option('-r, --replace', 'Replace code snippets')
                .action(async (opts) => {

                    console.log(opts.dir, opts.file, opts.list, opts.replace)
                    if (opts.replace && opts.file === undefined) {
                        const results = await iterate(opts.dir, 'r')
                        console.log(results)
                        return
                    }

                    if (opts.file && opts.replace) {
                        const results = await replace_code_snippets_on_page(opts.file)
                        console.log(results)
                        return
                    }

                    if (opts.list && opts.file === undefined) {
                        const results = await iterate(opts.dir, 'l')
                        console.log(results)
                        return
                    }

                    if (opts.file && opts.list) {
                        const results = list_code_configs_on_page(opts.file)
                        console.log(results)
                        return
                    }

                })
        }
    }
}