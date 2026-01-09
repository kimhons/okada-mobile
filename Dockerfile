# Build stage
FROM node:25-alpine AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build application
ARG VITE_APP_TITLE="Okada Admin Dashboard"
ARG VITE_APP_ID
ARG VITE_APP_LOGO="/logo.svg"

ENV VITE_APP_TITLE=$VITE_APP_TITLE
ENV VITE_APP_ID=$VITE_APP_ID
ENV VITE_APP_LOGO=$VITE_APP_LOGO

RUN pnpm build

# Production stage
FROM node:25-alpine AS production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@9 --activate

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --frozen-lockfile --prod

# Copy built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/drizzle ./drizzle

# Set ownership
RUN chown -R nodejs:nodejs /app

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start application
ENV NODE_ENV=production
ENV PORT=3000

CMD ["node", "dist/server/index.js"]
