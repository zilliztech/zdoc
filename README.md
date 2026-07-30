# Zilliz Documentation

This repository builds the English/Japanese and Chinese documentation sites from one audited codebase. The two sites share tooling and UI packages, but use independent site profiles and content trees. Chinese is not rebuilt through Docusaurus i18n because its product capabilities and document structure differ from English.

## Prerequisites

- Node.js 22 or newer
- pnpm 10.33.0 (`corepack enable`)

Install dependencies with:

```bash
pnpm install --frozen-lockfile
```

## Local development and builds

English includes the Japanese translation tree:

```bash
pnpm start:en
pnpm build:en
```

Preview Japanese locally with `pnpm start:en --locale ja-JP`. The English build includes both locales and writes Japanese pages below `build/en/ja-JP`.

Chinese is an independent site profile:

```bash
pnpm start:zh-CN
pnpm build:zh-CN
```

Build output is written to `build/en` and `build/zh-CN`.

## Content ownership

- English source content: `content/en`
- Chinese source and translated content: `content/zh-CN`
- Japanese translations: `i18n/ja-JP`
- Generated sidebars and manifests: `generated/<site>`
- Site configuration: `packages/site-config`
- Docusaurus application: `apps/docs`
- Shared and site-specific UI: `packages/docs-ui`
- Content production and publication CLI: `packages/docs-tooling`

Japanese content follows the English document structure and ships as part of the English site. Agent-driven translation has three explicit targets: `ja-JP`, `zh-CN-reference`, and `zh-CN-tools`. Chinese source publication must preserve the Agent-owned `content/zh-CN/guides/tutorials/tools` subtree.

## Content production

Use the site-qualified docs tooling commands and workflows. Do not publish by invoking retired root Docusaurus or plugin wrappers.

```bash
pnpm test:workflow-policy
pnpm test:retirement
```

GitHub Actions owns source production, translation, validation, and image build orchestration. English and Chinese production remain independently addressable. External `vdc-jenkins` pipelines consume the resulting repository state or promote an approved UAT image; Jenkins configuration is maintained outside this repository.

## Containers

The runtime images contain only Nginx plus the selected static build output. Build from the repository root:

```bash
ZDOC_SHA="$(git rev-parse HEAD)"
docker build --build-arg ZDOC_SHA="$ZDOC_SHA" --build-arg JENKINS_BUILD_ID=local-preview -f deploy/en/Dockerfile -t zdoc-en .
docker build --build-arg ZDOC_SHA="$ZDOC_SHA" --build-arg JENKINS_BUILD_ID=local-preview -f deploy/zh-CN/Dockerfile -t zdoc-zh-cn .
```

The site-owned Nginx configurations are `deploy/en/nginx.conf` and `deploy/zh-CN/nginx.conf`. Runtime environment rendering is owned by `deploy/runtime/40-zdoc-env.sh`.

## Verification

Run proportional checks while developing. Before a repository-wide retirement or release change, run:

```bash
pnpm test:retirement
pnpm typecheck
pnpm test:frontend
pnpm test:containers
pnpm build:en
pnpm build:zh-CN
```
