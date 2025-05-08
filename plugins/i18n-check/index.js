const fetch = require('node-fetch')
const dayjs = require('dayjs')
const duration = require('dayjs/plugin/duration')
const relativeTime = require("dayjs/plugin/relativeTime");
const tokenFetcher = require('../lark-docs/larkTokenFetcher')

dayjs.extend(duration)
dayjs.extend(relativeTime)
require('dotenv').config();

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms))

const fetch_access_token = async () => {
    const fetcher = new tokenFetcher()
    await fetcher.fetchToken()
    const token = await fetcher.token()

    return token;
}

const list_records = async (base) => {
    const token = await fetch_access_token();
    const [ app_id, table_id ] = base.split(':');
    let response, data;

    const url = `${process.env.FEISHU_HOST}/open-apis/bitable/v1/apps/${app_id}/tables/${table_id}/records?page_size=500`
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8'
    }

    response = await fetch(url, { headers })
    data = await response.json()

    if (response.status === 429) {
        const timeout = response.headers['x-ogw-ratelimit-reset']
        await wait(timeout * 1000)
        return await list_records(base)
    }

    return data.data.items
}

const update_record = async (base, record_id, field, value) => {
    const token = await fetch_access_token();
    const [ app_id, table_id ] = base.split(':');

    const url = `${process.env.FEISHU_HOST}/open-apis/bitable/v1/apps/${app_id}/tables/${table_id}/records/${record_id}`
    const headers = {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8'
    }

    const body = {
        "fields": {
            [field]: value
        }
    }

    const response = await fetch(url, {
        method: 'PUT',
        headers,
        body: JSON.stringify(body)
    })
    const data = await response.json();

    if (response.status === 429) {
        const timeout = response.headers['x-ogw-ratelimit-reset']
        await wait(timeout * 1000)
        return await update_record(base, record_id, field, value)
    }

    return data.data.record.record_id
}

const get_wiki_node = async (token) => {
    const access_token = await fetch_access_token();

    const url = `${process.env.FEISHU_HOST}/open-apis/wiki/v2/spaces/get_node?token=${token}`;
    const headers = {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json; charset=utf-8'
    }

    const response = await fetch(url, { headers })
    const data = await response.json();

    if (response.status === 429) {
        const timeout = response.headers['x-ogw-ratelimit-reset']
        await wait(timeout * 1000)
        return await get_wiki_node(token)
    }

    return data.data.node
}

const get_docx_blocks = async (id, token=null, blocks=[]) => {
    const access_token = await fetch_access_token();

    const url = `${process.env.FEISHU_HOST}/open-apis/docx/v1/documents/${id}/blocks${token? `?page_token=${token}` : ''}`;
    const headers = {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json; charset=utf-8'
    }

    const response = await fetch(url, { headers })
    const data = await response.json();

    if (response.status === 429) {
        const timeout = response.headers['x-ogw-ratelimit-reset']
        await wait(timeout * 1000)
        return await get_docx_blocks(id, token, blocks)
    }

    blocks = blocks.concat(data.data.items)

    if (data.data.has_more) {
        return await get_docx_blocks(id, data.page_token, blocks)
    }

    return blocks

}

const check_i18n = async (src, dest) => {
    const src_node = await get_wiki_node(src.split('/').pop());
    const dest_node = await get_wiki_node(dest.split('/').pop());

    if (!src_node || !dest_node) {
        console.log(`Source or destination node not found: ${src} or ${dest}`);
        return;
    }

    let src_ahead, src_ahead_diff;
    let src_blocks, dest_blocks;

    // check last modify time
    const src_last_modify = dayjs.unix(src_node.obj_edit_time);
    const dest_last_modify = dayjs.unix(dest_node.obj_edit_time);

    if (src_last_modify.isAfter(dest_last_modify)) {
        src_ahead = true;
        src_ahead_diff = dayjs.duration(src_last_modify.diff(dest_last_modify)).humanize().toUpperCase();
        console.log(`The source doc page is ${src_ahead_diff} newer than the destination doc page.`)
    }

    // check doc structure
    src_blocks = await get_docx_blocks(src_node.obj_token);
    dest_blocks = await get_docx_blocks(dest_node.obj_token);

    return {
        src_ahead,
        src_ahead_diff,
        src_blocks,
        dest_blocks
    };
}

const check_last_modify = async (base, record) => {
    const src = record.fields.Source.link;
    const dest = record.fields.Target.link;

    const { src_ahead, src_ahead_diff } = await check_i18n(src, dest);

    if (src_ahead) {
        await update_record(base, record.id, "Source Ahead", src_ahead_diff)
    } else {
        await update_record(base, record.id, "Source Ahead", "NORMAL")
    }
}

const check_doc_structure = async (src_blocks, dest_blocks) => {
    // check block count
    const src_block_count = src_blocks.length;
    const dest_block_count = dest_blocks.length;

    if (src_block_count !== dest_block_count) {
        console.log(`The source doc has ${src_block_count} blocks, while the destination doc has ${dest_block_count} blocks. Need further inspection.`);

        // TODO: check block content
        
    }
}

module.exports = (context, options) => {
    return {
        name: 'i18n-check',
        extendCli(cli) {
            cli
                .command('i18n-check')
                .option('-l, --locale <locale>', 'Locale to check')
                .option('-s, --source <doc>', 'Source doc to check')
                .action(async (opts) => {
                    const locale = opts.locale || 'zh-CN';
                    const base = options[locale].base;
                    const source = opts.source;
                    const records = await list_records(base, locale);
                    const langs = ['zh-CN', 'ja-JP'];

                    if (!base) throw new Error('Please specify the Feishu base token in `base:table` in `docusaurus.config.js`.');
                    if (!(langs.includes(locale))) throw new Error(`Unsupported locale ${locale}.`);

                    if (!source) {
                        console.log('Checking all source docs...');

                        // TODO: check all source docs with rate throttling
                        for (const record of records) {
                            if (!(record.fields.Target.text === 'N/A')) {
                                try {
                                    await check_last_modify(base, record);
                                    await new Promise(resolve => setTimeout(resolve, 1000));
                                } catch (error) {
                                    console.error(error);
                                }
                            }
                        }
                    } else {
                        console.log(`Checking ${source}...`);
                        const record = records.find(record => record.fields.Source.text === source);

                        if (!record) throw new Error(`Source doc ${source} not found.`);
                        if (!record.fields.Target.text === 'N/A') throw new Error(`Source doc ${source} has no ${field} version.`);

                        await check_last_modify(base, record);
                    }
                })
        }
    }
}