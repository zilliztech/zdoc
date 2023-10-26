const fs = require('node:fs')

const iterate_dir = (dir, descriptions) => {
    const paths = fs.readdirSync(dir)

    return paths.map((path) => {
        if (fs.statSync(`${dir}/${path}`).isDirectory()) {

            if (fs.existsSync(`${dir}/${path}/_category_.json`)) {
                const category = JSON.parse(fs.readFileSync(`${dir}/${path}/_category_.json`))
                const idx = category.position
                const title = category.link.title
                const slug = category.link.slug
                const description = descriptions[title]
                let groups = iterate_dir(`${dir}/${path}`, descriptions)
                groups = groups.filter((group) => group !== undefined)
                groups.sort((a, b) => a.spos - b.spos)

                return {
                    idx,
                    title,
                    slug,
                    description,
                    groups: [...groups]
                }                
            } 
        }

        if (fs.statSync(`${dir}/${path}`).isFile() && path.endsWith('.md')) {
            const file = fs.readFileSync(`${dir}/${path}`).toString()
            const title = file.split('\n').filter((line) => line.startsWith('# '))[0].replace('#', '').trim()
            const slug = file.split('\n').filter((line) => line.startsWith('slug: '))[0].replace('slug: /', '').trim()
            const tag = file.split('\n').filter((line) => line.startsWith('beta: '))[0].replace('beta: ', '').trim()
            const colab = file.split('\n').filter((line) => line.startsWith('notebook: '))[0].replace('notebook: ', '').trim()
            const github = colab
            const spos = parseInt(file.split('\n').filter((line) => line.startsWith('sidebar_position: '))[0].replace('sidebar_position: ', '').trim())

            return {
                spos,
                title,
                slug,
                colab: colab === 'FALSE' ? false : true,
                github: github === 'FALSE' ? false : true,
                tag: tag === 'FALSE' ? false : true,
            }
        }
    }).sort((a, b) => a.idx - b.idx)
}

module.exports = function (context, options) {
    return {
        name: 'landing-page',
        async loadContent() {
            const descriptions = JSON.parse(fs.readFileSync('./plugins/landing-page/meta/categories.json'))
            const blocks = iterate_dir(`docs/tutorials`, descriptions)
            return blocks 
        },
        async contentLoaded({content, actions}) {
            const { setGlobalData } = actions
            setGlobalData( {blocks: content });
        }
    }
}