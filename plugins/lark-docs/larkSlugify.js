const Translator = require('./baiduTranslator.js')
const Utils = require('./larkUtils.js')
const slugify = require('slugify')
const fs = require('node:fs')


class larkSlugify {

    constructor(docs) {
        this.docs = docs
        this.pages = new Utils(this.docs, 'title', `obj.obj_type === 'docx'`, true)
        
        for (let i=2;i<=9;i++) {
            this[`heading${i}s`] = new Utils(this.docs, `heading${i}`)
        }
    }

    async slugify() {

        this.pages.instances.forEach((page, index) => {
            const titles = JSON.parse(fs.readFileSync('./plugins/lark-docs/meta/titles.json', {encoding: 'utf-8', flag: 'r'}))
            if (titles[page.title]) {
                eval(`this.docs${this.pages.instance_keys[index]}.slug = titles[page.title]`)
            } else {
                eval(`this.docs${this.pages.instance_keys[index]}.slug = slugify(page.title, {lower: true, strict: true})`)
            }
        })

        const translator = new Translator('zh', 'en', '.')

        for (let i=2;i<=9;i++) {
            this[`heading${i}s`].instances.forEach(async (heading, index) => {
                const pattern = /[\p{Unified_Ideograph}\u3006\u3007][\ufe00-\ufe0f\u{e0100}-\u{e01ef}]?/gmu;
                const content = this.__headingContent(heading)
                if (content.match(pattern)) {
                    const slug = await translator.translate(content)
                    eval(`this.docs${this[`heading${i}s`].instance_keys[index]}.slug = slug`)
                } else {
                    eval(`this.docs${this[`heading${i}s`].instance_keys[index]}.slug = slugify(content, {lower: true, strict: true})`)
                }
            })
        }

        return this.docs
    }

    __headingContent(heading) {
        let content = ''
        heading.elements.map((ele) => {
            content += ele.text_run.content
        })

        return content
    }
}

module.exports = larkSlugify