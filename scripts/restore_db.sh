#!/usr/bin/env bash
# Ripristina un dump creato da backup_db.sh nel container "db".
# ATTENZIONE: sovrascrive il contenuto del database di destinazione.
#
# Uso: ./scripts/restore_db.sh backups/golf_20260716_030000.dump

set -euo pipefail

if [ $# -ne 1 ] || [ ! -f "$1" ]; then
    echo "Uso: $0 <file.dump>" >&2
    exit 1
fi

DUMP_FILE="$1"
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [ -f "$PROJECT_DIR/.env" ]; then
    set -a
    # shellcheck source=/dev/null
    . "$PROJECT_DIR/.env"
    set +a
fi

DB_NAME="${DB_NAME:-golf}"
DB_USER="${DB_USER:-postgres}"

read -r -p "Sto per SOVRASCRIVERE il database '$DB_NAME'. Continuare? [y/N] " reply
[ "$reply" = "y" ] || { echo "Annullato."; exit 0; }

cd "$PROJECT_DIR"
docker compose exec -T db pg_restore -U "$DB_USER" -d "$DB_NAME" \
    --clean --if-exists --no-owner < "$DUMP_FILE"

echo "Restore completato da $DUMP_FILE"
