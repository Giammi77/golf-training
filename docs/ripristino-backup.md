# Ripristino da backup (guida rapida)

Guida per rimettere in piedi Golf Training partendo dall'archivio di backup, ad
esempio dopo la chiusura del server. Per la procedura completa di migrazione
(downtime, DNS, dismissione) vedi [backup-e-migrazione.md](backup-e-migrazione.md).

## Cosa contiene il backup

L'archivio cifrato `golf-backup_AAAAMMGG.tar.gz.enc` contiene la cartella
`golf-backup/` con:

| File | Contenuto |
|---|---|
| `golf_AAAAMMGG.dump` | Database PostgreSQL in formato custom (`pg_dump -Fc`): utenti, club, buche, match, punteggi, risultati, classifiche |
| `env.backup` | File `.env` del server: secret key Django e credenziali del DB. **Non è nel repo** |
| `media_AAAAMMGG.tar.gz` | File caricati dagli utenti (al 23/10/2026 era vuoto) |

Il codice non è nel backup: sta su GitHub (`Giammi77/golf-training`).

## Dove si trova

- Copia sul server `mmlab`: `~/golf-backup/` (utente `deploy`, alias SSH `mmlab`).
- Copia sul Mac di Gianmaria: `~/Desktop/golf-backup/`.
- La **password di cifratura** dell'archivio è nel gestore di password. Senza
  quella l'archivio non si apre.

## 1. Aprire l'archivio

```bash
scp mmlab:~/golf-backup/golf-backup_AAAAMMGG.tar.gz.enc .
openssl enc -d -aes-256-cbc -pbkdf2 -in golf-backup_AAAAMMGG.tar.gz.enc | tar xzf -
ls golf-backup
```

## 2. Preparare il nuovo server

Serve un server con Docker e il plugin Compose.

```bash
git clone https://github.com/Giammi77/golf-training.git
cd golf-training
mkdir -p backups
cp ../golf-backup/golf_AAAAMMGG.dump backups/
cp ../golf-backup/env.backup .env
```

Nel `.env` aggiornare i valori legati al dominio:

```
ALLOWED_HOSTS=<nuovo-dominio>,localhost
CORS_ALLOWED_ORIGINS=https://<nuovo-dominio>
```

Gli altri valori (`DJANGO_SECRET_KEY`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) vanno
lasciati com'erano. `DB_USER` era `genropy_user` e `DB_NAME` era `golf`.

## 3. Avviare il database e ripristinare i dati

```bash
docker compose up -d db
docker compose ps                    # attendere "healthy"
docker compose up -d backend
docker compose exec backend python manage.py migrate
./scripts/restore_db.sh backups/golf_AAAAMMGG.dump
docker compose up -d --build
```

`restore_db.sh` chiede conferma perché sovrascrive il database.

Se c'erano file in `media_*.tar.gz` (non vuoto):

```bash
docker run --rm -v golf-training_backend_media:/data -v "$PWD/../golf-backup:/backup" \
    alpine tar xzf /backup/media_AAAAMMGG.tar.gz -C /data
```

## 4. Esporre l'app con nginx e HTTPS

Nel `docker-compose.yml` backend, frontend e DB sono legati a `127.0.0.1`
(porte 8000, 3000, 5433): non sono raggiungibili da fuori, serve un nginx
sull'host che faccia da proxy. Esempio di sito
(`/etc/nginx/sites-available/golf-training`):

```nginx
server {
    listen 80;
    server_name <nuovo-dominio>;
    client_max_body_size 10M;

    location /api/    { proxy_pass http://127.0.0.1:8000; include proxy_params; }
    location /admin/  { proxy_pass http://127.0.0.1:8000; include proxy_params; }
    location /static/ { proxy_pass http://127.0.0.1:8000; include proxy_params; }
    location /media/  { proxy_pass http://127.0.0.1:8000; include proxy_params; }
    location /        { proxy_pass http://127.0.0.1:3000; include proxy_params; }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/golf-training /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d <nuovo-dominio>
```

Il dominio (DuckDNS, DNS di un dominio proprio, ecc.) deve puntare all'IP del
nuovo server **prima** di lanciare certbot. Le porte 80 e 443 devono essere
aperte.

## 5. Verifica

- `docker compose ps`: tre container in funzione, DB `healthy`.
- `docker compose logs backend --tail=30`: nessun errore.
- Login dal browser con un utente reale.
- Storico match, classifiche e risultati HCP presenti.
- Accesso a `/admin/`.
- Dall'esterno le porte 3000, 8000 e 5433 devono risultare chiuse.

## Problemi noti

- **Errore `role "genropy_user" does not exist`** durante il ripristino: `DB_USER`
  nel `.env` non coincide con quello del dump. Usare `genropy_user`, oppure
  ripristinare con `--no-owner` (già impostato in `restore_db.sh`).
- **`DisallowedHost` o errori CORS** nel browser: `ALLOWED_HOSTS` e
  `CORS_ALLOWED_ORIGINS` non contengono il nuovo dominio.
- **`nginx -t` fallisce** per file di altri siti: non riavviare nginx; correggere
  prima il file indicato nell'errore, poi `reload`.
- **Disco pieno** durante il build: `docker builder prune -af` e
  `docker image prune -af` non toccano i volumi. Non usare `docker volume prune`
  né `docker compose down -v`: cancellano i dati.

## Tenere aggiornato il backup

Il dump è una fotografia del giorno in cui è stato fatto. Per aggiornarlo:

```bash
./scripts/backup_db.sh
```

sul server, poi copiare il nuovo `.dump` nella cartella di backup e ricifrarla.
