// @vitest-environment node
import { readFileSync } from 'node:fs'
import { expect, it } from 'vitest'
import { execute } from './helpers'

function check(code: string) {
  const directory = new URL(`../../fixtures/errors/${code.toLowerCase().replaceAll('_', '-')}/`, import.meta.url)
  const read = (path: string) => readFileSync(new URL(path, directory), 'utf8')
  const result = execute(read('input/source.md'), [], JSON.parse(read('input/files.json')), 'current', read('input/page.yaml'))
  if (!('errors' in result)) throw new Error('Expected transform validation to fail')
  expect(result.errors.map(({ code, file, line, page, channel }) => ({ code, file, line, page, channel }))).toEqual(JSON.parse(read('expected.json')))
  expect(result).not.toHaveProperty('text')
}

it('[TRANSFORM_TARGET_NOT_FOUND] reports the fixture code, file and line', () => check('TRANSFORM_TARGET_NOT_FOUND'))
it('[TRANSFORM_TARGET_KIND] reports the fixture code, file and line', () => check('TRANSFORM_TARGET_KIND'))
it('[TRANSFORM_LANGUAGE_EXISTS] reports the fixture code, file and line', () => check('TRANSFORM_LANGUAGE_EXISTS'))
it('[TRANSFORM_LANGUAGE_ABSENT] reports the fixture code, file and line', () => check('TRANSFORM_LANGUAGE_ABSENT'))
it('[TRANSFORM_POSITION_MISSING] reports the fixture code, file and line', () => check('TRANSFORM_POSITION_MISSING'))
it('[TRANSFORM_POSITION_UNEXPECTED] reports the fixture code, file and line', () => check('TRANSFORM_POSITION_UNEXPECTED'))
it('[TRANSFORM_CONTENT_UNEXPECTED] reports the fixture code, file and line', () => check('TRANSFORM_CONTENT_UNEXPECTED'))
it('[TRANSFORM_CONTENT_NOT_FOUND] reports the fixture code, file and line', () => check('TRANSFORM_CONTENT_NOT_FOUND'))
it('[TRANSFORM_CONTENT_MARKUP] reports the fixture code, file and line', () => check('TRANSFORM_CONTENT_MARKUP'))
it('[TRANSFORM_CONFLICT] reports the fixture code, file and line', () => check('TRANSFORM_CONFLICT'))
it('[TRANSFORM_ON_INSERTED] reports the fixture code, file and line', () => check('TRANSFORM_ON_INSERTED'))
it('[TRANSFORM_CHANNEL_INVALID] reports the fixture code, file and line', () => check('TRANSFORM_CHANNEL_INVALID'))
it('[LINE_NOT_FOUND] reports the fixture code, file and line', () => check('LINE_NOT_FOUND'))
it('[LINE_AMBIGUOUS] reports the fixture code, file and line', () => check('LINE_AMBIGUOUS'))
it('[LINE_TOO_MANY] reports the fixture code, file and line', () => check('LINE_TOO_MANY'))
it('[LINE_INVALID] reports the fixture code, file and line', () => check('LINE_INVALID'))
