FROM node:20-alpine AS build

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/builder/package.json ./apps/builder/package.json

RUN pnpm install --no-frozen-lockfile

COPY apps/builder ./apps/builder

WORKDIR /app/apps/builder
RUN pnpm run build

FROM nginx:1.27-alpine

COPY apps/builder/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/builder/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
