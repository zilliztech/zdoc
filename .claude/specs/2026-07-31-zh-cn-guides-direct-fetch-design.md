# Chinese Guides Direct Fetch Design

## Objective

Make the Chinese Guides site consume the authoritative Chinese Feishu sources directly. Chinese Guides are not translated from English. The Chinese publication model contains two units only: Cloud Guides and BYOC Guides. Tools remains a first-level navigation entry, but its content and navigation are owned by Cloud Guides rather than by a separate pipeline.

## Source model

- English Cloud and BYOC Guides continue to use the existing English Feishu source.
- Chinese Cloud and BYOC Guides use the existing Chinese Feishu source declared in the manual registry.
- The Chinese Cloud source includes the complete `tutorials/tools` subtree.
- English and Chinese fetch state, caches, artifacts, and source identities are site-qualified and cannot be restored across sites.
- Reference SDK localization remains unchanged: English Reference content is translated into Chinese by the translation workflows.

## Workflow architecture

`fetch-docs.yml` runs two site-qualified Guides lanes:

1. English Guides lane
   - Fetch English shared Guides sources.
   - Render English site-qualified tables.
   - Assemble English Cloud and BYOC publications.
   - Publish the validated English Guides checkpoint.

2. Chinese Guides lane
   - Fetch Chinese shared Guides sources.
   - Render Chinese site-qualified tables.
   - Assemble Chinese Cloud and BYOC publications, including Tools in Cloud.
   - Publish the validated Chinese Guides checkpoint.

The two lanes may fetch, render, and assemble in parallel. Publications to the shared target branch remain serialized through the existing checkpoint publisher so concurrent branch updates are retried safely.

## Publication ownership

The Chinese Guides publication group owns:

- `content/zh-CN/guides`
- `content/zh-CN/byoc`
- the Chinese Cloud Guides sidebar
- the Chinese BYOC sidebar
- the Tools navigation/sidebar output generated as part of Cloud Guides
- the site-qualified Chinese Guides source publication manifest and required source snapshots

Tools has no separate content group, translation target, checkpoint, manifest, or publisher. Its first-level navigation entry remains, but the Cloud Guides assembly is the only producer of its content and navigation.

## Removal of the legacy Tools translation path

- Remove `zh-CN-tools` from manual translation workflow choices and validation routing.
- Remove the scheduled or grouped `translate_guides_zh_tools` production job.
- Remove the Tools translation manifest and translation coverage requirement from current production validation.
- Remove Chinese Guides protected-path isolation for `tutorials/tools` and its sidebar.
- Stop creating or consuming Tools translation recovery artifacts.
- Fail workflow-policy tests if an executable paid `zh-CN-tools` translation path is reintroduced.

Existing historical artifacts remain downloadable until normal expiration but are not accepted as current Chinese Guides source state.

## Recovery model

- English and Chinese Guides use independent source caches keyed by site and source snapshot identity.
- A Chinese Guides run may restore only a compatible Chinese Guides cache.
- A recovered cache must pass the same source completeness, media coverage, and source identity checks as a fresh fetch.
- Cloud and BYOC are published together as one Chinese Guides checkpoint so a partial Chinese site cannot be committed.
- Failed publication leaves the prior target branch unchanged and preserves the produced checkpoint artifact for retry.

## Validation

The Chinese Guides lane must verify before publication:

- Chinese Cloud Guides source completeness.
- Chinese BYOC Guides source completeness.
- Media coverage for both publication units.
- Tools documents are present within the Cloud Guides output.
- Tools remains reachable through its first-level navigation entry.
- Chinese Cloud, BYOC, and Tools sidebar ownership has exactly one producer.
- No English Guides cache or artifact is accepted by the Chinese lane.
- No `zh-CN-tools` translation job is reachable.
- `pnpm build:zh-CN` succeeds from the exact candidate content SHA.

The existing English Guides and Japanese translation validations remain unchanged.

## Rollout

1. Add the site-qualified Chinese Guides producer, table render, assembly, and publisher wiring.
2. Remove the independent Chinese Tools translation path and protected ownership.
3. Run workflow-policy, publication ownership, Guides cache, checkpoint, and TypeScript tests.
4. Fetch Chinese Guides with publishing disabled and inspect the generated checkpoint.
5. Publish to a temporary branch and build the Chinese site from the exact candidate SHA.
6. After successful validation, publish the same verified flow to `dev`.

## Non-goals

- Do not translate Chinese Guides from English.
- Do not change Reference SDK translation behavior.
- Do not change Japanese Guides translation behavior.
- Do not change public URL structure or remove the Tools navigation entry.
- Do not modify `zdoc_cn`.
