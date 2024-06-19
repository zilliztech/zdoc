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

    fs.writeFileSync('plugins/apifox-docs/meta/clean.json', JSON.stringify(specifications, null, 4))

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
    env.addFilter('prepare_entries', this.prepare_entries)
    env.addFilter('split_excerpt', this.split_excerpt)
    env.addFilter('split_example', this.split_example)

    const template = env.getTemplate("reference.md")
    var idx = 0
    for (const page_url of Object.keys(specifications.paths)) {
      for (const method of Object.keys(specifications.paths[page_url])) {
        
        const header_params = []
        const query_params = []
        const path_params = []
        const req_bodies = []
        const res_bodies = []
        const sidebar_position = idx; idx++;
        let res_desc;

        const page_title = specifications.paths[page_url][method].summary
        const page_excerpt = specifications.paths[page_url][method].description
        const page_parent = parents.filter(x => x === specifications.paths[page_url][method].tags[0])[0].split(' ').join('-').replace(/\(|\)/g, '').toLowerCase()
        const version = page_parent.includes('v2') ? 'v2' : 'v1'
        const upper_folder = page_parent.startsWith('cloud') || page_parent.startsWith('cluster') || page_parent.startsWith('import') || page_parent.startsWith('pipeline') ? 'control-plane' : 'data-plane'
        const page_slug = (this.get_slug(page_title)) + (version === 'v2' ? '-v2' : '')
        const page_method = method.toLowerCase()
        const host = lang === 'zh-CN' ? 'cloud.zilliz.com.cn' : 'zillizcloud.com'
        const condition = (page_slug.includes('cloud') || page_slug.includes('cluster') || page_slug.includes('import') || page_slug.includes('pipeline')) || page_slug.includes('project') || page_slug.includes('metrics')
        const server = condition ? `https://controller.api.\${CLOUD_REGION}.${host}` : "https://\${CLUSTER_ENDPOINT}"

        if (specifications.paths[page_url][method].parameters) {
          for (const param of specifications.paths[page_url][method].parameters) {
            if (param.in == 'query') {
              query_params.push(param)
            }

            if (param.in == 'path') {
              path_params.push(param)
            }

            if (param.in == 'header') {
              header_params.push(param)
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
            for (const res_body of schema.oneOf.filter(x => x.properties.data)) {
              res_bodies.push(res_body)
            }
          } else {
            res_bodies.push(schema)
          }
        }

        const t = template.render({
          page_title,
          page_excerpt,
          page_slug,
          page_url,
          server,
          page_method,
          header_params,
          query_params,
          path_params,
          req_bodies,
          res_desc,
          res_bodies,
          sidebar_position
        }).replaceAll(/<br>/g, '<br/>')
        
        fs.writeFileSync(`${this.options.target_path}/${upper_folder}/${version}/${page_parent}/${page_slug}.md`, t)
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
      const slug = specifications.tags[group].name.split(' ').join('-').replace(/\(|\)/g, '').toLowerCase()
      const version = slug.includes('v2') ? 'v2' : 'v1'
      const upper_folder = slug.startsWith('cloud') || slug.startsWith('cluster') || slug.startsWith('import') || slug.startsWith('pipeline') ? 'control-plane' : 'data-plane'
      const group_name = specifications.tags[group].name.split(' ')[0] + (version === 'v2' ? ' (V2)' : ' (V1)')
      const descriptions = JSON.parse(fs.readFileSync('plugins/apifox-docs/meta/descriptions.json', 'utf-8'))
      const description = descriptions.filter(x => x.name === slug)[0].description
      const position = specifications.tags.map(x => x.name).indexOf(specifications.tags[group].name)
      const t = template.render({
        group_name,
        position,
        slug,
        description
      })

      const folder_path = `${target_path}/${upper_folder}/${version}/${slug}`

      if (!fs.existsSync(folder_path)) {
        fs.mkdirSync(folder_path, { recursive: true })
      }

      if (!fs.existsSync(`${target_path}/${upper_folder}/${upper_folder}.md`)) {
        const title = upper_folder.startsWith('control') ? 'Control Plane' : 'Data Plane'
        const pos = upper_folder.startsWith('control') ? 1 : 2
        const desc = upper_folder.startsWith('control') ? 'APIs for managing Zilliz Cloud clusters and resources' : 'APIs for managing data stored in Zilliz Cloud clusters'

        fs.writeFileSync(`${target_path}/${upper_folder}/${upper_folder}.md`, template.render({
          group_name: title,
          position: pos,
          slug: upper_folder,
          description: desc
        }))
      }

      if (!fs.existsSync(`${target_path}/${upper_folder}/${version}/${version}.md`)) {
        fs.writeFileSync(`${target_path}/${upper_folder}/${version}/${version}.md`, template.render({
          group_name: version === 'v2' ? 'V2' : 'V1',
          position: version === 'v2' ? 1 : 2,
          slug: `${upper_folder}-${version}`,
          description: ''
        }))
      }

      fs.writeFileSync(`${folder_path}/${slug}.md`, t)
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
      } else if (obj.hasOwnProperty('oneOf')) {
        x = iterate_oneOf(obj.oneOf)
      } else if (obj.hasOwnProperty('anyOf')) {
        x = iterate_oneOf(obj.anyOf)
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

    const iterate_oneOf = function (items) {
      let x = { oneOf: []}
      for (const item of items) {
        x.oneOf.push(iterate_object(item))
      }

      return x
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
        if (obj.items.hasOwnProperty('anyOf')) {
          for (const item of obj.items.anyOf) {
            x = iterate_array(item)
          }
        } else {
          x = iterate_array(obj.items)
        }
      } else {
        x = obj.type
      }
      
      return x
    }

    const iterate_array = function(obj) {
      let x = []
      if (obj.type == 'array') {
        if (obj.items.hasOwnProperty('anyOf')) {
          for (const item of obj.items.anyOf) {
            x = iterate_array(item)
          }
        }

        if (obj.properties) {
          for (const key of Object.keys(obj.properties)) {
            x[0][key] = iterate_object(obj.properties[key])
          }
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
      return page_title.split(' ').join('-').replace(/\(|\)/g, '').toLowerCase()
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
            schema.oneOf = schema.anyOf
            delete schema.anyOf
            for (const req_body of schema.oneOf) {
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

        if (url.includes('v1')) {
          const parameters = specifications.paths[url][method].parameters
          this.__delete_parameters(parameters, ['dbName', 'partitionName', 'partitionNames'])

          if (specifications.paths[url][method].requestBody) {
            const schema = specifications.paths[url][method].requestBody.content["application/json"].schema
            if (schema.oneOf) {
              for (const req_body of schema.oneOf) {
                this.__delete_parameters(req_body.properties, ['dbName', 'partitionName', 'partitionNames'])
              }
            } else if (schema.anyOf) {
              schema.oneOf = schema.anyOf
              delete schema.anyOf
              for (const req_body of schema.oneOf) {
                this.__delete_parameters(req_body.properties, ['dbName', 'partitionName', 'partitionNames'])
              }
            } else {
              this.__delete_parameters(schema.properties, ['dbName', 'partitionName', 'partitionNames'])
            }
          }
        }
      }
    }

    return specifications
  }

  prepare_entries(body) {
    var entries = []

    var process_plain = function(field, name, parent_name, parent_type) {
      var format = field.format ? `(${field.format})` : ''
      var required = field.required ? '__REQUIRED__' : ''
      var default_value = field.default ? `<br/>The value defaults to ${field.default}` : ''
      var description = field.description ? field.description.replace('\n', '<br/>').trim() : ''
      var value_range = ""
      var field_name = ""

      if (parent_type == 'array' && name != '') {
        field_name = `${parent_name}[].${name}`
      } else if (parent_type == 'array') {
        field_name = `${parent_name}[]`
      } else if (parent_type == 'object') {
        field_name = `${parent_name}.${name}`
      } else {
        field_name = name
      }

      if (field.minimum && field.maximum) {
        value_range = `<br/>The value ranges from ${field.minimum} to ${field.maximum}.`
      } else if (field.minimum) {
        value_range = `<br/>The value is greater than or equal to ${field.minimum}.`
      } else if (field.maximum) {
        value_range = `<br/>The value is less than or equal to ${field.maximum}.`
      }

      entries.push(`| __${field_name.replace('.[', '[')}__ | __${field.type}__ ${format} ${required}<br/>${description}${default_value}${value_range}  |`)
    }

    var process_object = function(field, name, parent_name, parent_type) {
      var description = field.description ? field.description.replace('\n', '<br/>').trim() : ''
      var field_name = ""
      if (parent_type == 'array' && name != '') {
        field_name = `${parent_name}[].${name}`
      } else if (parent_type == 'array') {
        field_name = `${parent_name}[]`
      } else if (parent_type == 'object') {
        field_name = `${parent_name}.${name}`
      } else {
        field_name = name
      }

      entries.push(`| __${field_name.replace('.[', '[')}__ | __object__<br/>${description} |`)

      for (const prop in field.properties) {
        if (field.properties[prop].type == 'object') {
          process_object(field.properties[prop], prop, field_name, 'object')
        } else if (field.properties[prop].type == 'array') {
          process_array(field.properties[prop], prop, field_name, 'array')
        } else if (field.properties[prop].anyOf || field.properties[prop].oneOf) {
          process_composite(field.properties[prop], prop, field_name)
        } else {
          process_plain(field.properties[prop], prop, field_name, 'object')
        }
      }
    }

    var process_array = function(field, name, parent_name, parent_type) {
      var description = field.description ? field.description.replace('\n', '<br/>').trim() : ''
      var field_name = ""
      if (parent_type == 'array' && name != '') {
        field_name = `${parent_name}[].${name}`
      } else if (parent_type == 'array') {
        field_name = `${parent_name}[]`
      } else if (parent_type == 'object') {
        field_name = `${parent_name}.${name}`
      } else {
        field_name = name
      }

      entries.push(`| __${field_name.replace('.[', '[')}__ | __array__<br/>${description} |`)
      

      if (field.items.type == 'object') {
        process_object(field.items, '', field_name, 'array')
      } else if (field.items.type == 'array') {
        process_array(field.items, '', field_name, 'array')
      } else if (field.items.anyOf || field.items.oneOf) {
        process_composite(field.items, '', field_name, 'array')
      } else {
        process_plain(field.items, '', field_name, 'array')
      }
    }

    var process_composite = function(field, name, parent_name, parent_type) {
      var description = field.description ? field.description.replace('\n', '<br/>').trim() : ''
      var field_name = ""
      var possible_types = []

      if (parent_type == 'array' && name != '') {
        field_name = `${parent_name}[].${name}`
      } else if (parent_type == 'array') {
        field_name = `${parent_name}[]`
      } else if (parent_type == 'object') {
        field_name = `${parent_name}.${name}`
      } else {
        field_name = name
      }

      if (parent_type != "" && field.anyOf) {
        possible_types = field.anyOf ? field.anyOf.map(x => x.type) : [field.type]
      }

      if (parent_type != "" && field.oneOf) {
        possible_types = field.oneOf ? field.oneOf.map(x => x.type) : [field.type]
      }

      entries.push(`| __${field_name.replace('.[', '[')}__ | ${possible_types.map(t => `__${t}__`).join(' \\\| ')}<br/>${description} |`)

      if (field.anyOf) {
        field.anyOf.forEach((item, index) => {
          if (item.type == 'object') {
            process_object(item, `[opt_${index+1}]`, field_name, 'object')
          } else if (item.type == 'array') {
            process_array(item, `[opt_${index+1}]`, field_name, 'array')
          } else {
            process_plain(item, `[opt_${index+1}]`, field_name, 'object')
          }
        })
      }      

      if (field.oneOf) {
        field.oneOf.forEach((item, index) => {
          if (item.type == 'object') {
            process_object(item, `[opt_${index+1}]`, field_name, 'object')
          } else if (item.type == 'array') {
            process_array(item, `[opt_${index+1}]`, field_name, 'array')
          } else {
            process_plain(item, `[opt_${index+1}]`, field_name, 'object')
          }
        })
      }      
    }

    if (body.properties) {
      delete body.properties.code;
      for (const prop in body.properties) {
        if (body.properties[prop].type == 'object') {
          process_object(body.properties[prop], prop, '')
        } else if (body.properties[prop].type == 'array') {
          process_array(body.properties[prop], prop, '')
        } else if (body.properties[prop].anyOf || body.properties[prop].oneOf) {
          process_composite(body.properties[prop], prop, '')
        } else {
          process_plain(body.properties[prop], prop, '')
        }
      }
    }

    if (body instanceof Array) {
      for (const item of body) {
        if (item.properties) {
          delete item.properties.code;
          for (const prop in item.properties) {
            if (item.properties[prop].type == 'object') {
              process_object(item.properties[prop], prop, '')
            } else if (item.properties[prop].type == 'array') {
              process_array(item.properties[prop], prop, '')
            } else if (item.properties[prop].anyOf || item.properties[prop].oneOf) {
              process_composite(item.properties[prop], prop, '')
            } else {
              process_plain(item.properties[prop], prop, '')
            }
          }
        }
      }
    }

    return entries.join('\n')
  }

  split_excerpt(text) {
    var result = text
    if (text.includes("## Example")) {
      result = text.split("## Example")[0]
    }

    return result.trim()
  }

  split_example(text) {
    var result = ''

    if (text.includes("## Example")) {
      result = text.split("## Example")[1].trim()
    }

    return result
  }

  __delete_examples(body) {
    if (body && body.hasOwnProperty('properties')) {
      for (const prop in body.properties) {
        if (body.properties[prop].hasOwnProperty('examples')) {
          delete body.properties[prop].examples
        }
        this.__delete_examples(body.properties[prop])
      }
    }
  }

  __delete_parameters(parameters, names) {
    if (parameters instanceof Array) {
      for (const param of parameters) {
        if (names.includes(param.name)) {
          parameters.splice(parameters.indexOf(param), 1)
        }
      }
    }

    Object.keys(parameters).forEach(key => {
      if (names.includes(key)) {
        delete parameters[key]
      }
    })
  }
}

module.exports = refGen