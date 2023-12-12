const fetch = require('node-fetch')
const tokenFetcher = require('./larkTokenFetcher.js')
const fs = require('fs')
require('dotenv').config()

const FEISHU_HOST = process.env.FEISHU_HOST
const SPACE_ID = process.env.SPACE_ID

class larkDocScraper {
    constructor(root_node, base_app_id) {
        this.docs = undefined
        this.root = root_node
        this.base = base_app_id
    }

    async fetch(recursive=false, page_token=null) {
        if (!page_token) {
            page_token = this.root
        }

        const fetcher = new tokenFetcher()
        await fetcher.fetchToken()
        this.token = await fetcher.token()

        let url = `${FEISHU_HOST}/open-apis/wiki/v2/spaces/get_node?token=${page_token}`
        let res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this.token}`
            }
        })

        res = await res.json()

        if (res.code == 0) {
            this.docs = res.data.node
            await this.__fetch_children(this.docs, recursive)
            await this.__fetch_blocks(this.docs)
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
        records.map(record => slugs[record.fields.Docs] = record.fields.Slug )

        this.slugs = slugs
    }

    async __slugify(title) {

        if (fs.existsSync('plugins/lark-docs/meta/titles.json')) {
            if (!this.titles) {
                this.titles = JSON.parse(fs.readFileSync('plugins/lark-docs/meta/titles.json'))
            }

            if (!this.slugs) {
                await this.__base(this.base)
            }
    
            if (title in this.slugs) {
                return this.slugs[title]
            } else if (title in this.titles) {
                return this.titles[title]
            }
        } else {
            throw new Error('Please run `fetch` first')
        }
    }

    async __fetch_children(node, recursive=false) {
        node.slug = await this.__slugify(node.title)
        await this.__fetch_blocks(node)
        if (node.has_child) {
            let url = `${FEISHU_HOST}/open-apis/wiki/v2/spaces/${SPACE_ID}/nodes?page_size=50&parent_node_token=${node.origin_node_token}`
            let res = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': `Bearer ${this.token}`
                }
            })

            res = await res.json()

            if (res.code == 0) {
                node.children = await Promise.all(res.data.items.map(async item => {
                    item.slug = await this.__slugify(item.title)
                    return item
                }))
                
                fs.writeFileSync(`plugins/lark-docs/meta/sources/${node.origin_node_token}.json`, JSON.stringify(node, null, 2))
                

                if (recursive) {
                    for (let child of node.children) {
                        await this.__fetch_children(child, recursive)
                        await this.__fetch_blocks(child)
                        child.slug = await this.__slugify(child.title)
                        fs.writeFileSync(`plugins/lark-docs/meta/sources/${child.origin_node_token}.json`, JSON.stringify(child, null, 2))
                        delete child.children
                        delete child.blocks
                    }
                }
            } else if (res.code == 429) {
                timeout = res.headers['x-ogw-ratelimit-reset']
                await this.__wait(timeout * 1000)
            }
        } else {
            fs.writeFileSync(`plugins/lark-docs/meta/sources/${node.origin_node_token}.json`, JSON.stringify(node, null, 2))
        }
    }

    async __fetch_blocks(node, page_token=null) {
        if (node.obj_type == 'docx') {
            let url = page_token ? `${FEISHU_HOST}/open-apis/docx/v1/documents/${node.obj_token}/blocks?page_token=${page_token}` : `${FEISHU_HOST}/open-apis/docx/v1/documents/${node.obj_token}/blocks`
            let res = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': `Bearer ${this.token}`
                }
            })

            res = await res.json()

            if (res.code == 0) {
                if (page_token === null) {
                    node.blocks = {}
                    node.blocks.items = res.data.items
                    node.blocks.counts = res.data.items.length
                } else {
                    res.data.items.forEach(item => node.blocks.items.push(item))
                    node.blocks.counts = node.blocks.items.length
                }
            } 

            if (res.data.has_more && res.data.page_token) {
                await this.__fetch_blocks(node, res.data.page_token)
            }

            if (res.code == 429) {
                timeout = res.headers['x-ogw-ratelimit-reset']
                await this.__wait(timeout * 1000)
            }
        }
    }
}

module.exports = larkDocScraper