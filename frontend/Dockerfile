FROM node:22.13.1-slim AS builder

WORKDIR /app

COPY package.json  ./

RUN yarn install

COPY . .

RUN yarn build


FROM gcr.io/distroless/nodejs20:nonroot AS runner

USER nonroot

WORKDIR /app

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 4000

CMD ["server.js"]
