# Production Dockerfile for DeFi Execution Engine
FROM node:18-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./
COPY tsconfig.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY src/ ./src/

# Build TypeScript
RUN npm run build

# Production stage
FROM node:18-alpine

# Install security updates
RUN apk --no-cache add ca-certificates && \
    apk update && apk upgrade

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S defiengine -u 1001

# Set working directory
WORKDIR /app

# Copy built application
COPY --from=builder --chown=defiengine:nodejs /app/dist ./dist
COPY --from=builder --chown=defiengine:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=defiengine:nodejs /app/package*.json ./

# Create logs directory
RUN mkdir -p logs && chown defiengine:nodejs logs

# Switch to non-root user
USER defiengine

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "const http = require('http'); \
    const options = { host: 'localhost', port: 3001, path: '/api/health', timeout: 2000 }; \
    const req = http.request(options, (res) => { \
      if (res.statusCode === 200) process.exit(0); else process.exit(1); \
    }); \
    req.on('error', () => process.exit(1)); \
    req.end();"

# Start application
CMD ["node", "dist/index.js"]