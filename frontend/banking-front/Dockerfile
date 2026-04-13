FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --prefer-offline


COPY . .
RUN npm run build

# macbre/nginx-http3 is nginx compiled with ngx_brotli, HTTP/3
FROM macbre/nginx-http3:latest AS runtime

COPY docker/nginx.conf.template /etc/nginx/nginx.conf.template

# Copy built assets
COPY --from=builder /app/dist/banking-front/browser /usr/share/nginx/html

EXPOSE 80

# envsubst replaces ${BACKEND_URL} in the template before nginx starts
CMD ["/bin/sh", "-c", "envsubst '${BACKEND_URL}' < /etc/nginx/nginx.conf.template > /tmp/nginx.conf && exec nginx -c /tmp/nginx.conf -g 'daemon off;'"]
