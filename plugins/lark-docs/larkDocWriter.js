const larkTokenFetcher = require('./larkTokenFetcher.js')
const Downloader = require('./larkImageDownloader.js')
const slugify = require('slugify')
const fs = require('node:fs')
const { URL } = require('node:url')
const fetch = require('node-fetch')
const cheerio = require('cheerio')

class larkDocWriter {
    constructor(pages=[], page_blocks=[], imageDir='static/img', target='saas', skip_image_download=false) {
        this.pages = pages
        this.page_blocks = page_blocks
        this.titles = JSON.parse(fs.readFileSync('plugins/lark-docs/meta/titles.json'))
        this.blocks = []
        this.target = target
        this.current_page = null
        this.skip_image_download = skip_image_download
        this.block_types = [
            "page",
            "text",
            "heading1",
            "heading2",
            "heading3",
            "heading4",
            "heading5",
            "heading6",
            "heading7",
            "heading8",
            "heading9",
            "bullet",
            "ordered",
            "code",
            "quote",
            null,
            "todo",
            "bitable",
            "callout",
            "chat_card",
            "diagram",
            "divider",
            "file",
            "grid",
            "grid_column",
            "iframe",
            "image",
            "isv",
            "mindnote",
            "sheet",
            "table",
            "table_cell",
            "view",
            "quote_container",
            "task",
            "okr",
            "okr_objective",
            "okr_key_result",
            "okr_progress",
            "add_ons",
            "jira_issue"
        ]
        this.code_langs = [
            null,
            "PlainText",
            "ABAP",
            "Ada",
            "Apache",
            "Apex",
            "Assembly",
            "Bash",
            "CSharp",
            "C++",
            "C",
            "COBOL",
            "CSS",
            "CoffeeScript",
            "D",
            "Dart",
            "Delphi",
            "Django",
            "Dockerfile",
            "Erlang",
            "Fortran",
            "FoxPro",
            "Go",
            "Groovy",
            "HTML",
            "HTMLBars",
            "HTTP",
            "Haskell",
            "JSON",
            "Java",
            "JavaScript",
            "Julia",
            "Kotlin",
            "LateX",
            "Lisp",
            "Logo",
            "Lua",
            "MATLAB",
            "Makefile",
            "Markdown",
            "Nginx",
            "Objective",
            "OpenEdgeABL",
            "PHP",
            "Perl",
            "PostScript",
            "Power",
            "Prolog",
            "ProtoBuf",
            "Python",
            "R",
            "RPG",
            "Ruby",
            "Rust",
            "SAS",
            "SCSS",
            "SQL",
            "Scala",
            "Scheme",
            "Scratch",
            "Shell",
            "Swift",
            "Thrift",
            "TypeScript",
            "VBScript",
            "Visual",
            "XML",
            "YAML",
            "CMake",
            "Diff",
            "Gherkin",
            "GraphQL",
            "OpenGL Shading Language",
            "Properties",
            "Solidity",
            "TOML",        
        ]
        this.tokenFetcher = new larkTokenFetcher()
        this.downloader = new Downloader({}, imageDir)
    }

    async write_docs({
        path,
        children,
    }) {
        const forEachAsync = async (array, callback) => {
            for (let index = 0; index < array.length; index++) {
                await callback(array[index], index, array);
            }
        }

        let current_path = path
        let titles = JSON.parse(fs.readFileSync('plugins/lark-docs/meta/titles.json', {encoding: 'utf-8', flag: 'r'}))
        if (children) {
            children = children.filter(child => child.obj_type != 'bitable' && child != undefined)
            await forEachAsync(children, async (child, index) => {
                if (child.children) {
                    let title = child.title
                    let slug = ''
                    if (titles[title]) {
                        slug = titles[title]
                    } else {
                        slug = slugify(title, {lower: true, strict: true})
                        titles[title] = slug
                        fs.writeFileSync('plugins/lark-docs/meta/titles.json', JSON.stringify(titles, null, 4))
                    }
                    console.log(`${current_path}/${slug}`)
                    if (!fs.existsSync(`${current_path}/${slug}`)) {
                        fs.mkdirSync(`${current_path}/${slug}`)
                    }
                    this.__category_meta(`${current_path}/${slug}`, title, index+1)
                    await this.write_docs({
                        path: `${current_path}/${slug}`,
                        children: child.children
                    })
                } else {
                    switch (child.title) {
                        case 'FAQs':
                            if (!fs.existsSync(`${current_path}/faqs`)) {
                                fs.mkdirSync(`${current_path}/faqs`)
                            }
                            this.__category_meta(`${current_path}/faqs`, 'FAQs', index+1)
                            await this.write_faqs(`${current_path}/faqs`)
                            break;
                        default:
                            const meta = await this.__is_to_publish(child.title)
                            if (meta['publish']) {
                                const slug = meta['slug']
                                const beta = meta['beta']
                                const notebook = meta['notebook']
                                console.log(`${current_path}/${slug}.md`)
                                await this.write_doc({
                                    path: current_path,
                                    page_title: child.title,
                                    page_slug: slug,
                                    page_beta: beta,
                                    notebook: notebook,
                                    sidebar_position: index+1
                                })
                            }
                            break;
                    }
                }
            })
        }
    }

    async write_doc ({
        path, 
        page_token, 
        page_title, 
        page_slug,
        page_beta,
        notebook,
        sidebar_position
    }) {
        let obj;
        let blocks;
        if (page_token) {
            obj = this.pages.filter(page => page.obj_token == page_token)[0]
            if (obj) {
                blocks = obj.blocks.items
            }
        } 
        
        if (page_title) {
            obj = this.pages.filter(page => page.title == page_title)[0]
            if (obj) {
                blocks = obj.blocks.items
            }
        }

        if (blocks.length === 0) {
            blocks = this.page_blocks
        } else {
            this.page_blocks = blocks
        }

        let page = this.page_blocks.filter(block => block.block_type == 1)[0]

        if (page && page.children) {
            this.blocks = page.children.map(child => {
                return this.__retrieve_block_by_id(child)
            })
            await this.__write_page({
                slug: page_slug,
                beta: page_beta,
                notebook: notebook,
                path: path, 
                sidebar_position: sidebar_position
            })
        }
    }

    async write_faqs (path) {
        this.page_blocks = this.pages.filter((page) => {
            return page.title === 'FAQs'
        })[0].blocks.items

        let page = this.page_blocks.filter(block => block.block_type == 1)[0]

        if (page && page.children) {
            this.blocks = page.children.map(child => {
                return this.__retrieve_block_by_id(child)
            })

            let a = await this.__markdown()
            a = this.__filter_content(a, this.target).split('\n')
            let header_pos = a.map((line, index) => {
                if (line.startsWith('##')) {
                    return index
                }
            }).filter(x => x !== undefined)

            let sub_pages = []

            for (let i = 0; i < header_pos.length; i++) {
                let start = header_pos[i]
                let end = header_pos[i+1]
                let sub_page = a.slice(start, end)
                sub_pages.push(sub_page)
            }

            sub_pages.forEach((sub_page, index) => {
                let title = sub_page[0].replace(/^## /g, '').replace(/{#[\w-]+}/g, '').trim()
                let short_description = sub_page.filter(line => line.length > 0)[1]
                let slug = slugify(title, {lower: true, strict: true})
                let front_matter = this.__front_matters(slug, null, null, index+1)
                let links = []

                sub_page = sub_page.map(line => {
                    if (line.startsWith('**')) {
                        let qtext = line.replace(/\*/g, '').trim()
                        let qslug = slugify(qtext, {lower: true, strict: true})
                        line = `### ${qtext}{#${qslug}}`
                        links.push(`- [${qtext}](#${qslug})`)
                    }

                    if (line == short_description) {
                        line = ''
                    }

                    return line
                })

                const markdown = `${front_matter}\n\n# ${title}\n\n${short_description}\n\n## Contents\n\n${links.join('\n')}\n\n## FAQs\n\n${sub_page.slice(1).join('\n')}`    
                fs.writeFileSync(`${path}/${slug}.md`, markdown)
            })
        }
    }

    __category_meta(path, label, position) {
        const titles = JSON.parse(fs.readFileSync('plugins/lark-docs/meta/titles.json'))
        const meta = JSON.stringify({
            label,
            position,
            link: {
                type: "generated-index",
                title: label,
                slug: titles[label] ? '/docs/' + titles[label] : (slugify(label, {lower: true, strict: true}), titles[label] = '/docs/' + slugify(label, {lower: true, strict: true}))
            }
        }, null, 4)
        fs.writeFileSync(`${path}/_category_.json`, meta)
    }

    async __listed_docs() {
        const app_id = this.pages[0].children.slice(-1)[0].obj_token
        const token = await this.tokenFetcher.token()
        let url = `${process.env.FEISHU_HOST}/open-apis/bitable/v1/apps/${app_id}/tables`
        const table_id = (await (await fetch(url, {
            method: "get",
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${token}`
            }
        })).json()).data.items[0].table_id

        url = `${process.env.FEISHU_HOST}/open-apis/bitable/v1/apps/${app_id}/tables/${table_id}/records?page_size=500`
        this.records = (await (await fetch(url, {
            method: "get",
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${token}`
            }
        })).json()).data.items
    }

    async __is_to_publish (title) {
        if (!this.records) {
            await this.__listed_docs()
        }

        const result = this.records.filter(record => {
            if (record["fields"]["Docs"] && record["fields"]["Docs"] === title &&
                record["fields"]["Progress"] && (record["fields"]["Progress"] === "Draft" || record["fields"]["Progress"] === "Publish")) {
                
                if ((this.target === 'saas' && record["fields"]["Target"] && record["fields"]["Target"] != "PaaS Only") ||
                    (this.target === 'paas' && record["fields"]["Target"] && record["fields"]["Target"] != "SaaS Only")
                ) {
                    return record
                }
            }
        })

        if (result.length > 0) {
            return {
                publish: true,
                slug: result[0]["fields"]["Slug"],
                beta: result[0]["fields"]["Beta"],
                notebook: result[0]["fields"]["Notebook"],
            }
        } else {
            return {
                publish: false,
            }
        }
        
    }

    __filter_content (markdown, target) {
        const regex = /<(include|exclude) target="(\b(\w+,)*\w+\b)">[\s\S]*?<\/\1>/g
        markdown = markdown.replace(regex, (match, tag, value) => {
            value = value.split(',').map(item => item.trim())
            if (tag == 'include' && value.includes(target)) {
                return match.replace(new RegExp(`<\/?${tag}[ target="${value.join(',')}"]*>`, 'g'), '')
            }

            if (tag == 'exclude' && !value.includes(target)) {
                return match.replace(new RegExp(`<\/?${tag}[ target="${value.join(',')}"]*>`, 'g'), '')
            }

            if (tag == 'exclude' && value.includes(target)) {
                return ""
            }
            
            if (tag == 'include' && !value.includes(target)) {
                return ""
            }
        })

        return markdown.replace(/\n{3,}/g, '\n\n')
    }

    async __write_page({slug, beta, notebook, path, sidebar_position}) {
        this.current_page = slug
        let front_matter = this.__front_matters(slug, beta, notebook, sidebar_position)
        let markdown = await this.__markdown()
        markdown = this.__filter_content(markdown, this.target)
        if (!this.sdks) {
            this.sdks = await this.__fetch_sdk_versions()
        }

        markdown = markdown.replace(/{versions.python.version}/g, this.sdks.python.version)
        markdown = markdown.replace(/{versions.java.version}/g, this.sdks.java.version)
        markdown = markdown.replace(/{versions.node.version}/g, this.sdks.node.version)
        markdown = markdown.replace(/{versions.go.version}/g, this.sdks.go.version)

        let tabs = markdown.split('\n').filter(line => {
            return line.trim().startsWith("<Tab")
        }).length

        let imports = await this.__imports(tabs > 0)
        slug = slug === "/" ? "quick-start" : slug
        fs.writeFileSync(`${path}/${slug}.md`, front_matter + '\n\n' + imports + '\n\n' + markdown)
    }

    __front_matters (slug, beta, notebook, sidebar_position=undefined) {
        let displayed_sidebar = this.target === 'saas' ? "" : "displayed_sidebar: paasSidebar\n"
        slug = this.target === 'saas' ? `/docs/${slug}` : `/docs/byoc/${slug}`
        slug = slug.replace(/\/\//g, '/').replace(/^\//, '')
        slug = slug === 'docs/' ? '' : slug
        
        var sidebar_label = fs.readFileSync('plugins/lark-docs/meta/sidebarLables.json', {encoding: 'utf-8', flag: 'r'})

        if (sidebar_label[slug]) {
            sidebar_label = `sidebar_label: ${sidebar_label[slug]}` + '\n'
        } else {
            sidebar_label = ''
        }

        let front_matter = '---\n' + 
        displayed_sidebar +
        `slug: /${slug}` + '\n' +
        sidebar_label +
        `beta: ${beta}` + '\n' +
        `notebook: ${notebook}` + '\n' +
        `sidebar_position: ${sidebar_position}` + '\n' +
        '---'

        return front_matter
    }

    __imports (cond=null) {
        let block_types = this.blocks.map(block => {
            return this.block_types[block.block_type - 1]
        }).join('')

        if (block_types.match(/(code){2,}/g) || cond) {
            return ["import Admonition from '@theme/Admonition';", "import Tabs from '@theme/Tabs';",
            "import TabItem from '@theme/TabItem';"].join('\n')
        } else {
            return "import Admonition from '@theme/Admonition';" + "\n"
        }
    }

    async __markdown(blocks=null, indent=0) {
        const markdown = [];
        const idt = " ".repeat(indent);
        if (blocks === null) {
            blocks = this.blocks;
            markdown.push(await this.__page(this.page_blocks[0]['page']));
        }
    
        for (let idx = 0; idx < blocks.length; idx++) {
            const block = blocks[idx];
            console.log(block['block_id'], this.block_types[block['block_type']-1], block['block_type']);
            const prev_block = idx > 0 ? blocks[idx-1] : null;
            const next_block = idx < blocks.length-1 ? blocks[idx+1] : null;

            if (this.block_types[block['block_type']-1] === undefined) {
                markdown.push('[Unsupported block type]');
            } else if (this.block_types[block['block_type']-1] === 'text') {
                markdown.push(idt + await this.__text(block['text']));
            } else if (this.block_types[block['block_type']-1].includes('heading')) {
                const level = parseInt(this.block_types[block['block_type']-1].slice(-1));
                markdown.push(idt + await this.__heading(block[`heading${level}`], level));
            } else if (this.block_types[block['block_type']-1] === 'bullet') {
                markdown.push(await this.__bullet(block, indent));
            } else if (this.block_types[block['block_type']-1] === 'ordered') {
                markdown.push(await this.__ordered(block, indent));
            } else if (this.block_types[block['block_type']-1] === 'code') {
                markdown.push(await this.__code(block['code'], indent, prev_block, next_block, blocks));
            } else if (this.block_types[block['block_type']-1] === 'quote_container') {
                markdown.push(await this.__quote(block, indent));
            } else if (this.block_types[block['block_type']-1] === 'image') {
                markdown.push(idt + (await this.__image(block['image'])));
            } else if (this.block_types[block['block_type']-1] === 'iframe') {
                markdown.push(idt + (await this.__iframe(block['iframe'])));
            } else if (this.block_types[block['block_type']-1] === 'table') {
                markdown.push(await this.__table(block['table'], indent));
            } else if (this.block_types[block['block_type']-1] === 'callout') {
                markdown.push(await this.__callout(block, indent));
            } else if (block['block_type'] === 999 && block['children']) {
                const children = block['children'].map(child => {
                    return this.__retrieve_block_by_id(child)
                })
                markdown.push(await this.__markdown(children, indent));
            } else {
                console.log(`Unprocessed: ${block['block_id']}`);
            }
        }
    
        return markdown.join('\n\n').replace(/\n{3,}/g, '\n\n').replace(/<br>/g, '<br/>');
    }

    async __page(page) {
        return '# ' + await this.__text_elements(page['elements']);
    }

    async __text(text) {
        return await this.__text_elements(text['elements']);
    }

    async __heading(heading, level) {
        let content = await this.__text_elements(heading['elements'])
        content = this.__filter_content(content, this.target)
        let slug = slugify(content, {lower: true, strict: true})
        return '#'.repeat(level) + ' ' + content + '{#'+slug+'}';
    }

    async __bullet(block, indent) {
        let children = ''
        if (block.children) {
            children = block.children.map(child => {
                return this.__retrieve_block_by_id(child)
            })
            children = await this.__markdown(children, indent+4)
        }

        return ' '.repeat(indent) + '- ' + await this.__text_elements(block['bullet']['elements']) + '\n' + children;
    }

    async __ordered(block, indent) {
        let children = ''
        if (block.children) {
            children = block.children.map(child => {
                return this.__retrieve_block_by_id(child)
            })
            children = await this.__markdown(children, indent+4)
        }

        return ' '.repeat(indent) + '1. ' + await this.__text_elements(block['ordered']['elements']) + '\n' + children;
    }

    async __callout(block, indent) {
        let children = []
        if (block.children) {
            children = block.children.map(child => {
                return this.__retrieve_block_by_id(child)
            })

            children = await this.__markdown(children, indent)
        }

        let emoji = block['callout']['emoji_id']
        let type;

        switch (emoji) {
            case 'blue_book':
                type = '<Admonition type="info" icon="📘" title="Notes">'
                break;
            case 'construction':
                type = '<Admonition type="danger" icon="🚧" title="Caution">'
                break;
            default:
                type = '<Admonition type="info" icon="📘" title="Notes">'
                break; 
        }               
        
        return ' '.repeat(indent) + type + '\n\n' + children.split('\n').slice(1).join(' '.repeat(indent) + '\n') + '\n\n' + ' '.repeat(indent) + '</Admonition>';
    }

    async __code(code, indent, prev, next, blocks) {
        const valid_langs = ['Python', 'JavaScript', 'Java', 'Go', 'Bash']
        let lang = code.style.language ? this.code_langs[code['style']['language']] : 'plaintext'
        let elements = (await Promise.all(code['elements'].map( async x => {
            return await this.__text_run(x, code['elements'])
        }))).join('') 

        if (valid_langs.includes(lang)) {
            const prev_type = prev ? this.block_types[prev['block_type']-1] : null;
            const next_type = next ? this.block_types[next['block_type']-1] : null;
            const prev_lang = prev && prev_type === 'code' && prev['code']['style']['language'] ? this.code_langs[prev['code']['style']['language']] : null;
            const next_lang = next && next_type === 'code' && next['code']['style']['language'] ? this.code_langs[next['code']['style']['language']] : null;

            // first block
            if ((!prev || (prev && prev_type !== 'code') || 
                (prev && prev_type === 'code' && (!valid_langs.includes(prev_lang) || prev_lang === lang))) &&
                (next && next_type === 'code' && valid_langs.includes(next_lang) && next_lang !== lang)
            ) {
                console.log('first block')
                const values = this.__code_tabs(code, prev, next, blocks);
                return this.__code_block_split(elements, indent, lang, 'first', values);
            }
            
            // last block
            if (prev && prev_type === 'code' && valid_langs.includes(prev_lang) && prev_lang !== lang &&
                (!next || (next && next_type !== 'code') || 
                (next && next_type === 'code' && (!valid_langs.includes(next_lang) || next_lang === lang)))) {
                console.log('last block')
                return this.__code_block_split(elements, indent, lang, 'last');
            }
            
            // middle block
            if (prev && prev_type === 'code' && valid_langs.includes(next_lang) && prev_lang !== lang && next && next_type === 'code' && valid_langs.includes(next_lang) && next_lang !== code['style']['language']) {
                console.log('middle block')
                return this.__code_block_split(elements, indent, lang, 'middle');
            } 

            // only block
            if (!prev || (prev && prev_type !== 'code') ||
                (prev && (prev_type === 'code' || !valid_langs.includes(prev_lang) || prev_lang === lang)) ||
                (next && (next_type === 'code' || !valid_langs.includes(next_lang) || next_lang === lang)) ||
                !next || (next && next_type !== 'code')
            ) {
                console.log('only block')           
                return this.__code_block_split(elements, indent, lang);
            }             
        } else {
            console.log('not valid lang')
            return this.__code_block_split(elements, indent, lang);
        }
    }

    __code_block_split(elements, indent, lang, position, values=null) {
        elements = elements.split('\n');
        var divider = elements.indexOf(elements.filter(x => x.match(/^[#\/]\/* ==*/))[0]);
        var tab_item_start = `${' '.repeat(indent)}<TabItem value='${lang.toLowerCase()}'>\n`;
        var tab_item_end = `${' '.repeat(indent)}</TabItem>`
        var tabs_end = `${' '.repeat(indent)}</Tabs>`
        if (divider === -1) {
            elements = `${' '.repeat(indent)}\`\`\`${lang.toLowerCase()}\n${' '.repeat(indent) + elements.join('\n' + ' '.repeat(indent))}\n${' '.repeat(indent)}\`\`\`\n`
            switch (position) {
                case 'first':
                    var tabs_start = `${' '.repeat(indent)}<Tabs groupId="code" defaultValue='${values[0].value}' values={${JSON.stringify(values)}}>`;
                    return [tabs_start, tab_item_start, elements, tab_item_end].join('\n');
                case 'last':
                    return [tab_item_start, elements, tab_item_end, tabs_end].join('\n');
                case 'middle':
                    return [tab_item_start, elements, tab_item_end].join('\n');
                default:
                    return elements;
            }
        } else {
            var comment_mark = lang === 'Python' ? '# ' : '// '
            var half_1 = elements.slice(0, divider)
            var half_1_label = half_1[0].replace(comment_mark, '') 
            var half_2 = elements.slice(divider)
            var half_2_label = half_2[1].replace(comment_mark, '')

            lang = lang.toLowerCase()

            var inner_values = []
            inner_values.push({label: half_1_label, value: lang})
            inner_values.push({label: half_2_label, value: `${lang}_1`})

            var inner_tabs_start = `${' '.repeat(indent)}<Tabs groupId="${lang}" defaultValue='${inner_values[0].value}' values={${JSON.stringify(inner_values)}}>`;
            var inner_tab_item_start_1 = `${' '.repeat(indent)}<TabItem value='${inner_values[0].value}'>\n`;
            var inner_tab_item_start_2 = `${' '.repeat(indent)}<TabItem value='${inner_values[1].value}'>\n`;
            var inner_tab_item_end = `${' '.repeat(indent)}</TabItem>`
            var inner_tabs_end = `${' '.repeat(indent)}</Tabs>`
            
            half_1 = `${' '.repeat(indent)}\`\`\`${lang.toLowerCase()}\n${' '.repeat(indent) + half_1.slice(1).join('\n' + ' '.repeat(indent))}\n${' '.repeat(indent)}\`\`\`\n`
            half_2 = `${' '.repeat(indent)}\`\`\`${lang.toLowerCase()}\n${' '.repeat(indent) + half_2.slice(3).join('\n' + ' '.repeat(indent))}\n${' '.repeat(indent)}\`\`\`\n`

            switch (position) {
                case 'first':
                    var tabs_start = `${' '.repeat(indent)}<Tabs groupId="code" defaultValue='${values[0].value}' values={${JSON.stringify(values)}}>`;
                    return [tabs_start, tab_item_start, inner_tabs_start, inner_tab_item_start_1, half_1, inner_tab_item_end, inner_tab_item_start_2, half_2, inner_tab_item_end, inner_tabs_end, tab_item_end ].join('\n');
                case 'last':
                    return [tab_item_start, inner_tabs_start, inner_tab_item_start_1, half_1, inner_tab_item_end, inner_tab_item_start_2, half_2, inner_tab_item_end, inner_tabs_end, tab_item_end, tabs_end].join('\n');
                case 'middle':
                    return [tab_item_start, inner_tabs_start, inner_tab_item_start_1, half_1, inner_tab_item_end, inner_tab_item_start_2, half_2, inner_tab_item_end, inner_tabs_end, tab_item_end].join('\n');
                default:
                    return [inner_tabs_start, inner_tab_item_start_1, half_1, inner_tab_item_end, inner_tab_item_start_2, half_2, inner_tab_item_end, inner_tabs_end].join('\n');
            }
        }
    }

    __code_tabs(code, prev, next, blocks) {
        let values = [];
        let lang = code.style.language ? this.code_langs[code.style.language] : 'plaintext'
        
        if ((!prev || (prev && this.block_types[prev['block_type']-1] !== 'code')) && next && this.block_types[next['block_type']-1] === 'code') {
            values.push({ label: lang === 'JavaScript' ? 'NodeJS' : lang, value: lang.toLowerCase() });
            
            function has_next_code(next, block_types, code_langs) {
                const next_lang = code_langs[next['code']['style']['language']];
                values.push({ label: next_lang === 'JavaScript' ? 'NodeJS' : next_lang, value: next_lang.toLowerCase() });
                try {
                    next = blocks[blocks.indexOf(next) + 1];
                if (next && block_types[next['block_type']-1] === 'code') {
                    has_next_code(next, block_types, code_langs);
                }
                } catch {
                // do nothing
                }
            }
        
            has_next_code(next, this.block_types, this.code_langs);
        }
        
        return values;
    }

    async __quote(block, indent) {
        let quotes = block['children'].map( (child) => {
            return this.__retrieve_block_by_id(child)
        });
        let res = (await this.__markdown(quotes, indent)).split('\n');

        let type = 'info Notes';
        if (res[0].includes('Notes') || res[0].includes('Note')) {
            type = 'info 📘 Notes';
        } else if (res[0].includes('Warning')) {
            type = 'caution 🚧 Warning';
        }

        res[0] = `<Admonition type="${type.split(' ')[0]}" icon="${type.split(' ')[1]}" title="${type.split(' ')[2]}">`;
        res.splice(1, 0, "");

        return ' '.repeat(indent) + res.join(' '.repeat(indent) + '\n') + '\n\n' + ' '.repeat(indent) + '</Admonition>';
    }  
    
    async __image(image) {
        if (this.skip_image_download) {
            return `![${image.token}](/${root}/${image["token"]}.png)`;
        }

        const result = await this.downloader.__downloadImage(image.token)
        const root = this.target === 'saas' ? 'img' : 'byoc'
        result.body.pipe(fs.createWriteStream(`${this.downloader.target_path}/${image["token"]}.png`));
        return `![${image.token}](/${root}/${image["token"]}.png)`;
    }

    async __iframe(iframe) {
        if (iframe['component']['iframe_type'] !== 8) {
            return '';
        } else if (this.skip_image_download) {
            const url = new URL(decodeURIComponent(iframe.component.url))
            const root = this.target === 'saas' ? 'img' : 'byoc'
            const key = url.pathname.split('/')[2]
            const node = url.searchParams.get('node-id').split('-').join(":") 

            const caption = (await this.downloader.__fetchCaption(key, node)).nodes[node].document.name;
            return `![${caption}](/${root}/${caption}.png)`;
        } else {
            const url = new URL(decodeURIComponent(iframe.component.url))
            const root = this.target === 'saas' ? 'img' : 'byoc'
            const key = url.pathname.split('/')[2]
            const node = url.searchParams.get('node-id').split('-').join(":") 

            const caption = (await this.downloader.__fetchCaption(key, node)).nodes[node].document.name;
            const result = await this.downloader.__downloadIframe(key, node);
            result.body.pipe(fs.createWriteStream(`${this.downloader.target_path}/${caption}.png`));
            return `![${caption}](/${root}/${caption}.png)`;
        }
    }

    async __table(table, indent) {
        const cells = table['cells'];
        const properties = table['property'];
        const cell_blocks = cells.map(cell => this.__retrieve_block_by_id(cell).children);
        const cell_texts = await Promise.all(cell_blocks.map(async (cell) => {
            let blocks = cell.map(block => this.__retrieve_block_by_id(block));
            return (await this.__markdown(blocks, 1)).replace(/\n/g, '<br> ');
        }));
        const cell_lengths = cell_texts.map(cell => cell.length);
        const cell_length_matrix = chunkArray(cell_lengths, properties['column_size']);

        let rows = [];
        let row_length_matrix = [];
        if (properties['row_size'] * properties['column_size'] === cells.length) {
            for (let i = 0; i < cell_texts.length; i += properties['column_size']) {
                rows.push(cell_texts.slice(i, i + properties['column_size']));
                row_length_matrix.push(cell_length_matrix[Math.floor(i / properties['column_size'])]);
            }

            const row_template = row_length_matrix.reduce((acc, curr) => acc.map((val, i) => Math.max(val, curr[i])));
            const table_header_divider = row_template.map(val => '-'.repeat(val));
            rows.splice(1, 0, table_header_divider);
            rows = rows.map(row => this.__format_table_row(row, row_template)).join('\n');
        }

        return '\n' + ' '.repeat(indent) + rows.replace(/\n/g, '\n' + ' '.repeat(indent));
    }  
    
    __format_table_row(row, temp) {
        for (let i = 0; i < temp.length; i++) {
            if (row[i].length < temp[i]) {
                row[i] += ' '.repeat(temp[i] - row[i].length);
            }
        }

        return '| ' + row.join(' | ') + ' |';
    }

    __retrieve_block_by_id(block_id) {
        return this.page_blocks.find(x => x['block_id'] === block_id);
    }

    async __text_run(element, elements) {
        let content = element['text_run']['content'];
        let style = element['text_run']['text_element_style'];

        if (!content.match(/^\s+$/)) {
            if (style['inline_code']) {
                content = this.__style_markdown(element, elements, 'inline_code', '`');
            } else {
                if (style['bold']) {
                    content = this.__style_markdown(element, elements, 'bold', '**');
                }

                if (style['italic']) {
                    content = this.__style_markdown(element, elements, 'italic', '*');
                }

                if (style['strikethrough']) {
                    content = this.__style_markdown(element, elements, 'strikethrough', '~~');
                }

                if (style['underline']) {
                    content = this.__style_markdown(element, elements, 'underline', '__');
                }

                if ('link' in style) {
                    const url = await this.__convert_link(decodeURIComponent(style['link']['url']))

                    if (url) {
                        content = `[${content}](${url})`;
                    } else {
                        console.log(`Cannot find ${content}`)
                    }
                    
                }
            }
        }

        return content;
    }

    __style_markdown(element, elements, style_name, decorator) {
        let content = element['text_run']['content'];
        let style = element['text_run']['text_element_style'];

        let prev = elements[elements.indexOf(element) - 1] || null;
        let next = elements[elements.indexOf(element) + 1] || null;

        if (!content.match(/^\s+$/)) {
            // single element
            if ((!prev || (prev && !prev['text_run']['text_element_style'][style_name])) && style[style_name] && (!next || (next && !next['text_run']['text_element_style'][style_name]))) {
                content = `${decorator}${content}${decorator}`;
            }

            // first element
            if ((!prev || (prev && !prev['text_run']['text_element_style'][style_name])) && style[style_name] && next && next['text_run']['text_element_style'][style_name]) {
                content = `${decorator}${content}`;
            }

            // last element
            if (prev && prev['text_run']['text_element_style'][style_name] && style[style_name] && (!next || (next && !next['text_run']['text_element_style'][style_name]))) {
                content = `${content}${decorator}`;
            }

            // middle element
            if (prev && prev['text_run']['text_element_style'][style_name] && style[style_name] && next && next['text_run']['text_element_style'][style_name]) {
                content = `${content}`;
            }
        }

        return content;
    }

    async __mention_doc(element) {
        let title = element['mention_doc']['title'];
        let url = await this.__convert_link(decodeURIComponent(element['mention_doc']['url']));
        if (url) {
            return `[${title}](${url})`;
        } else {
            console.log(`Cannot find ${title}`)
            return title;
        }
        
    }

    async __convert_link(url) {
        if (url.includes('zilliverse')) {
            url = new URL(url);
            const token = url.pathname.split('/').pop();
            const header = url.hash.slice(1);
            const key = url.pathname.split('/')[1] === 'wiki' ? 'origin_node_token' : 'obj_token';
            const page = this.pages.filter(x => x[key] === token)[0];

            if (page) {
                const title = page['title'];
                const meta = await this.__is_to_publish(title);
                const slug = meta['slug'];
                // if (this.titles[title]) {
                //     slug = this.titles[title]
                // } else {
                //     slug = slugify(title, {strict: true, lower: true})
                //     this.titles[title] = slug
                //     fs.writeFileSync('plugins/lark-docs/meta/titles.json', JSON.stringify(this.titles, null, 4))
                // }

                let newUrl = this.current_page && this.current_page.endsWith("/") ? this.target === 'saas' ? `./docs/${slug}` : `./byoc/${slug}` : `./${slug}`;

                if (header) {
                    const headerBlock = page['blocks']['items'].filter(x => x['block_id'] === header)[0];

                    if (headerBlock) {
                        const blockType = this.block_types[headerBlock['block_type'] - 1];
                        if (parseInt(blockType.slice(-1)) <= 9) {
                            const title = await this.__text_elements(headerBlock[blockType]['elements']);
                            const slug = slugify(title, {strict: true, lower: true});
                            newUrl += `#${slug}`;
                        }
                    }
                }

                url = newUrl.replace(/\/\//g, "/");
            }
        }

        if (url.startsWith('https://docs.zilliz.com')) {
            url = url.replace('https://docs.zilliz.com', '');
        }
            

        return url;
    }

    async __text_elements(elements) {
        let paragraph = "";
        for (let element of elements) {
            if ('text_run' in element) {
                paragraph += await this.__text_run(element, elements);
            }
            if ('mention_doc' in element) {
                paragraph += await this.__mention_doc(element);
            }
        }

        return paragraph;
    }

    async __fetch_sdk_versions (url) {
        const sdks = {
            python: 'https://github.com/milvus-io/pymilvus/releases',
            node: 'https://github.com/milvus-io/milvus-sdk-node/releases',
            java: 'https://github.com/milvus-io/milvus-sdk-java/releases',
            go: 'https://github.com/milvus-io/milvus-sdk-go/releases',
        }

        for (let key in sdks) {
            if (sdks[key]) {
                const res = await fetch(sdks[key])
                const $ = cheerio.load(await res.text())
                const version = $('section > h2').first().text().match(/\d+\.\d+\.\d+/)[0]
                const released = $('section').first().find('relative-time').attr('datetime')
                sdks[key] = {
                    version: version,
                    released: released
                }
            }
        }

        return sdks
    }
}

function chunkArray(arr, size) {
    let result = [];
    for (let i = 0; i < arr.length; i += size) {
        result.push(arr.slice(i, i + size));
    }
    return result;
}

module.exports = larkDocWriter