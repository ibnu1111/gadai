# Gadai Service - Next.js Monolith
# Deploy ke Railway

FROM node:20-slim AS base

# Install dependencies only when needed
FROM base AS deps
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Generate Prisma Client
COPY prisma/schema.prisma ./prisma/
RUN npx prisma generate

# Rebuild the source code only when needed
FROM base AS builder
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npx prisma generate
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
RUN apt-get update && apt-get install -y --no-install-recommends openssl && rm -rf /var/lib/apt/lists/*
WORKDIR /app

ENV NODE_ENV=production

RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 nextjs

# Copy standalone output with public folder
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public

# Copy static files (fallback)
RUN if [ ! -d "./public" ]; then mkdir -p ./public; fi

RUN chown -R nextjs:nodejs ./public

COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
