# Guida Amministratore - Golf Training

## Accesso al pannello di gestione

L'amministratore ha a disposizione due strumenti:

1. **Pannello Gestione Giocatori** (frontend): `https://golf-training.ddns.net/gestione/giocatori`
2. **Django Admin** (backend): `https://golf-training.ddns.net/admin/`

Per accedere a entrambi, l'utente deve avere il flag `is_staff = True`.

---

## Pannello Gestione Giocatori (Frontend)

Accessibile dall'app tramite il tab **Admin** nella barra di navigazione in basso (visibile solo per gli amministratori).

### Funzionalita'

- **Lista giocatori**: mostra tutti i giocatori attivi con cognome, nome, numero tessera e handicap
- **Reset password**: per ogni giocatore e' presente il pulsante "Reset Password" che:
  - Chiede conferma prima di procedere
  - Mostra la password che verra' impostata
  - Imposta la password al valore di default: `cognomenome` (tutto minuscolo, senza spazi)

### Esempio di password di default

| Cognome  | Nome    | Password         |
|----------|---------|------------------|
| Rossi    | Mario   | `rossimario`     |
| De Luca  | Anna    | `delucaanna`     |
| Bianchi  | Luca    | `bianchiluca`    |

---

## Django Admin

Accessibile da `https://golf-training.ddns.net/admin/` con le credenziali di un utente superuser.

### Reset password dal Django Admin

1. Vai su **Utenti** (Users)
2. Seleziona uno o piu' utenti dalla lista
3. Dal menu azioni in alto, scegli **"Reset password al default (cognomenome)"**
4. Clicca **"Esegui"**
5. Un messaggio di conferma indichera' quante password sono state resettate

---

## Gestione profilo giocatore

Ogni giocatore puo' autonomamente dalla pagina **Profilo**:

- Modificare i propri dati (nome, cognome, email, handicap, tessera)
- **Cambiare la propria password**: inserendo la password attuale e la nuova password

---

## Promuovere un utente ad amministratore

Da terminale sul server:

```bash
docker compose exec backend python manage.py shell -c "
from apps.users.models import User
u = User.objects.get(username='USERNAME')
u.is_staff = True
u.is_superuser = True
u.save()
print('Utente promosso ad amministratore')
"
```

Oppure dal Django Admin: modifica l'utente e spunta i flag **Stato staff** e **Stato superutente**.
