FROM node:20-alpine AS build

WORKDIR /app
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json ./
COPY packages ./packages
COPY apps/storefront/package.json ./apps/storefront/package.json

RUN pnpm install --no-frozen-lockfile

COPY apps/storefront ./apps/storefront

WORKDIR /app/apps/storefront
RUN pnpm run build

FROM nginx:1.27-alpine

COPY apps/storefront/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/apps/storefront/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
