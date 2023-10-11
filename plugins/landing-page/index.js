const fs = require('node:fs')

const iterate_dir = (dir) => {
    const paths = fs.readdirSync(dir)

    return paths.map((path) => {
        if (fs.statSync(`${dir}/${path}`).isDirectory()) {

            if (fs.existsSync(`${dir}/${path}/_category_.json`)) {
                const category = JSON.parse(fs.readFileSync(`${dir}/${path}/_category_.json`))
                const group = category.position
                const title = category.link.title
                const slug = category.link.slug
                let members = iterate_dir(`${dir}/${path}`)
                members = members.filter((member) => member !== undefined)
                members.sort((a, b) => a.group - b.group)

                return {
                    group,
                    title,
                    slug,
                    members,
                }                
            } 
        }

        if (fs.statSync(`${dir}/${path}`).isFile() && path.endsWith('.md')) {
            const file = fs.readFileSync(`${dir}/${path}`).toString()
            const title = file.split('\n').filter((line) => line.startsWith('# '))[0].replace('#', '').trim()
            const slug = file.split('\n').filter((line) => line.startsWith('slug: '))[0].replace('slug: /', '').trim()
            const group = parseInt(file.split('\n').filter((line) => line.startsWith('sidebar_position: '))[0].replace('sidebar_position: ', '').trim())

            return {
                group,
                title,
                slug,
            }
        }
    }).sort((a, b) => a.group - b.group)
}

module.exports = function (context, options) {
    return {
        name: 'landing-page',
        async loadContent() {
            const pages = iterate_dir(`docs/tutorials`)
            return pages 
        },
        async contentLoaded({content, actions}) {
            const { setGlobalData } = actions
            setGlobalData( {pages: content });
        }
    }
}