// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { parseBaselineJson, validateBaselineConsistency } from '../core/baseline.ts'
import { sha256Hex } from '../core/types.ts'
import type { PageConfig } from '../core/types.ts'

const SOURCE_MD = '# 删除 Entity\n\n您可以按条件删除 Entity。\n'
const SOURCE_SHA = sha256Hex(SOURCE_MD)
const SHA_A = 'a'.repeat(64)
const SHA_B = 'b'.repeat(64)
const COMMIT_A = '1'.repeat(40)

function makeValidBaseline(overrides: Record<string, unknown> = {}) {
  return {
    schema_version: 1,
    page_id: 'delete-entities',
    en_baseline: {
      manual: 'guides',
      shared_page: 'delete-entities',
      dev_commit: COMMIT_A,
      en_path: 'content/en/guides/tutorials/development/insert-and-delete/delete-entities.md',
      manifest_path: 'generated/en/manifests/shared-pages/guides/delete-entities.json',
      file_sha256: SHA_A,
      channels: {
        current_sha256: SHA_A,
        next_sha256: SHA_B,
      },
    },
    zh_reviewed: {
      source_sha256: SOURCE_SHA,
      reviewed_pr: 128,
      updated_at: '2026-11-25T08:45:00Z',
    },
    last_notified_en_sha: null,
    sections: [
      {
        anchor: 'delete-entities-by-filtering-conditions',
        en_sha256: SHA_A,
        zh_sha256: SHA_B,
        code_blocks: [
          {
            lang: 'python',
            customized_for_zh: false,
            en_sha256: SHA_A,
          },
          {
            lang: null,
            customized_for_zh: true,
            en_sha256: SHA_B,
          },
        ],
      },
    ],
    ...overrides,
  }
}

const PAGE_CONFIG: PageConfig = {
  schema_version: 1,
  mode: 'incremental',
  en_source: {
    manual: 'guides',
    shared_page: 'delete-entities',
  },
}

describe('parseBaselineJson & validateBaselineConsistency', () => {
  it('parses and validates a complete .baseline.json and matches page config + source sha256', () => {
    const parsed = parseBaselineJson(JSON.stringify(makeValidBaseline()))
    expect('baseline' in parsed).toBe(true)
    if ('baseline' in parsed) {
      const errors = validateBaselineConsistency({
        baseline: parsed.baseline,
        dirPageId: 'delete-entities',
        pageConfig: PAGE_CONFIG,
        sourceMdText: SOURCE_MD,
      })
      expect(errors).toEqual([])
    }
  })

  it('rejects malformed JSON and invalid schema fields', () => {
    const badJson = parseBaselineJson('{bad')
    expect('errors' in badJson && badJson.errors[0].code).toBe('BASELINE_SYNTAX_INVALID')

    const badSchema = parseBaselineJson(
      JSON.stringify(
        makeValidBaseline({
          schema_version: 2,
          page_id: 'active',
          last_notified_en_sha: 'not-a-sha',
          extra_field: true,
        }),
      ),
    )
    expect('errors' in badSchema).toBe(true)
    if ('errors' in badSchema) {
      expect(badSchema.errors.length).toBeGreaterThanOrEqual(3)
    }
  })

  it('rejects path traversal in en_baseline paths and invalid zh_reviewed metadata', () => {
    const raw = makeValidBaseline()
    raw.en_baseline.en_path = '../secret/file.md'
    raw.zh_reviewed.reviewed_pr = 0
    raw.zh_reviewed.updated_at = 'not-a-date'

    const parsed = parseBaselineJson(JSON.stringify(raw))
    expect('errors' in parsed).toBe(true)
    if ('errors' in parsed) {
      expect(parsed.errors.some(e => e.message.includes('en_path'))).toBe(true)
      expect(parsed.errors.some(e => e.message.includes('reviewed_pr'))).toBe(true)
      expect(parsed.errors.some(e => e.message.includes('updated_at'))).toBe(true)
    }
  })

  it('detects page_id, en_source, and source.md SHA-256 mismatches', () => {
    const raw = makeValidBaseline()
    const parsed = parseBaselineJson(JSON.stringify(raw))
    expect('baseline' in parsed).toBe(true)
    if ('baseline' in parsed) {
      const errors = validateBaselineConsistency({
        baseline: parsed.baseline,
        dirPageId: 'other-page',
        pageConfig: {
          schema_version: 1,
          mode: 'incremental',
          en_source: { manual: 'guides', shared_page: 'different-source' },
        },
        sourceMdText: '# 已修改正文\n',
      })
      expect(errors.map(e => e.code)).toEqual([
        'BASELINE_PAGE_ID_MISMATCH',
        'BASELINE_EN_SOURCE_MISMATCH',
        'BASELINE_SOURCE_HASH_MISMATCH',
      ])
    }
  })
})
