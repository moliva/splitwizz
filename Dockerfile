FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json ./
# COPY package-lock.json ./
COPY pnpm-lock.yaml ./
RUN  corepack enable pnpm
RUN pnpm install
COPY . .

RUN pnpm build

FROM nginx:1.19-alpine AS server
COPY ./etc/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder ./app/dist /usr/share/nginx/html
