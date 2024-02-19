const fetch = require('node-fetch')
const tokenFetcher = require('./larkTokenFetcher.js')
const fs = require('fs')
require('dotenv').config()

const FEISHU_HOST = process.env.FEISHU_HOST
const SPACE_ID = process.env.SPACE_ID

class larkDocScraper {
    constructor(root_node, base_app_id, target_type, doc_source_dir) {
        this.docs = undefined
        this.root = root_node
        this.base = base_app_id
        this.target_type = target_type
        this.doc_source_dir = doc_source_dir
    }

    async fetch(recursive=false, page_token=null) {
        if (!page_token) {
            page_token = this.root
        }

        const fetcher = new tokenFetcher()
        await fetcher.fetchToken()
        this.token = await fetcher.token()

        if (this.target_type == "wiki") {
            let url = `${FEISHU_HOST}/open-apis/wiki/v2/spaces/get_node?token=${page_token}`
            let res = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': `Bearer ${this.token}`
                }
            })

            let jres = await res.json()

            if (jres.code == 0) {
                this.docs = jres.data.node
                await this.__fetch_wiki_children(this.docs, recursive)
                await this.__fetch_blocks(this.docs)
            }
        }

        if (this.target_type == "drive") {
            if (page_token != null) {
                var page = fs.readdirSync(this.doc_source_dir).filter(file => {
                    var source = JSON.parse(fs.readFileSync(`${this.doc_source_dir}/${file}`, 'utf8'))
                    return source.token == page_token
                })

                if (page.length > 0) {
                    page = page[0]
                    var source = JSON.parse(fs.readFileSync(`${this.doc_source_dir}/${page}`, 'utf8'))

                    if (source.type === "docx") {
                        await this.__fetch_blocks(source)
                        fs.writeFileSync(`${this.doc_source_dir}/${page}`, JSON.stringify(source, null, 2))
                        console.log(`Fetched ${page}`)
                    }

                    if (source.type === "folder") {
                        this.docs = source
                        await this.__fetch_drive_children(this.docs.token, null, false)
                    }
                }
            }

            if (recursive) {
                let url = `${FEISHU_HOST}/open-apis/drive/explorer/v2/folder/${page_token}/meta`
                let res = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8',
                        'Authorization': `Bearer ${this.token}`
                    }
                })

                let jres = await res.json()

                if (jres.code == 0) {
                    this.docs = jres.data
                    await this.__fetch_drive_children(this.docs.token, null, recursive)
                }
            }
        }
    }    

    async __wait(duration) {
        return new Promise((resolve, _) => {
            setTimeout(() => {
                resolve()
            }, duration)
        })
    }

    async __base() {
        const fetcher = new tokenFetcher()
        await fetcher.fetchToken()
        const token = await fetcher.token()

        let url = `${FEISHU_HOST}/open-apis/bitable/v1/apps/${this.base}/tables`
        const table_id = (await (await fetch(url, {
            method: "get",
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${token}`
            }
        })).json()).data.items[0].table_id

        url = `${FEISHU_HOST}/open-apis/bitable/v1/apps/${this.base}/tables/${table_id}/records?page_size=500`
        const records = (await (await fetch(url, {
            method: "get",
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${token}`
            }
        })).json()).data.items

        const slugs = {}
        if (records.length > 0) {
            for (let record of records) {
                if (record.fields.Slug) {
                    slugs[record.fields.Docs.link.split('/').pop()] = { slug: record.fields.Slug, title: record.fields.Docs.text }
                } else {
                    throw new Error(`Slug field not found for record ${record.fields['Seq. ID']}`)
                }
            }
        }
        
        this.slugs = slugs
    }

    async __slugify(token, title=null) {
        if (!this.slugs) {
            await this.__base(this.base)
        }

        var slug = this.slugs[token]

        if (!slug) {
            const record = Object.keys(this.slugs).filter(key => this.slugs[key].title == title)
            if (record.length > 0) {
                slug = this.slugs[record[0]] 
            }
        }

        if (slug) {
            slug = slug.slug
        }

        if (slug instanceof Array) {
            if (slug[0] instanceof Object) {
                return slug[0][slug[0].type]
            }
        }

        return slug
    }

    async __fetch_wiki_children(node, recursive=false) {
        node.slug = await this.__slugify(node.node_token, node.title)
        await this.__fetch_blocks(node)
        if (node.has_child) {
            let url = `${FEISHU_HOST}/open-apis/wiki/v2/spaces/${SPACE_ID}/nodes?page_size=50&parent_node_token=${node.origin_node_token}`
            let res = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': `Bearer ${this.token}`
                }
            })

            let jres = await res.json()

            if (jres.code == 0) {
                node.children = await Promise.all(jres.data.items.map(async item => {
                    item.slug = await this.__slugify(item.node_token, item.title)
                    return item
                }))
                
                fs.writeFileSync(`${this.doc_source_dir}/${node.origin_node_token}.json`, JSON.stringify(node, null, 2))
                console.log(`Fetched ${node.origin_node_token}.json`)
                
                if (recursive) {
                    await Promise.all(node.children.map(async child => {
                        await this.__fetch_wiki_children(child, recursive)
                        await this.__fetch_blocks(child)
                        child.slug = await this.__slugify(child.node_token, child.title)
                        fs.writeFileSync(`${this.doc_source_dir}/${child.origin_node_token}.json`, JSON.stringify(child, null, 2))
                        console.log(`Fetched ${child.origin_node_token}.json`)
                        delete child.children
                        delete child.blocks
                    }))
                }
            } else if (jres.code == 99991400) {
                const timeout = res.headers['x-ogw-ratelimit-reset']
                await this.__wait(timeout * 1000)
                await this.__fetch_wiki_children(node, recursive)
            }
        } else {
            fs.writeFileSync(`${this.doc_source_dir}/${node.origin_node_token}.json`, JSON.stringify(node, null, 2))
            console.log(`Fetched ${node.origin_node_token}.json`)
        }
    }

    async __fetch_drive_children(folder_token, page_token=null, recursive=false) {
        var page_token_expr = page_token ? `&page_token=${page_token}` : ''

        let url = `${FEISHU_HOST}/open-apis/drive/v1/files?folder_token=${folder_token}${page_token_expr}`
        let res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this.token}`
            }
        })

        let jres = await res.json()

        if (jres.code == 0) {
            this.docs.children = jres.data.files
            this.docs.slug = await this.__slugify(this.docs.token, this.docs.name)

            if (jres.has_more) {
                await this.__fetch_drive_children(folder_token, jres.data.next_page_token, recursive)
            }

            fs.writeFileSync(`${this.doc_source_dir}/${folder_token}.json`, JSON.stringify(this.docs, null, 2))
            console.log(`Fetched ${folder_token}.json`)

            if (recursive) {
                for (let child of this.docs.children) {
                    if (child.type == 'folder') {
                        this.docs = child
                        this.docs.slug = await this.__slugify(this.docs.token, this.docs.name)
                        await this.__fetch_drive_children(child.token, null, recursive)
                    }
    
                    if (child.type == 'docx') {
                        await this.__fetch_blocks(child)
                        child.slug = await this.__slugify(child.token, child.name)
                        fs.writeFileSync(`${this.doc_source_dir}/${child.token}.json`, JSON.stringify(child, null, 2))
                        console.log(`Fetched ${child.token}.json`)
                    }
                }
            }
        }  else if (jres.code == 99991400) {
            const timeout = res.headers['x-ogw-ratelimit-reset']
            await this.__wait(timeout * 1000)
            await this.__fetch_drive_children(folder_token, page_token, recursive)
        }
    }

    async __fetch_blocks(node, page_token=null) {
        var token;
        const keys = Object.keys(node)
        if (keys.includes('obj_type') && node.obj_type == 'docx') {
            token = node.obj_token
        } else if (keys.includes('type') && node.type == 'docx') {
            token = node.token
        }

        if (token) {
            const page_token_expr = page_token ? `?page_token=${page_token}` : ''
            let url = `${FEISHU_HOST}/open-apis/docx/v1/documents/${token}/blocks${page_token_expr}`
            let res = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': `Bearer ${this.token}`
                }
            })

            let jres = await res.json()

            if (jres.code == 0) {
                if (page_token === null) {
                    node.blocks = {}
                    node.blocks.items = jres.data.items
                    node.blocks.counts = jres.data.items.length
                } else {
                    jres.data.items.forEach(item => node.blocks.items.push(item))
                    node.blocks.counts = node.blocks.items.length
                }

                if (jres.data.has_more && jres.data.page_token) {
                    await this.__fetch_blocks(node, jres.data.page_token)
                }
            } else if (jres.code == 99991400) {
                const timeout = res.headers['x-ogw-ratelimit-reset']
                await this.__wait(timeout * 1000)
                await this.__fetch_blocks(node, page_token)
            }
        }
    }
}

module.exports = larkDocScraper
