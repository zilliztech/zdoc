const ErrorGenerator = require('./errGen.js')
const RestI18n = require('./resti18n.js')
const nunjucks = require("nunjucks")
const fs = require('node:fs')

class refGen {
  constructor(options) {
    this.options = options
    this.options.parents = []
    this.resti18n = new RestI18n()


    for ( const x of Object.keys(this.options.specifications.tags)) {
      this.options.parents.push(this.options.specifications.tags[x].name)
    }
  }

  async write_refs() {
    const { lang, target, parents, specifications } = this.options

    const env = new nunjucks.Environment(
      new nunjucks.FileSystemLoader(`plugins/apifox-docs/templates`),
      {
        autoescape: false,
      }
    )

    const template = env.getTemplate("reference.mdx")
    var idx = 0
    for (const page_url of Object.keys(specifications.paths)) {
      for (const method of Object.keys(specifications.paths[page_url])) {
        const specification = specifications.paths[page_url][method]

        if (specification?.["x-include-target"] && !specification["x-include-target"].includes(target)) {
          continue
        }
        
        const sidebar_position = idx; idx++;

        const page_title = lang === "zh-CN" ? specification["x-i18n"][lang].summary : specification.summary
        const page_excerpt = this.__filter_content(lang === "zh-CN" ? specification["x-i18n"][lang].description : specification.description, target)
        const page_parent = parents.filter(x => x === specification.tags[0])[0].replace("&", "and").split(' ').join('-').replace(/\(|\)/g, '').toLowerCase()
        const version = page_parent.includes('v2') ? 'v2' : 'v1'
        const upper_folder = page_parent.startsWith('cloud') || page_parent.startsWith('cluster') || page_parent.startsWith('import') || page_parent.startsWith('pipeline') || page_parent.includes('backup') || page_parent.includes('restore') ? 'control-plane' : 'data-plane'
        const page_slug = (this.get_slug(page_title)) + (version === 'v2' ? '-v2' : '')
        const page_method = method.toLowerCase()
        const specs = JSON.stringify(specification)

        const t = template.render({
          page_title,
          page_excerpt,
          page_slug,
          page_url,
          page_method,
          specs,
          sidebar_position
        }).replaceAll(/<br>/g, '<br/>')
        
        fs.writeFileSync(`${this.options.target_path}/${version}/${upper_folder}/${page_parent}/${page_slug}.mdx`, t)
      }
    }
  }  

  make_groups() {
    const { specifications, target_path } = this.options
    const env = new nunjucks.Environment(
      new nunjucks.FileSystemLoader(`plugins/apifox-docs/templates`),
      { autoescape: false }
    )

    const template = env.getTemplate("group.mdx")

    for (const group of Object.keys(specifications.tags)) {
      const slug = specifications.tags[group].name.replace("&", "and").split(' ').join('-').replace(/\(|\)/g, '').toLowerCase()
      const version = slug.includes('v2') ? 'v2' : 'v1'
      const upper_folder = slug.startsWith('cloud') || slug.startsWith('cluster') || slug.startsWith('import') || slug.startsWith('pipeline') || slug.includes('backup') || slug.includes('restore') ? 'control-plane' : 'data-plane'
      const group_name = version === 'v2' ? specifications.tags[group].name.slice(0, -5) : specifications.tags[group].name
      const descriptions = JSON.parse(fs.readFileSync('plugins/apifox-docs/meta/descriptions.json', 'utf-8'))
      const description = descriptions.filter(x => x.name === slug)[0].description
      const position = specifications.tags.map(x => x.name).indexOf(specifications.tags[group].name)
      const t = template.render({
        group_name,
        position,
        slug,
        description
      })

      const folder_path = `${target_path}/${version}/${upper_folder}/${slug}`

      if (!fs.existsSync(folder_path)) {
        fs.mkdirSync(folder_path, { recursive: true })
      }

      if (!fs.existsSync(`${target_path}/${version}/${version}.mdx`)) {
        fs.writeFileSync(`${target_path}/${version}/${version}.mdx`, template.render({
          group_name: version === 'v2' ? 'V2' : 'V1',
          position: version === 'v2' ? 1 : 2,
          slug: version,
          description: ''
        }))
      }

      if (!fs.existsSync(`${target_path}/${version}/${upper_folder}/${upper_folder}.mdx`)) {
        const title = upper_folder.startsWith('control') ? 'Control Plane' : 'Data Plane'
        const pos = upper_folder.startsWith('control') ? 1 : 2
        const desc = upper_folder.startsWith('control') ? 'This provide API endpoints for managing Zilliz Cloud clusters and resources.' : 'This provide API endpoints for managing data stored in Zilliz Cloud clusters.'

        fs.writeFileSync(`${target_path}/${version}/${upper_folder}/${upper_folder}.mdx`, template.render({
          group_name: title,
          position: pos,
          slug: `${upper_folder}-${version}`,
          description: desc
        }))
      }      

      fs.writeFileSync(`${folder_path}/${slug}.mdx`, t)
    }
  }

  get_slug(page_title) {
    console.log(page_title)
    const { lang } = this.options
    if (lang == 'zh-CN') {
      const titles = JSON.parse(fs.readFileSync(`plugins/apifox-docs/meta/titles.json`, 'utf-8'))
      return titles[page_title]
    } else {
      return page_title.replace("&", "and").split(' ').join('-').replace(/\(|\)/g, '').toLowerCase()
    }
  }

  __filter_content (markdown, targets) {
    const matches = this.__match_filter_tags(markdown)

    if (matches.length > 0) {
        var preText = markdown.slice(0, matches[0].startIndex)
        var matchText = markdown.slice(matches[0].startIndex, matches[0].endIndex)
        var postText = markdown.slice(matches[0].endIndex)
        var isTargetValid = targets.split('.').includes(matches[0].target.trim())
        var startTagLength = `<${matches[0].tag} target="${matches[0].target}">`.length
        var endTagLength = `</${matches[0].tag}>`.length

        if (matches[0].tag == 'include' && isTargetValid || matches[0].tag == 'exclude' && !isTargetValid) {
            matchText = matchText.slice(startTagLength, -endTagLength)
        }

        if (matches[0].tag == 'include' && !isTargetValid || matches[0].tag == 'exclude' &&  isTargetValid) {
            matchText = ""
        }

        markdown = this.__filter_content(preText + matchText + postText, targets)
    }

    return markdown.replace(/(\s*\n){3,}/g, '\n\n')
        .replace(/<br>/g, '<br/>')
        .replace(/(<br\/>){2,}/, "<br/>")
        .replace("<br\/></p>", "</p>")
        .replace(/\n\s*<tr>\n(\s*<td.*><p><\/p><\/td>\n)*\s*<\/tr>/g, '');
  }

  __match_filter_tags(markdown) {
      const startTagRegex = /<(include|exclude) target="(.+?)"/gm
      const endTagRegex = /<\/(include|exclude)>/gm
      const matches = [... markdown.matchAll(startTagRegex)]
      var returns = []

      matches.forEach(match => {
          var tag = match[1]
          var rest = markdown.slice(match.index)
          
          var closeTagRegex = new RegExp(`</${tag}>`, 'gm')
          var closeTagMatch = [... rest.matchAll(closeTagRegex)]
          
          var startIndex = match.index
          var endIndex = 0
          
          for (let i = 0; i < closeTagMatch.length; i++) {
              var t = markdown.slice(startIndex, startIndex+closeTagMatch[i].index+closeTagMatch[i][0].length)
          
              var startCount = t.match(startTagRegex) ? t.match(startTagRegex).length : 0
              var endCount = t.match(endTagRegex) ? t.match(endTagRegex).length : 0
      
              if (startCount === endCount) {
                  endIndex = startIndex + closeTagMatch[i].index + closeTagMatch[i][0].length
                  break
              }
          }
          
          returns.push({
              tag: tag,
              target: match[2],
              startIndex: startIndex,
              endIndex: endIndex
          })           
      })

      return returns
  }
}

module.exports = refGen