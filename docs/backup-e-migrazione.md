# Backup del database e migrazione su un altro server

## Backup del database

Lo script [`scripts/backup_db.sh`](../scripts/backup_db.sh) esegue un `pg_dump`
in formato custom dal container `db` e salva il file in `backups/` (o nella
directory passata come argomento). Tiene automaticamente gli ultimi 14 dump
(configurabile con la variabile `KEEP`).

```bash
# Backup manuale
./scripts/backup_db.sh

# Backup automatico ogni notte alle 3:00 (crontab -e sul server)
0 3 * * * /path/al/progetto/scripts/backup_db.sh >> /var/log/golf-backup.log 2>&1
```

**Importante:** un backup che resta sullo stesso server non protegge da un
guasto del server. Copiare periodicamente i dump altrove, ad esempio:

```bash
# Su un'altra macchina / NAS
rsync -av server:/path/al/progetto/backups/ ./golf-backups/

# Oppure su storage S3-compatibile
aws s3 sync /path/al/progetto/backups/ s3://mio-bucket/golf-backups/
```

### Cosa NON copre il dump del database

- **File caricati dagli utenti** (volume `backend_media`): vanno salvati a parte
  (vedi sotto).
- **File statici** (`backend_static`): non serve salvarli, si rigenerano con
  `collectstatic`.

Backup dei media:

```bash
docker run --rm -v golf-training_backend_media:/data -v "$PWD/backups:/backup" \
    alpine tar czf /backup/media_$(date +%Y%m%d).tar.gz -C /data .
```

### Ripristino

```bash
./scripts/restore_db.sh backups/golf_20260716_030000.dump
```

Lo script chiede conferma perché **sovrascrive** il database di destinazione.

### Verifica periodica

Un backup non testato non è un backup. Ogni tanto ripristinare un dump in
locale (con `docker-compose.dev.yml`) e controllare che l'applicazione
funzioni e che i dati recenti ci siano.

---

## Piano di migrazione su un altro server

Tempo stimato: 30–60 minuti, con un downtime effettivo di pochi minuti se si
segue l'ordine indicato.

### 1. Preparare il nuovo server (nessun downtime)

```bash
# Installare Docker + Docker Compose plugin, poi:
git clone <url-del-repo> golf-training
cd golf-training
```

Copiare il file `.env` dal vecchio server (contiene `DJANGO_SECRET_KEY`,
credenziali DB, `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`) — **non è nel repo**:

```bash
scp vecchio-server:/path/al/progetto/.env .
```

Aggiornare in `.env` i valori legati all'host se cambiano
(`ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS`).

Build delle immagini in anticipo, così il cutover è rapido:

```bash
docker compose build
```

### 2. Congelare le scritture sul vecchio server (inizio downtime)

Fermare backend e frontend lasciando su il DB, così nessuno scrive dati
durante la copia:

```bash
docker compose stop backend frontend
```

### 3. Dump finale e trasferimento

```bash
./scripts/backup_db.sh
scp backups/golf_<ultimo>.dump nuovo-server:~/golf-training/backups/

# Media (se presenti)
docker run --rm -v golf-training_backend_media:/data -v "$PWD/backups:/backup" \
    alpine tar czf /backup/media_finale.tar.gz -C /data .
scp backups/media_finale.tar.gz nuovo-server:~/golf-training/backups/
```

### 4. Ripristino sul nuovo server

```bash
cd ~/golf-training

# Avviare solo il DB e attendere che sia healthy
docker compose up -d db
docker compose ps

# Creare lo schema e ripristinare i dati
docker compose up -d backend
docker compose exec backend python manage.py migrate
./scripts/restore_db.sh backups/golf_<ultimo>.dump

# Ripristinare i media
docker run --rm -v golf-training_backend_media:/data -v "$PWD/backups:/backup" \
    alpine tar xzf /backup/media_finale.tar.gz -C /data

# Statici e avvio completo
docker compose exec backend python manage.py collectstatic --noinput
docker compose up -d
```

### 5. Verifica

- Login dal frontend con un utente reale
- Controllo che storico match, classifiche e risultati HCP siano presenti
- Accesso all'admin Django (`/admin/`)
- `docker compose logs backend` senza errori

### 6. Switch del traffico (fine downtime)

Aggiornare il DNS del dominio verso l'IP del nuovo server (o il reverse
proxy, se ce n'è uno davanti). Con un TTL basso impostato in anticipo
(300s, da abbassare **il giorno prima** della migrazione) la propagazione
è questione di minuti.

### 7. Dismissione del vecchio server

Tenere il vecchio server spento ma intatto per almeno una settimana, come
rollback di emergenza. Solo dopo:

```bash
docker compose down -v   # ATTENZIONE: cancella anche i volumi/dati
```

### Note

- Le versioni di PostgreSQL devono coincidere o crescere (il compose fissa
  `postgres:16-alpine`, quindi non è un problema finché non si cambia tag).
- Se il nuovo server ha architettura diversa (es. da x86 ad ARM) non cambia
  nulla: le immagini si ricostruiscono con `docker compose build` e il dump
  è indipendente dall'architettura.
- Il dump con `pg_dump` è coerente anche a caldo (snapshot transazionale):
  il congelamento delle scritture al punto 2 serve solo a non perdere gli
  ultimissimi dati inseriti tra dump e switch.
