FROM node:22-slim AS build

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/chat-ui/package.json ./packages/chat-ui/package.json
RUN pnpm install --frozen-lockfile
COPY . .
ARG CHAT_ENDPOINT
ARG INKEEP_API_KEY
ARG INKEEP_INTEGRATION_ID
ARG INKEEP_ORGANIZATION_ID
ENV CHAT_ENDPOINT=${CHAT_ENDPOINT}
ENV INKEEP_API_KEY=${INKEEP_API_KEY}
ENV INKEEP_INTEGRATION_ID=${INKEEP_INTEGRATION_ID}
ENV INKEEP_ORGANIZATION_ID=${INKEEP_ORGANIZATION_ID}
RUN pnpm run build

FROM nginx:alpine
ARG INKEEP_API_KEY
ARG INKEEP_INTEGRATION_ID
ARG INKEEP_ORGANIZATION_ID
ENV INKEEP_API_KEY=${INKEEP_API_KEY}
ENV INKEEP_INTEGRATION_ID=${INKEEP_INTEGRATION_ID}
ENV INKEEP_ORGANIZATION_ID=${INKEEP_ORGANIZATION_ID}
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY docker-entrypoint.d/40-zdoc-env.sh /docker-entrypoint.d/40-zdoc-env.sh
RUN chmod +x /docker-entrypoint.d/40-zdoc-env.sh
EXPOSE 80
