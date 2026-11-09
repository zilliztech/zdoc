import { SubjectSchema, type Subject, type UpdateProvider } from '../../core/updates/envelope'
/** An operation-level hold when no honest frozen report can be constructed. */
export class ProviderUnavailableError extends Error {
  readonly disposition = 'hold'
  readonly code = 'PROVIDER_NOT_INSTALLED'
  constructor(readonly subject: Subject) { super(`PROVIDER_NOT_INSTALLED: ${subject.kind}`) }
}
/** Static dispatch only. Synthetic/manual fixtures never register a production SDK provider. */
export function providerFor(subjectValue: Subject, guides: UpdateProvider): UpdateProvider {
  const subject = SubjectSchema.parse(subjectValue)
  if (subject.kind === 'sdk-manual') throw new ProviderUnavailableError(subject)
  if (guides.kind !== 'guides-page') throw new Error('Guides provider kind mismatch')
  return guides
}
