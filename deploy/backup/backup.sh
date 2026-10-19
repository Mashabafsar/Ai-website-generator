#!/bin/sh
# Nightly pg_dump with daily and weekly retention.
#
#   sh backup.sh         loop forever: one dump per day at BACKUP_HOUR (UTC)
#   sh backup.sh once    take one dump now and exit
#
# Dumps use the custom format (-Fc), so restore them with pg_restore.
set -eu

: "${PGHOST:=postgres}"
: "${PGUSER:?PGUSER is required}"
: "${PGDATABASE:?PGDATABASE is required}"
: "${PGPASSWORD:?PGPASSWORD is required}"
export PGHOST PGUSER PGDATABASE PGPASSWORD

BACKUP_DIR="${BACKUP_DIR:-/backups}"
BACKUP_HOUR="${BACKUP_HOUR:-3}"
KEEP_DAILY="${BACKUP_KEEP_DAILY:-7}"
KEEP_WEEKLY="${BACKUP_KEEP_WEEKLY:-4}"
DAILY_DIR="$BACKUP_DIR/daily"
WEEKLY_DIR="$BACKUP_DIR/weekly"

mkdir -p "$DAILY_DIR" "$WEEKLY_DIR"

log() {
  echo "$(date -u +%Y-%m-%dT%H:%M:%SZ) $*"
}

# Keeps the newest $2 dumps in directory $1. File names sort by date.
prune() {
  ls -1 "$1" | grep '\.dump$' | sort -r | tail -n "+$(($2 + 1))" | while read -r old; do
    rm -f "$1/$old"
    log "removed $1/$old"
  done
}

daily_path() {
  echo "$DAILY_DIR/$PGDATABASE-$(date -u +%Y-%m-%d).dump"
}

run_backup() {
  target="$(daily_path)"
  partial="$target.partial"
  if ! pg_dump -Fc --no-owner --no-acl -f "$partial"; then
    rm -f "$partial"
    log "pg_dump failed; will retry"
    return 1
  fi
  mv "$partial" "$target"
  log "wrote $target ($(du -h "$target" | cut -f1))"

  # Sunday's dump also becomes the weekly copy.
  if [ "$(date -u +%u)" = "7" ]; then
    cp "$target" "$WEEKLY_DIR/$(basename "$target")"
    log "kept weekly copy of $(basename "$target")"
  fi

  prune "$DAILY_DIR" "$KEEP_DAILY"
  prune "$WEEKLY_DIR" "$KEEP_WEEKLY"
}

if [ "${1:-}" = "once" ]; then
  run_backup
  exit $?
fi

log "backups run daily after ${BACKUP_HOUR}:00 UTC into $BACKUP_DIR (keep $KEEP_DAILY daily, $KEEP_WEEKLY weekly)"
until pg_isready -q; do
  sleep 5
done

# Checking every few minutes, instead of sleeping until a fixed time, means a
# restart or a failed dump still produces today's backup.
while true; do
  hour="$(date -u +%H)"
  if [ "${hour#0}" -ge "$BACKUP_HOUR" ] && [ ! -f "$(daily_path)" ]; then
    run_backup || true
  fi
  sleep 300
done
