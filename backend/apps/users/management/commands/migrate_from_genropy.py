"""
Management command to migrate data from GenroPy database (exercise/glf schema)
to the new Django database.

Usage:
    python manage.py migrate_from_genropy
    python manage.py migrate_from_genropy --dry-run    # preview without writing
    python manage.py migrate_from_genropy --only=clubs  # migrate only specific table
"""
from django.core.management.base import BaseCommand
from django.db import connections, transaction
from decimal import Decimal


class Command(BaseCommand):
    help = 'Migrate data from GenroPy database (exercise/glf) to Django database'

    VALID_TABLES = ['users', 'clubs', 'holes', 'hcp_allocations', 'matches',
                    'golfers', 'scores', 'rankings', 'results']

    def add_arguments(self, parser):
        parser.add_argument(
            '--dry-run',
            action='store_true',
            help='Preview migration without writing to database',
        )
        parser.add_argument(
            '--only',
            type=str,
            help=f'Migrate only a specific table. Options: {", ".join(self.VALID_TABLES)}',
        )

    def handle(self, *args, **options):
        self.dry_run = options['dry_run']
        only = options.get('only')

        if self.dry_run:
            self.stdout.write(self.style.WARNING('=== DRY RUN - nessuna scrittura ===\n'))

        self.genropy_conn = connections['genropy']

        if only:
            if only not in self.VALID_TABLES:
                self.stderr.write(f'Tabella non valida: {only}. Opzioni: {", ".join(self.VALID_TABLES)}')
                return
            getattr(self, f'migrate_{only}')()
        else:
            self.migrate_users()
            self.migrate_clubs()
            self.migrate_holes()
            self.migrate_hcp_allocations()
            self.migrate_golfers()
            self.migrate_matches()
            self.migrate_scores()
            self.migrate_rankings()
            self.migrate_results()

        self.stdout.write(self.style.SUCCESS('\nMigrazione completata!'))

    def query_genropy(self, sql, params=None):
        """Execute a query on the GenroPy database."""
        with self.genropy_conn.cursor() as cursor:
            cursor.execute(sql, params)
            columns = [col[0] for col in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]

    # ------------------------------------------------------------------
    # USERS
    # ------------------------------------------------------------------
    def migrate_users(self):
        from apps.users.models import User

        self.stdout.write('Migrazione utenti...')
        rows = self.query_genropy("""
            SELECT id, username, firstname, lastname, email, status
            FROM adm.adm_user
            WHERE username IS NOT NULL
        """)
        self.stdout.write(f'  Trovati {len(rows)} utenti nel DB GenroPy')

        if self.dry_run:
            for r in rows:
                self.stdout.write(f'  -> {r["username"]} ({r["firstname"]} {r["lastname"]})')
            return

        created = 0
        skipped = 0
        for r in rows:
            _, was_created = User.objects.update_or_create(
                username=r['username'],
                defaults={
                    'first_name': r.get('firstname') or '',
                    'last_name': r.get('lastname') or '',
                    'email': r.get('email') or '',
                    'is_active': r.get('status') == 'conf',
                },
            )
            if was_created:
                created += 1
            else:
                skipped += 1

        self.stdout.write(self.style.SUCCESS(
            f'  Utenti: {created} creati, {skipped} aggiornati'
        ))
        # Store user mapping for later use
        self._build_user_map()

    def _build_user_map(self):
        """Build mapping from GenroPy user ID to Django user."""
        from apps.users.models import User

        rows = self.query_genropy('SELECT id, username FROM adm.adm_user')
        django_users = {u.username: u for u in User.objects.all()}
        self._user_map = {}
        for r in rows:
            if r['username'] in django_users:
                self._user_map[r['id']] = django_users[r['username']]

    # ------------------------------------------------------------------
    # CLUBS
    # ------------------------------------------------------------------
    def migrate_clubs(self):
        from apps.clubs.models import Club

        self.stdout.write('Migrazione club...')
        rows = self.query_genropy("""
            SELECT id, ragione_sociale, descrizione, indirizzo, numero_civico,
                   cap, localita, provincia, note, telefono, cellulare, fax,
                   email, pec, www, hcp_max
            FROM glf.glf_club
        """)
        self.stdout.write(f'  Trovati {len(rows)} club')

        if self.dry_run:
            for r in rows:
                self.stdout.write(f'  -> {r["ragione_sociale"]}')
            return

        created = 0
        for r in rows:
            _, was_created = Club.objects.update_or_create(
                legacy_id=r['id'],
                defaults={
                    'ragione_sociale': r.get('ragione_sociale') or '',
                    'descrizione': r.get('descrizione') or '',
                    'indirizzo': r.get('indirizzo') or '',
                    'numero_civico': r.get('numero_civico') or '',
                    'cap': r.get('cap') or '',
                    'localita': r.get('localita') or '',
                    'provincia': r.get('provincia') or '',
                    'note': r.get('note') or '',
                    'telefono': r.get('telefono') or '',
                    'cellulare': r.get('cellulare') or '',
                    'fax': r.get('fax') or '',
                    'email': r.get('email') or '',
                    'pec': r.get('pec') or '',
                    'www': r.get('www') or '',
                    'hcp_max': r.get('hcp_max'),
                },
            )
            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(f'  Club: {created} creati'))

    def _get_club_map(self):
        from apps.clubs.models import Club
        return {c.legacy_id: c for c in Club.objects.exclude(legacy_id__isnull=True)}

    # ------------------------------------------------------------------
    # HOLES (percorso)
    # ------------------------------------------------------------------
    def migrate_holes(self):
        from apps.courses.models import Hole

        self.stdout.write('Migrazione buche (percorso)...')
        rows = self.query_genropy("""
            SELECT id, club_id, nr_buca, denominazione, descrizione, note,
                   nr_colpi, distanza_t_rossi, distanza_t_gialli, hcp_buca
            FROM glf.glf_percorso
            ORDER BY club_id, nr_buca
        """)
        self.stdout.write(f'  Trovate {len(rows)} buche')

        if self.dry_run:
            for r in rows:
                self.stdout.write(f'  -> Club {r["club_id"][:8]}... Buca {r["nr_buca"]}')
            return

        club_map = self._get_club_map()
        created = 0
        for r in rows:
            club = club_map.get(r['club_id'])
            if not club:
                self.stderr.write(f'  SKIP: Club {r["club_id"]} non trovato per buca {r["nr_buca"]}')
                continue

            _, was_created = Hole.objects.update_or_create(
                legacy_id=r['id'],
                defaults={
                    'club': club,
                    'nr_buca': r['nr_buca'],
                    'denominazione': r.get('denominazione') or '',
                    'descrizione': r.get('descrizione') or '',
                    'note': r.get('note') or '',
                    'nr_colpi': r.get('nr_colpi') or 3,
                    'distanza_t_rossi': r.get('distanza_t_rossi'),
                    'distanza_t_gialli': r.get('distanza_t_gialli'),
                    'hcp_buca': r.get('hcp_buca'),
                },
            )
            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(f'  Buche: {created} create'))

    def _get_hole_map(self):
        from apps.courses.models import Hole
        return {h.legacy_id: h for h in Hole.objects.exclude(legacy_id__isnull=True)}

    # ------------------------------------------------------------------
    # HCP ALLOCATIONS (hcp_percorso)
    # ------------------------------------------------------------------
    def migrate_hcp_allocations(self):
        from apps.courses.models import HcpStrokeAllocation

        self.stdout.write('Migrazione tabella HCP...')
        rows = self.query_genropy("""
            SELECT id, percorso_id, hcp, da_hcp, a_hcp, colpi_aggiuntivi
            FROM glf.glf_hcp_percorso
        """)
        self.stdout.write(f'  Trovate {len(rows)} allocazioni HCP')

        if self.dry_run:
            return

        hole_map = self._get_hole_map()
        created = 0
        for r in rows:
            hole = hole_map.get(r['percorso_id'])
            if not hole:
                continue

            _, was_created = HcpStrokeAllocation.objects.update_or_create(
                legacy_id=r['id'],
                defaults={
                    'hole': hole,
                    'hcp': r.get('hcp'),
                    'da_hcp': r.get('da_hcp'),
                    'a_hcp': r.get('a_hcp'),
                    'colpi_aggiuntivi': r.get('colpi_aggiuntivi') or 0,
                },
            )
            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(f'  Allocazioni HCP: {created} create'))

    # ------------------------------------------------------------------
    # GOLFER PROFILES (anagrafica)
    # ------------------------------------------------------------------
    def migrate_golfers(self):
        from apps.users.models import GolferProfile

        self.stdout.write('Migrazione profili golfisti (anagrafica)...')

        if not hasattr(self, '_user_map'):
            self._build_user_map()

        rows = self.query_genropy("""
            SELECT id, user_id, nr_tessera, hcp
            FROM glf.glf_anagrafica
        """)
        self.stdout.write(f'  Trovati {len(rows)} profili golfista')

        if self.dry_run:
            for r in rows:
                self.stdout.write(f'  -> User {r["user_id"][:8]}... HCP {r["hcp"]}')
            return

        created = 0
        for r in rows:
            user = self._user_map.get(r['user_id'])
            if not user:
                self.stderr.write(f'  SKIP: User {r["user_id"]} non trovato')
                continue

            _, was_created = GolferProfile.objects.update_or_create(
                legacy_id=r['id'],
                defaults={
                    'user': user,
                    'nr_tessera': r.get('nr_tessera') or '',
                    'hcp': Decimal(str(r.get('hcp') or 54)),
                },
            )
            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(f'  Profili golfista: {created} creati'))

    def _get_golfer_map(self):
        from apps.users.models import GolferProfile
        return {g.legacy_id: g for g in GolferProfile.objects.exclude(legacy_id__isnull=True)}

    # ------------------------------------------------------------------
    # MATCHES
    # ------------------------------------------------------------------
    def migrate_matches(self):
        from apps.matches.models import Match

        self.stdout.write('Migrazione match...')
        rows = self.query_genropy("""
            SELECT id, club_id, data, nr_giro
            FROM glf.glf_match
            ORDER BY data desc
        """)
        self.stdout.write(f'  Trovati {len(rows)} match')

        if self.dry_run:
            for r in rows[:10]:
                self.stdout.write(f'  -> {r["data"]} Giro {r["nr_giro"]}')
            if len(rows) > 10:
                self.stdout.write(f'  ... e altri {len(rows) - 10}')
            return

        club_map = self._get_club_map()
        created = 0
        for r in rows:
            club = club_map.get(r['club_id'])
            if not club:
                continue

            _, was_created = Match.objects.update_or_create(
                legacy_id=r['id'],
                defaults={
                    'club': club,
                    'data': r['data'],
                    'nr_giro': r.get('nr_giro') or 1,
                },
            )
            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(f'  Match: {created} creati'))

    def _get_match_map(self):
        from apps.matches.models import Match
        return {m.legacy_id: m for m in Match.objects.exclude(legacy_id__isnull=True)}

    # ------------------------------------------------------------------
    # SCORES
    # ------------------------------------------------------------------
    def migrate_scores(self):
        from apps.matches.models import Score

        self.stdout.write('Migrazione scores...')
        rows = self.query_genropy("""
            SELECT id, match_id, percorso_id, anagrafica_id, club_id,
                   colpi_giocati, colpi_aggiuntivi, par_giocatore, terminato
            FROM glf.glf_score
        """)
        self.stdout.write(f'  Trovati {len(rows)} score')

        if self.dry_run:
            self.stdout.write(f'  (preview non disponibile per {len(rows)} righe)')
            return

        match_map = self._get_match_map()
        hole_map = self._get_hole_map()
        golfer_map = self._get_golfer_map()
        club_map = self._get_club_map()

        created = 0
        skipped = 0
        batch = []

        for r in rows:
            match = match_map.get(r['match_id'])
            hole = hole_map.get(r['percorso_id'])
            golfer = golfer_map.get(r['anagrafica_id'])
            club = club_map.get(r['club_id'])

            if not all([match, hole, golfer, club]):
                skipped += 1
                continue

            # Check if already exists
            if Score.objects.filter(legacy_id=r['id']).exists():
                continue

            batch.append(Score(
                legacy_id=r['id'],
                match=match,
                hole=hole,
                golfer=golfer,
                club=club,
                colpi_giocati=r.get('colpi_giocati'),
                colpi_aggiuntivi=r.get('colpi_aggiuntivi') or 0,
                par_giocatore=r.get('par_giocatore') or hole.nr_colpi,
                terminato=bool(r.get('terminato')),
            ))

            if len(batch) >= 500:
                Score.objects.bulk_create(batch)
                created += len(batch)
                batch = []

        if batch:
            Score.objects.bulk_create(batch)
            created += len(batch)

        self.stdout.write(self.style.SUCCESS(
            f'  Score: {created} creati, {skipped} saltati (FK mancanti)'
        ))

    # ------------------------------------------------------------------
    # RANKINGS (classifica)
    # ------------------------------------------------------------------
    def migrate_rankings(self):
        from apps.matches.models import Ranking

        self.stdout.write('Migrazione classifiche...')
        rows = self.query_genropy("""
            SELECT id, match_id, anagrafica_id, posizione
            FROM glf.glf_classifica
        """)
        self.stdout.write(f'  Trovate {len(rows)} classifiche')

        if self.dry_run:
            return

        match_map = self._get_match_map()
        golfer_map = self._get_golfer_map()

        created = 0
        for r in rows:
            match = match_map.get(r['match_id'])
            golfer = golfer_map.get(r['anagrafica_id'])
            if not match or not golfer:
                continue

            # Calculate points from migrated scores
            from apps.matches.models import Score
            from django.db.models import Sum, Case, When, Value, IntegerField, F

            punti_agg = Score.objects.filter(
                match=match, golfer=golfer,
            ).aggregate(
                tot=Sum(
                    Case(
                        When(colpi_giocati__isnull=True, then=Value(0)),
                        When(colpi_giocati=0, then=Value(0)),
                        When(colpi_giocati__gt=F('par_giocatore') + 2, then=Value(0)),
                        default=F('par_giocatore') + 2 - F('colpi_giocati'),
                        output_field=IntegerField(),
                    )
                )
            )

            _, was_created = Ranking.objects.update_or_create(
                legacy_id=r['id'],
                defaults={
                    'match': match,
                    'golfer': golfer,
                    'posizione': r.get('posizione'),
                    'punti': punti_agg['tot'] or 0,
                },
            )
            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(f'  Classifiche: {created} create'))

    # ------------------------------------------------------------------
    # RESULTS (risultati variazione HCP)
    # ------------------------------------------------------------------
    def migrate_results(self):
        from apps.results.models import OfficialResult

        self.stdout.write('Migrazione risultati HCP...')

        if not hasattr(self, '_user_map'):
            self._build_user_map()

        rows = self.query_genropy("""
            SELECT id, user_id, data, tesserato, numero_tessera, gara,
                   processo, motivazione_variazione, esecutore, giro,
                   formula, buche, valida, playing_hcp, par, cr, sr,
                   stbl, ags, pcc, sd, corr_sd, corr,
                   index_vecchio, index_nuovo, variazione, _row_count
            FROM glf.glf_result
            ORDER BY _row_count desc
        """)
        self.stdout.write(f'  Trovati {len(rows)} risultati HCP')

        if self.dry_run:
            for r in rows[:5]:
                self.stdout.write(f'  -> {r["data"]} - {r["gara"]} SD:{r["sd"]}')
            if len(rows) > 5:
                self.stdout.write(f'  ... e altri {len(rows) - 5}')
            return

        created = 0
        batch = []
        for r in rows:
            user = self._user_map.get(r['user_id'])
            if not user:
                continue

            if OfficialResult.objects.filter(legacy_id=r['id']).exists():
                continue

            sd_val = None
            if r.get('sd') is not None:
                try:
                    sd_val = Decimal(str(r['sd']))
                except Exception:
                    pass

            batch.append(OfficialResult(
                legacy_id=r['id'],
                user=user,
                data=r.get('data'),
                tesserato=str(r.get('tesserato') or ''),
                numero_tessera=str(r.get('numero_tessera') or ''),
                gara=str(r.get('gara') or ''),
                processo=str(r.get('processo') or ''),
                motivazione_variazione=str(r.get('motivazione_variazione') or ''),
                esecutore=str(r.get('esecutore') or ''),
                giro=str(r.get('giro') or ''),
                formula=str(r.get('formula') or ''),
                buche=str(r.get('buche') or ''),
                valida=str(r.get('valida') or ''),
                playing_hcp=str(r.get('playing_hcp') or ''),
                par=str(r.get('par') or ''),
                cr=str(r.get('cr') or ''),
                sr=str(r.get('sr') or ''),
                stbl=str(r.get('stbl') or ''),
                ags=str(r.get('ags') or ''),
                pcc=str(r.get('pcc') or ''),
                sd=sd_val,
                corr_sd=str(r.get('corr_sd') or ''),
                corr=str(r.get('corr') or ''),
                index_vecchio=str(r.get('index_vecchio') or ''),
                index_nuovo=str(r.get('index_nuovo') or ''),
                variazione=str(r.get('variazione') or ''),
                row_count=r.get('_row_count'),
            ))

            if len(batch) >= 500:
                OfficialResult.objects.bulk_create(batch)
                created += len(batch)
                batch = []

        if batch:
            OfficialResult.objects.bulk_create(batch)
            created += len(batch)

        self.stdout.write(self.style.SUCCESS(f'  Risultati HCP: {created} creati'))
