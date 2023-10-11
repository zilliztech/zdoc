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
    const { lang, parents } = this.options
    const specifications = await this.clean()

    const env = new nunjucks.Environment(
      new nunjucks.FileSystemLoader(`plugins/apifox-docs/templates/${lang}`),
      {
        autoescape: false,
      }
    )

    env.addFilter('res_format', this.res_format)
    env.addFilter('req_format', this.req_format)
    env.addFilter('list_error', this.list_error)
    env.addFilter('get_example', this.get_example)

    const template = env.getTemplate("reference.md")

    for (const page_url of Object.keys(specifications.paths)) {
      for (const method of Object.keys(specifications.paths[page_url])) {
        const query_params = []
        const path_params = []
        const req_bodies = []

        let res_body;
        let res_desc;

        const page_title = specifications.paths[page_url][method].summary
        const page_excerpt = specifications.paths[page_url][method].description
        const page_parent = parents.filter(x => x === specifications.paths[page_url][method].tags[0])[0].split(' ')[0]
        const page_slug = this.get_slug(page_title)
        const page_method = method.toLowerCase()
        const host = lang === 'zh-CN' ? 'cloud.zilliz.com.cn' : 'zillizcloud.com'
        const condition = (page_slug.includes('cloud') || page_slug.includes('cluster') || page_slug.includes('import'))
        const server = condition ? `https://controller.api.{cloud-region}.${host}` : "https://{cluster_endpoint}"

        if (specifications.paths[page_url][method].parameters) {
          for (const param of specifications.paths[page_url][method].parameters) {
            if (param.in == 'query') {
              query_params.push(param)
            }

            if (param.in == 'path') {
              path_params.push(param)
            }
          }
        }

        if (specifications.paths[page_url][method].requestBody) {
          const schema = specifications.paths[page_url][method].requestBody.content["application/json"].schema
          if (schema.oneOf) {
            for (const req_body of schema.oneOf) {
              req_bodies.push(req_body)
            }
          } else {
            req_bodies.push(schema)
          }
        }

        if (specifications.paths[page_url][method].responses) {
          res_desc = specifications.paths[page_url][method].responses['200'].description
          const schema = specifications.paths[page_url][method].responses['200'].content["application/json"].schema
          if (schema.oneOf) {
            res_body = schema.oneOf.filter(x => x.properties.data)[0]
          } else {
            res_body = schema
          }
        }

        const t = template.render({
          page_title,
          page_excerpt,
          page_slug,
          page_url,
          server,
          page_method,
          query_params,
          path_params,
          req_bodies,
          res_desc,
          res_body
        }).replaceAll(/<br>/g, '<br/>')
        
        fs.writeFileSync(`${this.options.target_path}/${page_parent}/${page_slug}.md`, t)
      }
    }
  }

  make_groups() {
    const { specifications, target_path } = this.options
    const env = new nunjucks.Environment(
      new nunjucks.FileSystemLoader(`plugins/apifox-docs/templates`),
      { autoescape: false }
    )

    const template = env.getTemplate("group.md")

    for (const group of Object.keys(specifications.tags)) {
      const slug = specifications.tags[group].name.split(' ').join('-').toLowerCase()
      const group_name = specifications.tags[group].name.split(' ')[0]
      const t = template.render({
        group_name,
        slug
      })

      const folder_path = `${target_path}/${group_name}`

      if (!fs.existsSync(folder_path)) {
        fs.mkdirSync(folder_path)
      }

      fs.writeFileSync(`${folder_path}/_category_.json`, t)
    }
  }
  
  res_format(res_body) {
    const iterate_object = function(obj) {
      let x = {}
      if (obj.type == 'object') {
        for (const key of Object.keys(obj.properties)) {
          x[key] = iterate_object(obj.properties[key])
        }
      } else if (obj.type == 'array') {
        x = iterate_array(obj.items)
      } else {
        x = obj.type
      }
  
      return x
    }

    const iterate_array = function(obj) {
      let x = [{}]
      if (obj.type == 'array') {
        for (const key of Object.keys(obj.properties)) {
          x[0][key] = iterate_object(obj.properties[key])
        }
      } else if (obj.type == 'object') {
        x[0] = iterate_object(obj)
      } 
  
      return x[0] ? x : []
    }

    const data = iterate_object(res_body)
    return JSON.stringify(data, null, 4)
  }

  req_format(req_body) {
    const iterate_object = function(obj) {
      let x = {}
      if (obj.type == 'object') {
        for (const key of Object.keys(obj.properties)) {
          x[key] = iterate_object(obj.properties[key])
        }
      } else if (obj.type == 'array') {
        x = iterate_array(obj.items)
      } else {
        x = obj.type
      }
  
      return x
    }

    const iterate_array = function(obj) {
      let x = [{}]
      if (obj.type == 'array') {
        for (const key of Object.keys(obj.properties)) {
          x[0][key] = iterate_object(obj.properties[key])
        }
      } else if (obj.type == 'object') {
        x[0] = iterate_object(obj)
      } 
  
      return x[0] ? x : []
    }

    const data = iterate_object(req_body)
    return JSON.stringify(data, null, 4)
  }

  list_error(page_slug) {
    const errgen = new ErrorGenerator()
    const page_title = page_slug.split('-').map(x => x[0].toUpperCase() + x.slice(1)).join(' ')
    let result = '|  | (to be added) |\n'

    if (Object.keys(errgen.groups).indexOf(page_title.split(' ').join('')) > -1) {
      let error_codes = errgen.groups[page_title.split(' ').join('')].sort((a,b) => parseInt(a)-parseInt(b))
      if (error_codes.length > 0) {
        result = error_codes.map(x => `| ${x.trim()} | ${errgen.get_errorcode_desc(x.trim())} |\n` ).join('')
      } 
    }

    return result
  }

  get_example(page_title) {
    const examples = fs.readFileSync(`plugins/apifox-docs/meta/examples.md`, 'utf-8').split('\n')
    const start_pos = examples.indexOf(`## ${page_title}`)
    const end_pos = examples.indexOf(examples.slice(start_pos + 1).filter(x => x.startsWith('##'))[0])

    return examples.slice(start_pos + 1, end_pos).join('\n')
  }

  get_slug(page_title) {
    console.log(page_title)
    const { lang } = this.options
    if (lang == 'zh-CN') {
      const titles = JSON.parse(fs.readFileSync(`plugins/apifox-docs/meta/titles.json`, 'utf-8'))
      return titles[page_title]
    } else {
      return page_title.split(' ').join('-').toLowerCase()
    }
  }

  async clean() {
    const { specifications, lang, strings } = this.options

    if (lang == 'zh-CN' && !strings) {
      throw new Error('Localization strings are required to generate Chinese docs')
    }

    if (lang == 'zh-CN') {
      const concatenated_strings = (await this.resti18n.localize(specifications, strings)).split('\n')
      concatenated_strings.forEach(item => eval(`specifications${item}`))
    }    

    for (const url in specifications.paths) {
      for (const method in specifications.paths[url]) {
        if (specifications.paths[url][method].parameters) {
          for (const param of specifications.paths[url][method].parameters) {
            if (param.example) {
              delete param.example
            }
          }
        }

        if (specifications.paths[url][method].requestBody) {
          if (specifications.paths[url][method].requestBody.content["application/json"].example) {
            delete specifications.paths[url][method].requestBody.content["application/json"].example
          }

          const schema = specifications.paths[url][method].requestBody.content["application/json"].schema
          if (schema.oneOf) {
            for (const req_body of schema.oneOf) {
              this.__delete_examples(req_body)
            }
          } else if (schema.anyOf) {
            for (const req_body of schema.anyOf) {
              this.__delete_examples(req_body)
            }
          } else {
            this.__delete_examples(schema)
          }
        }

        if (specifications.paths[url][method].responses) {
          const schema = specifications.paths[url][method].responses['200'].content["application/json"].schema
          if (schema.anyOf) {
            schema.oneOf = schema.anyOf
            delete schema.anyOf
            this.__delete_examples(schema.oneOf.filter(x => x.properties.data)[0])
          } else {
            this.__delete_examples(schema)
          }
        }
      }
    }

    return specifications
  }

  __delete_examples(body) {
    for (const prop in body.properties) {
      if (body.properties[prop].example) {
        delete body.properties[prop].example
      }
      if (body.properties[prop].properties) {
        this.__delete_examples(body.properties[prop])
      }
    }
  }
}

module.exports = refGen