# Stage 1: Build
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production # Install only production deps
COPY . .
RUN npm run build

# Stage 2: Run
FROM node:16-alpine
WORKDIR /app

# Install dependencies for production only
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production --omit=dev

# Copy built files from builder
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/.env.production ./.env 

# Security hardening
RUN apk add --no-cache dumb-init && \
    chown -R node:node /app
USER node

EXPOSE 3000
ENTRYPOINT ["/usr/bin/dumb-init", "--"]
CMD ["node", "dist/app.js"]