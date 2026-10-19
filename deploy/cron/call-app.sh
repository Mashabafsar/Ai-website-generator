#!/bin/sh
# Calls one cron route on the app with the shared bearer secret.
# crond passes the container environment through, so CRON_SECRET comes from compose.
set -eu

path="$1"
started="$(date -u +%Y-%m-%dT%H:%M:%SZ)"

if [ -z "${CRON_SECRET:-}" ]; then
  echo "$started $path skipped: CRON_SECRET is not set"
  exit 1
fi

status="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 300 \
  -H "Authorization: Bearer ${CRON_SECRET}" \
  "${APP_URL:-http://app:3000}${path}")" || status="unreachable"

echo "$started $path -> $status"
[ "$status" = "200" ]
