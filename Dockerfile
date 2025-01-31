FROM node:22.13.1-slim AS builder

WORKDIR /usr/src/app

COPY package.json yarn.lock drizzle.config.ts tsconfig.json ./

RUN corepack enable

COPY src ./src

RUN yarn config set nodeLinker node-modules \
    && yarn --production && yarn drizzle-kit generate \
    && yarn tsc 

FROM gcr.io/distroless/nodejs22-debian12:nonroot

WORKDIR /app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/drizzle ./drizzle
COPY --from=builder /usr/src/app/package.json ./package.json
COPY --from=builder /usr/src/app/node_modules ./node_modules

CMD ["dist/src/index.js"]