import type { Channel, NamedBlockInventory, SharedDocsError, Transform } from '../types'
import type { TabsRules } from '../site'

export interface Origin { file: string; line: number; kind: 'source' | 'content-file' | 'inline'; transformIndex?: number }
export interface MappedLine { text: string; origin: Origin; blockSeparator?: true }
export interface ContentFile { file: string; text: string }
export interface TransformInput {
  markdown: string
  blocks: readonly NamedBlockInventory[]
  transforms: readonly Transform[]
  contentFiles: ReadonlyMap<string, ContentFile>
  tabsRules: TabsRules
  pageYaml: string
  configFile: string
  sourceFile: string
  page: string
  channel: Channel
  availableChannels?: readonly Channel[]
}
export interface Edit { start: number; end: number; lines: MappedLine[]; index: number }
export interface TransformPlan { edits: Edit[] }
export type PlanResult = TransformPlan | { errors: SharedDocsError[] }
