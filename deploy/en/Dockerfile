FROM node:22-slim AS build

RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/docs/package.json apps/docs/package.json
COPY packages/chat-ui/package.json packages/chat-ui/package.json
COPY packages/docs-tooling/package.json packages/docs-tooling/package.json
COPY packages/docs-ui/package.json packages/docs-ui/package.json
COPY packages/publication-adapters/package.json packages/publication-adapters/package.json
COPY packages/site-config/package.json packages/site-config/package.json
COPY .pnpmfile.cjs .pnpmfile.cjs
COPY patches patches
RUN pnpm install --frozen-lockfile

COPY . .
ARG ZDOC_SHA
ARG ZDOC_SITE=en
ARG JENKINS_BUILD_ID
RUN test -n "$ZDOC_SHA" \
    && test "${#ZDOC_SHA}" -eq 40 \
    && test "${ZDOC_SHA#*[!0-9a-f]}" = "$ZDOC_SHA" \
    && test "$ZDOC_SITE" = "en" \
    && test -n "$JENKINS_BUILD_ID"
ENV ZDOC_PROVENANCE_COMMIT=${ZDOC_SHA} \
    ZDOC_PROVENANCE_WORKTREE=external-snapshot \
    ZDOC_PROVENANCE_TRACKED_INPUTS=deploy/contracts/localization-inputs.inventory.json
RUN pnpm run build:en

FROM nginx:1.28-alpine

ARG ZDOC_SHA
ARG ZDOC_SITE=en
ARG JENKINS_BUILD_ID
RUN test -n "$ZDOC_SHA" \
    && test "${#ZDOC_SHA}" -eq 40 \
    && test "${ZDOC_SHA#*[!0-9a-f]}" = "$ZDOC_SHA" \
    && test "$ZDOC_SITE" = "en" \
    && test -n "$JENKINS_BUILD_ID"
LABEL org.opencontainers.image.source="https://github.com/zilliztech/zdoc" \
      org.opencontainers.image.revision="${ZDOC_SHA}" \
      com.zilliz.zdoc.site="${ZDOC_SITE}" \
      com.zilliz.jenkins.build-id="${JENKINS_BUILD_ID}"

COPY --from=build /app/build/en/ /usr/share/nginx/html/
COPY deploy/en/nginx.conf /etc/nginx/conf.d/default.conf
COPY deploy/runtime/40-zdoc-env.sh /docker-entrypoint.d/40-zdoc-env.sh
RUN chmod 755 /docker-entrypoint.d/40-zdoc-env.sh

EXPOSE 80
