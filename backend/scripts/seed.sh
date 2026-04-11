#!/bin/sh
set -e

PROFILE="${SEED_PROFILE:-dev}"
SQL_FILE="/scripts/sql/seed-${PROFILE}.sql"

echo "[seed] Profile: $PROFILE"

if [ ! -f "$SQL_FILE" ]; then
    echo "[seed] ERROR: No seed file for profile '$PROFILE' (expected $SQL_FILE)"
    exit 1
fi

psql \
    --set=admin_username="${ADMIN_USERNAME:-admin}" \
    --set=admin_password="${ADMIN_PASSWORD:-admin123}" \
    -f "$SQL_FILE"

echo "[seed] Completed."
