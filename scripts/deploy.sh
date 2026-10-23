#!/usr/bin/env bash
# Aggiorna l'applicazione sul server: backup DB, git pull, rebuild e riavvio dei container.
#
# Uso:   ./scripts/deploy.sh
# Opzioni: NO_BACKUP=1 ./scripts/deploy.sh   (salta il backup del DB)

set -euo pipefail

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

if [ "${NO_BACKUP:-0}" != "1" ]; then
    echo "==> Backup del database"
    "$PROJECT_DIR/scripts/backup_db.sh"
fi

echo "==> Download aggiornamenti"
git pull --ff-only

echo "==> Build e riavvio container"
docker compose up -d --build

echo "==> Migrazioni database"
docker compose exec -T backend python manage.py migrate --noinput

echo "==> File statici"
docker compose exec -T backend python manage.py collectstatic --noinput

echo "==> Stato"
docker compose ps
echo "Deploy completato."
