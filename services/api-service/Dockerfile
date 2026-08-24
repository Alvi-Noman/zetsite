FROM node:20-alpine

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY services/api-service/package.json ./services/api-service/package.json

RUN pnpm install --no-frozen-lockfile

COPY services/api-service ./services/api-service

WORKDIR /app/services/api-service
RUN pnpm build

ENV NODE_ENV=production
EXPOSE 4001
CMD ["node", "dist/server.js"]
