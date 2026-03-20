FROM node:20-bookworm

WORKDIR /app

RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY packages ./packages
COPY apps ./apps

RUN corepack enable && pnpm install --frozen-lockfile

RUN pnpm build

EXPOSE 3000

CMD ["node", "apps/server/dist/index.js"]
