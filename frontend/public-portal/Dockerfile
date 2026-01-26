# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files (support building from repo root as context)
COPY frontend/public-portal/package*.json ./

# Install dependencies
RUN npm install

# Copy source code (support building from repo root as context)
COPY frontend/public-portal/. ./

# Build the app
RUN npm run build

# Stage 2: Runtime (Nginx + SPA)
FROM nginx:alpine

# Remove default nginx config
RUN rm /etc/nginx/conf.d/default.conf

# Copy custom nginx config for SPA (now using repo root nginx.conf)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built app from builder
COPY --from=builder /app/build /usr/share/nginx/html

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost:3000/ || exit 1

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
