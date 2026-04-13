# ─── Stage 1: build ──────────────────────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --prefer-offline


COPY . .
RUN npm run build

# macbre/nginx-http3 is nginx compiled with ngx_brotli, HTTP/3 and njs
FROM macbre/nginx-http3:latest AS runtime

# Copy custom nginx config
COPY docker/nginx.conf /etc/nginx/nginx.conf

# Copy built assets
COPY --from=builder /app/dist/banking-front/browser /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
