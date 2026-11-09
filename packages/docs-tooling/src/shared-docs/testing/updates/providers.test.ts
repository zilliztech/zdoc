// @vitest-environment node
import { expect, it } from 'vitest'
import { providerFor, ProviderUnavailableError } from '../../adapters/updates/providers'
it('dispatches Guides statically and keeps every SDK manual uninstalled', () => {
  const guides: any = { kind: 'guides-page', collect() {}, planNext() {} }
  expect(providerFor({ kind: 'guides-page', group: 'guides', pageId: 'example' }, guides)).toBe(guides)
  expect(() => providerFor({ kind: 'sdk-manual', group: 'fixture', manualId: 'fixture' }, guides)).toThrow(ProviderUnavailableError)
  try { providerFor({ kind: 'sdk-manual', group: 'fixture', manualId: 'fixture' }, guides) }
  catch (error) { expect(error).toMatchObject({ disposition: 'hold', code: 'PROVIDER_NOT_INSTALLED' }) }
})

import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
it('loads the common provider facade without executing B1 or compiler modules in the parent', () => {
  const root = fileURLToPath(new URL('../../../../../..', import.meta.url))
  const stdout = execFileSync(process.execPath, ['-e', `
    const path=require('node:path'),assert=require('node:assert/strict');
    const root=process.argv[1];
    require(path.join(root,'scripts/lib/load-typescript.js')).loadTypeScript(path.join(root,'packages/docs-tooling/src/shared-docs/adapters/updates/guides-provider.ts'));
    const ambient=Object.keys(require.cache).filter(name=>/\\/adapters\\/updates\\/(runner|candidate)\\.ts$|\\/@zilliz\\/mdtomd\\//.test(name));
    assert.deepEqual(ambient,[]);process.stdout.write('parent-facade-only');
  `, root], { encoding: 'utf8', env: { ...process.env, JITI_CACHE: 'false' }, timeout: 30_000 })
  expect(stdout).toBe('parent-facade-only')
})
