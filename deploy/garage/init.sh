#!/usr/bin/env bash
# One-time Garage bootstrap for the Docker Compose stack. Safe to re-run.
#
# Run on the host from anywhere inside the repo, after `docker compose up -d garage`:
#   bash deploy/garage/init.sh
#
# Optional overrides: GARAGE_CAPACITY (default 50G), GARAGE_ZONE (dc1),
# GARAGE_KEY_NAME (app), S3_MEDIA_BUCKET (media), S3_SITES_BUCKET (sites),
# MEDIA_DOMAIN (read from .env when unset).
set -euo pipefail

# Git Bash on Windows would otherwise rewrite /garage into a Windows path.
export MSYS_NO_PATHCONV=1

cd "$(dirname "${BASH_SOURCE[0]}")/../.."

# Reads NAME=value from .env without sourcing it, so values are never executed.
env_file_value() {
  [[ -f .env ]] || return 0
  grep -E "^[[:space:]]*$1=" .env | tail -n 1 | cut -d= -f2- | tr -d '\r' |
    sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//' -e 's/^"\(.*\)"$/\1/' -e "s/^'\(.*\)'$/\1/"
}

CAPACITY="${GARAGE_CAPACITY:-50G}"
ZONE="${GARAGE_ZONE:-dc1}"
KEY_NAME="${GARAGE_KEY_NAME:-app}"
MEDIA_BUCKET="${S3_MEDIA_BUCKET:-media}"
SITES_BUCKET="${S3_SITES_BUCKET:-sites}"
MEDIA_DOMAIN="${MEDIA_DOMAIN:-$(env_file_value MEDIA_DOMAIN)}"
PUBLIC_URL="${S3_PUBLIC_URL:-$(env_file_value S3_PUBLIC_URL)}"
# Host the browser sends. A port in S3_PUBLIC_URL is not part of the alias.
PUBLIC_HOST=""
if [[ -n "$PUBLIC_URL" ]]; then
  PUBLIC_HOST="$(printf '%s' "$PUBLIC_URL" | sed -E 's#^[a-zA-Z][a-zA-Z0-9+.-]*://##' | cut -d/ -f1 | cut -d: -f1)"
fi

if [[ -z "$MEDIA_DOMAIN" ]]; then
  echo "MEDIA_DOMAIN is not set. Add it to .env (for example media.example.com) and re-run." >&2
  exit 1
fi

garage() {
  docker compose exec -T garage /garage "$@"
}

# Garage logs INFO lines on stderr for every CLI call; keep stdout for output we parse.
garage_quiet() {
  garage "$@" 2>/dev/null
}

echo "Waiting for Garage..."
for attempt in $(seq 1 30); do
  if garage_quiet status >/dev/null; then
    break
  fi
  if [[ "$attempt" -eq 30 ]]; then
    echo "Garage did not answer. Is it running? Try: docker compose up -d garage" >&2
    exit 1
  fi
  sleep 2
done

node_id="$(garage_quiet node id -q | tr -d '\r' | cut -d@ -f1)"
if [[ -z "$node_id" ]]; then
  echo "Could not read the Garage node id." >&2
  exit 1
fi
echo "Node: ${node_id:0:16}"

cluster_status="$(garage_quiet status)"
if grep -q "NO ROLE ASSIGNED" <<<"$cluster_status"; then
  echo "Assigning layout: zone $ZONE, capacity $CAPACITY"
  garage_quiet layout assign -z "$ZONE" -c "$CAPACITY" "$node_id" >/dev/null
  current_version="$(garage_quiet layout show | tr -d '\r' |
    sed -n 's/^Current cluster layout version: \([0-9][0-9]*\).*/\1/p')"
  if [[ -z "$current_version" ]]; then
    echo "Could not read the current layout version from 'garage layout show'." >&2
    exit 1
  fi
  garage_quiet layout apply --version "$((current_version + 1))" >/dev/null
  echo "Layout applied (version $((current_version + 1)))."
else
  echo "Layout already has a role for this node. Skipping."
fi

for bucket in "$MEDIA_BUCKET" "$SITES_BUCKET"; do
  if garage_quiet bucket info "$bucket" >/dev/null; then
    echo "Bucket $bucket exists."
  else
    garage_quiet bucket create "$bucket" >/dev/null
    echo "Created bucket $bucket."
  fi
done

if garage_quiet key info "$KEY_NAME" >/dev/null; then
  echo "Key $KEY_NAME exists. Reusing it."
else
  garage_quiet key create "$KEY_NAME" >/dev/null
  echo "Created key $KEY_NAME."
fi

for bucket in "$MEDIA_BUCKET" "$SITES_BUCKET"; do
  garage_quiet bucket allow --read --write --owner "$bucket" --key "$KEY_NAME" >/dev/null
done
echo "Key $KEY_NAME can read, write and own $MEDIA_BUCKET and $SITES_BUCKET."

garage_quiet bucket website --allow "$MEDIA_BUCKET" >/dev/null
garage_quiet bucket alias "$MEDIA_BUCKET" "$MEDIA_DOMAIN" >/dev/null
echo "Bucket $MEDIA_BUCKET is served by the web endpoint as $MEDIA_DOMAIN."

# The public URL can use a different host than MEDIA_DOMAIN (local loopback,
# where media.localhost does not resolve). Garage picks the bucket from Host.
if [[ -n "$PUBLIC_HOST" && "$PUBLIC_HOST" != "$MEDIA_DOMAIN" ]]; then
  garage_quiet bucket alias "$MEDIA_BUCKET" "$PUBLIC_HOST" >/dev/null
  echo "Bucket $MEDIA_BUCKET is also served as $PUBLIC_HOST."
fi

key_info="$(garage_quiet key info --show-secret "$KEY_NAME" | tr -d '\r')"
key_id="$(sed -n 's/^Key ID:[[:space:]]*//p' <<<"$key_info")"
secret_key="$(sed -n 's/^Secret key:[[:space:]]*//p' <<<"$key_info")"
if [[ -z "$key_id" || -z "$secret_key" ]]; then
  echo "Could not read the key values from 'garage key info'." >&2
  exit 1
fi

cat <<EOF

Garage is ready. Put these lines in .env, then run: docker compose up -d --build

S3_ACCESS_KEY_ID=$key_id
S3_SECRET_ACCESS_KEY=$secret_key
S3_MEDIA_BUCKET=$MEDIA_BUCKET
S3_SITES_BUCKET=$SITES_BUCKET
S3_PUBLIC_URL=${PUBLIC_URL:-https://$MEDIA_DOMAIN}
EOF
