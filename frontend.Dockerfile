# Use Node.js 22.12.0 as specified in package.json engines
FROM node:22.12.0-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Install necessary dependencies for Alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy package files (workspace root and frontend)
COPY package.json package-lock.json* ./
COPY frontend/package.json ./frontend/

# Install dependencies for the entire workspace (includes shared deps like zod)
RUN npm install && npm cache clean --force

# Build stage
FROM base AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy frontend source files
COPY frontend/ ./frontend/

# Build the frontend application
WORKDIR /app/frontend
RUN npm run build

# Production image, use Node.js to serve static files
FROM node:22.12.0-alpine AS runner

# Install serve package globally and curl for healthcheck
RUN npm install -g serve@14.2.3 && \
    apk add --no-cache curl

# Create app directory
WORKDIR /app

# Copy built application from builder stage
COPY --from=builder /app/frontend/dist ./dist

# Create a non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001 -G nodejs && \
    chown -R nextjs:nodejs /app

USER nextjs

# Expose port 3000
EXPOSE 3000

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000/ || exit 1

# Start the application using serve
CMD ["serve", "-s", "dist", "-l", "3000"]
