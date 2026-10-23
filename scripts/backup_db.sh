#!/usr/bin/env bash
# Backup del database PostgreSQL di produzione (container "db" del docker-compose).
# Crea un dump in formato custom (pg_restore) in BACKUP_DIR e tiene gli ultimi KEEP file.
#
# Uso:   ./scripts/backup_db.sh [directory-di-destinazione]
# Cron:  0 3 * * * /path/al/progetto/scripts/backup_db.sh >> /var/log/golf-backup.log 2>&1

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BACKUP_DIR="${1:-$PROJECT_DIR/backups}"
KEEP="${KEEP:-14}"

# Legge le variabili dal .env se presente (per DB_NAME/DB_USER personalizzati)
if [ -f "$PROJECT_DIR/.env" ]; then
    set -a
    # shellcheck source=/dev/null
    . "$PROJECT_DIR/.env"
    set +a
fi

DB_NAME="${DB_NAME:-golf}"
DB_USER="${DB_USER:-postgres}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUTFILE="$BACKUP_DIR/golf_${TIMESTAMP}.dump"

mkdir -p "$BACKUP_DIR"

cd "$PROJECT_DIR"
docker compose exec -T db pg_dump -U "$DB_USER" -Fc "$DB_NAME" > "$OUTFILE"

# Verifica minima: il dump non deve essere vuoto
if [ ! -s "$OUTFILE" ]; then
    echo "ERRORE: dump vuoto, backup fallito" >&2
    rm -f "$OUTFILE"
    exit 1
fi

echo "Backup creato: $OUTFILE ($(du -h "$OUTFILE" | cut -f1))"

# Rotazione: tiene solo gli ultimi $KEEP dump
ls -1t "$BACKUP_DIR"/golf_*.dump 2>/dev/null | tail -n +$((KEEP + 1)) | xargs -r rm -f
