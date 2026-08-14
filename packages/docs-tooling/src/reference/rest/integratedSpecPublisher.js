const fs = require('node:fs');
const path = require('node:path');
const {buildIntegratedSpec} = require('./integratedSpecBuilder');
const {
  deterministicStringify,
  prepareIntegratedArtifact,
  sha256,
  writeIntegratedArtifacts,
} = require('./integratedSpecArtifacts');
const {loadSpecifications} = require('./specLoader');

function clone(value) {
  return structuredClone(value);
}

function createAliasArtifact(primary, filename) {
  return {
    filename,
    bytes: primary.bytes,
    length: primary.length,
    sha256: primary.sha256,
    contentType: 'application/json',
  };
}

function sourceDigestForFile(filePath) {
  const bytes = fs.readFileSync(filePath);
  return {spec: JSON.parse(bytes.toString('utf8')), digest: sha256(bytes), identity: path.resolve(filePath)};
}

function sourceDigestForDirectory(directoryPath) {
  const files = fs.readdirSync(directoryPath)
    .filter(file => file.endsWith('.json'))
    .sort();
  if (files.length === 0) throw new Error(`No .json files found in directory "${directoryPath}"`);

  const combined = files.map(file => {
    const bytes = fs.readFileSync(path.join(directoryPath, file));
    return `${file}\0${sha256(bytes)}`;
  }).join('\n');

  return {
    spec: loadSpecifications(directoryPath),
    digest: sha256(Buffer.from(combined, 'utf8')),
    identity: path.resolve(directoryPath),
  };
}

function resolveSource(specifications) {
  if (typeof specifications === 'string') {
    const stat = fs.statSync(specifications);
    return stat.isFile()
      ? sourceDigestForFile(specifications)
      : sourceDigestForDirectory(specifications);
  }

  const spec = clone(specifications);
  return {
    spec,
    digest: sha256(Buffer.from(deterministicStringify(spec), 'utf8')),
    identity: 'in-memory',
  };
}

async function publishIntegratedSpecs(options) {
  const {
    specifications,
    publicationPolicy,
    target,
    language,
    apiSurface,
    releaseTrack,
    outputDirectory,
    uploader,
    enableCompatibilityAliases = false,
    generatorGitSha = null,
    sourceIdentity,
  } = options;

  const source = resolveSource(specifications);
  const built = buildIntegratedSpec(source.spec, {
    publicationPolicy,
    target,
    language,
    apiSurface,
    releaseTrack,
  });

  const primaryFilename = built.releaseTrack
    ? `openapi-${target}-${built.releaseTrack}-${language}.json`
    : `openapi-${target}-${built.apiSurface}-${language}.json`;

  const prepared = prepareIntegratedArtifact(built, {
    publicationPolicy,
    target,
    releaseTrack: built.releaseTrack,
    apiSurface: built.apiSurface,
    language,
    sourceIdentity: sourceIdentity || source.identity,
    sourceDigest: source.digest,
    generatorGitSha,
  }, []);

  let aliases = [];
  if (enableCompatibilityAliases && publicationPolicy === 'latest') {
    aliases = [createAliasArtifact(prepared.artifacts[0], `openapi-${target}-${built.apiSurface}.json`)];
  }

  const artifacts = prepared.artifacts.length === 2 && aliases.length > 0
    ? [prepared.artifacts[0], ...aliases, prepared.artifacts[1]]
    : prepared.artifacts;

  const localArtifacts = writeIntegratedArtifacts(outputDirectory, artifacts);

  if (uploader) {
    const uploads = [];
    try {
      for (const artifact of localArtifacts) {
        uploads.push({
          filename: artifact.filename,
          sha256: artifact.sha256,
          url: await uploader.uploadArtifact({
            filename: artifact.filename,
            bytes: artifact.bytes,
            sha256: artifact.sha256,
          }),
        });
      }
    } catch (err) {
      throw new Error(`S3 upload failed: ${err.message}`, {cause: err});
    }
    return {localArtifacts, uploads, manifest: prepared.manifest};
  }

  return {localArtifacts, uploads: [], manifest: prepared.manifest};
}

module.exports = {
  publishIntegratedSpecs,
};
