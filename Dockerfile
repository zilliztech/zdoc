FROM node:22-slim AS build

# Install pnpm
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate

WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages/chat-ui/package.json ./packages/chat-ui/package.json
RUN pnpm install --frozen-lockfile
COPY . .
ARG CHAT_ENDPOINT
ENV CHAT_ENDPOINT=${CHAT_ENDPOINT}
RUN pnpm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
