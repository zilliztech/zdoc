export interface BaseOptionSpec {
  name: string;
  hue?: 'Red' | 'Orange' | 'Yellow' | 'Lime' | 'Green' | 'Turquoise' | 'Wathet' | 'Blue' | 'Carmine' | 'Purple' | 'Gray';
  lightness?: 'Lighter' | 'Light' | 'Standard' | 'Dark' | 'Darker';
}

export interface BaseFieldSpec {
  name: string;
  type: 'text' | 'number' | 'select' | 'datetime' | 'user';
  multiple?: boolean;
  options?: BaseOptionSpec[];
  style?: Record<string, unknown>;
}

export interface BaseViewSpec {
  name: string;
  type: 'grid';
  filter: {
    logic: 'and';
    conditions: Array<[string, '==' | 'intersects', string | string[]]>;
  };
}

const options = (...names: string[]): BaseOptionSpec[] =>
  names.map((name) => ({name, hue: 'Blue', lightness: 'Lighter'}));

const runStates = [
  'scanning',
  'classification_required',
  'translation_required',
  'review_required',
  'stale',
  'applying',
  'verifying',
  'completed',
  'blocked',
  'partial',
  'recovering',
] as const;

const integerStyle = {
  type: 'plain',
  precision: 0,
  percentage: false,
  thousands_separator: false,
} as const;

const documentPairFields: BaseFieldSpec[] = [
  {name: 'pair_id', type: 'text'},
  {name: 'source_locale', type: 'select', multiple: false, options: options('en')},
  {name: 'target_locale', type: 'select', multiple: false, options: options('zh-CN')},
  {name: 'mode', type: 'select', multiple: false, options: options('mirror', 'selective', 'independent', 'excluded')},
  {name: 'status', type: 'select', multiple: false, options: options('active', 'needs_bootstrap', 'blocked', 'disabled')},
  {name: 'source_doc_url', type: 'text', style: {type: 'url'}},
  {name: 'source_doc_token', type: 'text'},
  {name: 'target_doc_url', type: 'text', style: {type: 'url'}},
  {name: 'target_doc_token', type: 'text'},
  {name: 'target_parent_url', type: 'text', style: {type: 'url'}},
  {name: 'target_parent_token', type: 'text'},
  {name: 'product_scope', type: 'text'},
  {name: 'version_scope', type: 'text'},
  {name: 'environment_scope', type: 'text'},
];

const glossaryFields: BaseFieldSpec[] = [
  {name: 'source_term', type: 'text'},
  {name: 'term_id', type: 'text'},
  {name: 'target_term', type: 'text'},
  {name: 'disposition', type: 'select', multiple: false, options: options('translate', 'keep_as_is', 'deprecated')},
  {name: 'scope_type', type: 'select', multiple: false, options: options('global', 'product', 'environment', 'version', 'document')},
  {name: 'scope_value', type: 'text'},
  {name: 'status', type: 'select', multiple: false, options: options('candidate', 'approved', 'deprecated')},
  {name: 'prohibited_variants', type: 'text'},
  {name: 'notes', type: 'text'},
  {name: 'approved_by', type: 'user', multiple: false},
  {name: 'updated_at', type: 'datetime', style: {format: 'yyyy-MM-dd HH:mm'}},
];

const localizationRunFields: BaseFieldSpec[] = [
  {name: 'run_id', type: 'text'},
  {name: 'record_type', type: 'select', multiple: false, options: options('run', 'receipt')},
  {name: 'pair_id', type: 'text'},
  {name: 'state', type: 'select', multiple: false, options: options(...runStates)},
  {name: 'created_at', type: 'datetime', style: {format: 'yyyy-MM-dd HH:mm'}},
  {name: 'updated_at', type: 'datetime', style: {format: 'yyyy-MM-dd HH:mm'}},
  {name: 'completed_at', type: 'datetime', style: {format: 'yyyy-MM-dd HH:mm'}},
  {name: 'source_from_revision', type: 'number', style: integerStyle},
  {name: 'source_to_revision', type: 'number', style: integerStyle},
  {name: 'target_plan_revision', type: 'number', style: integerStyle},
  {name: 'target_verified_revision', type: 'number', style: integerStyle},
  {name: 'source_hash', type: 'text'},
  {name: 'target_hash', type: 'text'},
  {name: 'source_snapshot_token', type: 'text'},
  {name: 'error_type', type: 'text'},
  {name: 'payload_json', type: 'text'},
];

export const feishuRegistrySchema = {
  baseName: 'ZDoc Localization Registry',
  timeZone: 'Asia/Shanghai',
  tables: {
    documentPairs: {name: 'document_pairs', fields: documentPairFields},
    glossary: {name: 'glossary', fields: glossaryFields},
    localizationRuns: {name: 'localization_runs', fields: localizationRunFields},
  },
  views: {
    documentPairs: [
      {name: 'Active', type: 'grid', filter: {logic: 'and', conditions: [['status', '==', 'active']]}},
      {name: 'Needs Bootstrap', type: 'grid', filter: {logic: 'and', conditions: [['status', '==', 'needs_bootstrap']]}},
      {name: 'Blocked', type: 'grid', filter: {logic: 'and', conditions: [['status', '==', 'blocked']]}},
    ] satisfies BaseViewSpec[],
    glossary: [
      {name: 'Candidates', type: 'grid', filter: {logic: 'and', conditions: [['status', '==', 'candidate']]}},
      {name: 'Approved', type: 'grid', filter: {logic: 'and', conditions: [['status', '==', 'approved']]}},
      {name: 'Deprecated', type: 'grid', filter: {logic: 'and', conditions: [['status', '==', 'deprecated']]}},
    ] satisfies BaseViewSpec[],
    localizationRuns: [
      {name: 'Needs Review', type: 'grid', filter: {logic: 'and', conditions: [['state', 'intersects', ['classification_required', 'translation_required', 'review_required']]]}},
      {name: 'Blocked or Partial', type: 'grid', filter: {logic: 'and', conditions: [['state', 'intersects', ['blocked', 'partial', 'stale']]]}},
      {name: 'Completed', type: 'grid', filter: {logic: 'and', conditions: [['state', '==', 'completed']]}},
    ] satisfies BaseViewSpec[],
  },
} as const;
