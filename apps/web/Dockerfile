FROM oven/bun:1.3.3

WORKDIR /app

COPY . .
RUN bun install --frozen-lockfile

ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_MCP_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_MCP_URL=${NEXT_PUBLIC_MCP_URL}

RUN bun run --cwd apps/web build

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["bun", "run", "start"]
