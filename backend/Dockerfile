FROM node:22.13.1-slim AS builder

WORKDIR /app

COPY package.json drizzle.config.ts tsconfig.json custom.d.ts ./

RUN corepack enable

COPY src ./src

RUN yarn config set nodeLinker node-modules \
    && yarn install \
    && yarn drizzle-kit generate \
    && yarn build

RUN yarn workspaces focus --all --production
    
FROM gcr.io/distroless/nodejs22-debian12:nonroot
    
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

ENTRYPOINT [ "yarn start" ]