FROM oven/bun:1.3.3

WORKDIR /app

COPY . .
RUN bun install --frozen-lockfile

WORKDIR /app/apps/api

EXPOSE 8000

CMD ["sh", "-c", "bun run db:migrate && bun run src/index.ts"]
