# Stage 1: Builder
FROM node:16-alpine AS builder
WORKDIR /app

# Install ALL dependencies (including devDependencies) for building
COPY package*.json ./
RUN npm ci  # This installs both dependencies and devDependencies

# Copy source and build
COPY . .
RUN npm run build

# Stage 2: Runtime
FROM node:16-alpine
WORKDIR /app

# Install ONLY production dependencies
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production

# Copy built files
COPY --from=builder /app/dist ./dist

EXPOSE 3000
CMD ["node", "dist/app.js"]