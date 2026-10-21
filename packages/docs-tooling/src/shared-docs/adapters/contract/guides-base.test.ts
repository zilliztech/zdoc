// @vitest-environment node
import { readFileSync } from 'node:fs'
import type { GuidesSnapshot } from '../types'
import { FakeGuidesBase } from '../fake/guides-base'
import { guidesBaseContract } from './suites'

const snapshot: GuidesSnapshot = JSON.parse(readFileSync(new URL('../../fixtures/guides-base.json', import.meta.url), 'utf8'))
guidesBaseContract('fake GuidesBase', snapshot, () => new FakeGuidesBase(snapshot))
