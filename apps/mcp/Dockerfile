FROM oven/bun:1.3.3

WORKDIR /app

COPY . .
RUN bun install --frozen-lockfile

WORKDIR /app/apps/mcp

EXPOSE 8010

CMD ["bun", "run", "src/index.ts"]
