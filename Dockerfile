# ==============================================================================
# AI Labs by Nimbus - Production Dockerfile
# Lean, secure Node.js alpine container for GitHub deployment & cloud hosting
# ==============================================================================

FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Production environment variables
ENV NODE_ENV=production
ENV PORT=3000

# Install wget for healthcheck
RUN apk add --no-cache wget

# Copy package metadata
COPY package.json ./

# Copy application assets and source code
COPY index.html ./
COPY style.css ./
COPY dapper.css ./
COPY script.js ./
COPY server.js ./
COPY sw.js ./
COPY manifest.webmanifest ./
COPY assets/ ./assets/

# Use non-root user for security best practices
USER node

# Expose default HTTP port
EXPOSE 3000

# Healthcheck to monitor container uptime
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/ || exit 1

# Launch application
CMD ["node", "server.js"]
