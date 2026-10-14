# ========================================================
# RFID Attendance System — Multi-Stage Dockerfile
# Optimized for Next.js 16 (Standalone Output) & Node.js 20 LTS
# ========================================================

# --------------------------------------------------------
# Stage 1: Base image
# --------------------------------------------------------
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
WORKDIR /app

# --------------------------------------------------------
# Stage 2: Install dependencies
# --------------------------------------------------------
FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

# --------------------------------------------------------
# Stage 3: Development environment
# --------------------------------------------------------
FROM base AS development
ENV NODE_ENV=development
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

COPY package.json package-lock.json ./
RUN npm install

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]

# --------------------------------------------------------
# Stage 4: Production build
# --------------------------------------------------------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npm run build

# --------------------------------------------------------
# Stage 5: Production runner (minimal standalone image)
# --------------------------------------------------------
FROM base AS runner
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set correct permissions for Next.js prerender cache
RUN mkdir .next && chown nextjs:nodejs .next

# Copy standalone build and static assets
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

CMD ["node", "server.js"]
