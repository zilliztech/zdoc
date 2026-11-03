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
