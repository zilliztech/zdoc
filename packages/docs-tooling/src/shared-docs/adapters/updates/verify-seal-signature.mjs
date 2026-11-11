// The trusted adapter obtains these signature facts from GitHub; this binds them to raw Git bytes.
import { createHash } from 'node:crypto'

function requireFact(ok, code) {
  if (!ok) throw new Error(code)
}

export function verifySealSignature(commitBytes, fact, identity) {
  const validActor = value => Number.isSafeInteger(value) && value > 0
  requireFact(validActor(identity.writerActorId) && validActor(identity.platformSignerActorId) &&
    fact.signatureValid === true && fact.signatureState === 'VALID' && fact.wasSignedByGitHub === true &&
    fact.authorActorId === identity.writerActorId && fact.signerActorId === identity.platformSignerActorId,
  'SEAL_SIGNATURE_IDENTITY')
  requireFact(typeof fact.payload === 'string' && typeof fact.signature === 'string', 'SEAL_SIGNATURE_BYTES')

  const raw = Buffer.from(commitBytes)
  const split = raw.indexOf('\n\n')
  requireFact(split > 0, 'SEAL_SIGNATURE_BYTES')
  const headers = raw.subarray(0, split).toString('utf8').split('\n')
  const start = headers.findIndex(line => line.startsWith('gpgsig '))
  requireFact(start >= 0 && !headers.slice(start + 1).some(line => line.startsWith('gpgsig ')) &&
    !headers.some(line => line.startsWith('gpgsig-')), 'SEAL_SIGNATURE_HEADER')
  let end = start + 1
  while (headers[end]?.startsWith(' ')) end++
  const signature = [headers[start].slice(7), ...headers.slice(start + 1, end).map(line => line.slice(1))].join('\n')
  // Git stores the armor without its final LF. GitHub's signature may include that LF.
  requireFact(signature.length > 0 && (signature === fact.signature || signature + '\n' === fact.signature),
    'SEAL_SIGNATURE_BYTES')
  const unsignedHeaders = [...headers.slice(0, start), ...headers.slice(end)]
  const message = raw.subarray(split + 2)
  const unsigned = Buffer.concat([Buffer.from(unsignedHeaders.join('\n') + '\n\n'), message])
  requireFact(unsigned.equals(Buffer.from(fact.payload)), 'SEAL_SIGNED_PAYLOAD')

  const signerHeaders = signature.split('\n').map((line, index) => (index === 0 ? 'gpgsig ' : ' ') + line)
  const signedHeaders = [...headers.slice(0, start), ...signerHeaders, ...headers.slice(end)]
  requireFact(Buffer.concat([Buffer.from(signedHeaders.join('\n') + '\n\n'), message]).equals(raw), 'SEAL_RECONSTRUCTION')
  const oid = createHash('sha1').update(`commit ${raw.length}\0`).update(raw).digest('hex')
  requireFact(oid === fact.oid, 'SEAL_OID')
  return { unsignedHeaders, message }
}
