'use strict'

const slugify = require('slugify')

const ZH_CN_TABLE_SLUGS = Object.freeze({
  '从这里开始': 'get-started',
  '开发指南': 'development',
  '运维指南': 'management',
  '客户端参考': 'client-libraries',
  '工具': 'tools',
  'AI 模型': 'ai-models',
})

function guidesTableSlug(site, tableName) {
  if (typeof tableName !== 'string' || !tableName.trim()) throw new Error('Guides table name is required')
  if (site === 'en') return slugify(tableName, {lower: true, strict: true})
  if (site !== 'zh-CN') throw new Error(`Unsupported Guides table site: ${site}`)
  const slug = ZH_CN_TABLE_SLUGS[tableName.trim()]
  if (slug) return slug
  const historicalEnglishSlug = slugify(tableName, {lower: true, strict: true})
  if (historicalEnglishSlug) return historicalEnglishSlug
  throw new Error(`Missing English Guides table slug mapping for Chinese table: ${tableName}`)
}

function validateGuidesTableNames(site, tables) {
  if (!Array.isArray(tables) || tables.length === 0) throw new Error('Guides Base preflight requires at least one table')
  return tables.map(table => ({
    table_id: table.table_id || table.id,
    table_name: table.name || table.table_name,
    table_slug: guidesTableSlug(site, table.name || table.table_name),
  }))
}

module.exports = {guidesTableSlug, validateGuidesTableNames}
