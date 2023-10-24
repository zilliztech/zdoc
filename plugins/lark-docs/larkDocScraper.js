const fetch = require('node-fetch')
const tokenFetcher = require('./larkTokenFetcher.js')
require('dotenv').config()

const FEISHU_HOST = process.env.FEISHU_HOST
const SPACE_ID = process.env.SPACE_ID

class larkDocScraper {
    constructor(root_node) {
        this.docs = undefined
        this.root = root_node
    }

    async __wait(duration) {
        return new Promise((resolve, _) => {
            setTimeout(() => {
                resolve()
            }, duration)
        })
    }

    async fetch() {
        const fetcher = new tokenFetcher()
        await fetcher.fetchToken()
        this.token = await fetcher.token()

        let url = `${FEISHU_HOST}/open-apis/wiki/v2/spaces/get_node?token=${this.root}`
        let res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json; charset=utf-8',
                'Authorization': `Bearer ${this.token}`
            }
        })

        res = await res.json()

        if (res.code == 0) {
            this.docs = res.data.node
            await this.__fetch_children(this.docs)
            await this.__fetch_blocks(this.docs)
        }
    }

    async __fetch_children(node) {
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
                node.children = res.data.items
                for (let child of node.children) {
                    delete child.creator
                    delete child.node_create_time
                    delete child.node_token
                    delete child.node_type
                    delete child.origin_space_id
                    delete child.owner
                    delete child.space_id
                    delete child.parent_node_token
                    delete child.obj_create_time
                    delete child.obj_edit_time
                    await this.__fetch_children(child)
                    await this.__fetch_blocks(child)
                }
            } else if (res.code == 429) {
                timeout = res.headers['x-ogw-ratelimit-reset']
                await this.__wait(timeout * 1000)
            }
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

//     async __fetch_more(node, page_token) {
//         let url = `${FEISHU_HOST}/open-apis/docx/v1/documents/${node.obj_token}/blocks?page_token=${page_token}`
//         let res = await fetch(url, {
//             headers: {
//                 'Content-Type': 'application/json; charset=utf-8',
//                 'Authorization': `Bearer ${this.token}`
//             }
//         })

//         res = await res.json()

//         if (node.obj_token === "NBPSdPSgsohOoxx0qIjcIogmnsd") {
//             console.log(res)
//         }

//         if (res.code == 0) {
//             node.blocks.items = node.blocks.items.concat(res.data.items)
//             node.blocks.counts = len(node.blocks.items)
//         } 

//         if (res.data.has_more && res.data.page_token) {
//             await this.__fetch_more(node, res.page_token)
//         }

//         if (res.code == 429) {
//             timeout = res.headers['x-ogw-ratelimit-reset']
//             await this.__wait(timeout * 1000)
//         }
//     }
}

module.exports = larkDocScraper