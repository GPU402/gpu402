# Build from the repo root:  docker build -f apps/gateway/Dockerfile -t gpu402-gateway .
# Run:                       docker run --env-file .env -p 4020:4020 -v gpu402-data:/app/apps/gateway/data gpu402-gateway
FROM node:24-slim AS build
RUN corepack enable
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc tsconfig.base.json ./
COPY packages ./packages
COPY apps/gateway ./apps/gateway
RUN pnpm install --frozen-lockfile --filter "@gpu402/gateway..." \
 && pnpm --filter gpu402 --filter @gpu402/tools run build

FROM node:24-slim
ENV NODE_ENV=production PORT=4020
WORKDIR /app
COPY --from=build /app /app
WORKDIR /app/apps/gateway
# The ledger lives here; mount a volume on it to keep it across restarts.
RUN mkdir -p data && chown node:node data
EXPOSE 4020
USER node
HEALTHCHECK --interval=30s --timeout=5s CMD node -e "fetch('http://127.0.0.1:'+process.env.PORT+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
CMD ["node", "--import", "tsx", "src/server.ts"]
