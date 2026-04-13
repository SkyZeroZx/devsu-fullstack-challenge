#!/bin/sh
set -e

# Render nginx config from template using envsubst (substitutes ${BACKEND_URL})
if [ -f /etc/nginx/nginx.conf.template ]; then
  envsubst '${BACKEND_URL}' < /etc/nginx/nginx.conf.template > /etc/nginx/nginx.conf
fi

exec nginx -g 'daemon off;'
