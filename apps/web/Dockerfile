FROM oven/bun:1.3.3

WORKDIR /app

COPY . .
RUN bun install --frozen-lockfile
RUN bun run --cwd apps/web build

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["bun", "run", "start"]
