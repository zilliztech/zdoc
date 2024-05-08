const fs = require('node:fs');
const node_path = require('node:path');
const larkDocWriter = require('./larkDocWriter');

class LarkOnePagerWriter extends larkDocWriter {
    
    async write_docs(outputDir, pageToken) {
        if (!this.records) {
            await this.__listed_docs()
        }

        const blocks = JSON.parse(fs.readFileSync(node_path.join(this.docSourceDir, `${pageToken}.json`), 'utf8')).blocks.slice(1);
        var pages = [];
        var currentPage = [];
        blocks.forEach(block => {
            if (this.records.filter(r => r.fields.Docs.link.endsWith(block.block_id))) {
                currentPage = [];
                pages.push(currentPage);
            }
            currentPage.push(block);
        });

        this.records.forEach(record => {
            if (!record.fields.Parent && !this.records.filter(r => r.fields.Parent === record["Seq. ID"]).length) {
                console.log(`Writing ${record.fields.Docs.text}.md`)
            }
            
            if (!record.fields.Parent && this.records.filter(r => r.fields.Parent === record["Seq. ID"]).length) {
                // TODO: create a folder
                console.log(`Creating folder and adding ${record.fields.Docs.text}.md`)
            }

            if (record.fields.Parent) {
                // TODO: add a page to parent folder
                console.log(`Adding ${record.fields.Docs.text}.md to parent folder`)
            }
        })
    }
}