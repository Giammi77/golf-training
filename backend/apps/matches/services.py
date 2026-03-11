"""
Core business logic for match and score management.
Ported from GenroPy: packages/glf/model/score.py and match.py
"""
from math import ceil
from django.db import transaction
from django.utils import timezone


def calculate_handicap_strokes(holes_ordered_by_hcp, hcp):
    """
    Distribute handicap strokes across holes.

    Port of colpiAggiuntivi() from score.py lines 89-100.
    Holes are ordered by hcp_buca ascending.
    Strokes are distributed cyclically: first pass assigns 1 stroke
    to each hole in HCP order, second pass adds another, etc.

    Args:
        holes_ordered_by_hcp: queryset/list of Hole objects ordered by hcp_buca asc
        hcp: golfer's effective handicap (already ceil'd)

    Returns:
        dict mapping nr_buca to extra strokes
    """
    holes_list = list(holes_ordered_by_hcp)
    nr_buche = len(holes_list)
    if not holes_list or not hcp:
        return {h.nr_buca: 0 for h in holes_list}

    rounds = nr_buche / 18
    total_strokes = ceil(hcp * rounds)

    result = {h.nr_buca: 0 for h in holes_list}
    for i in range(total_strokes):
        hole = holes_list[i % nr_buche]
        result[hole.nr_buca] += 1

    return result


@transaction.atomic
def register_match(club_id, golfer_profile):
    """
    Register a golfer in today's match, creating the match if needed.
    Initializes 18 empty score records.

    Port of registraMatch() from match.py + chkScores() from score.py.
    """
    from apps.clubs.models import Club
    from apps.courses.models import Hole
    from apps.matches.models import Match, Score, Ranking

    club = Club.objects.get(id=club_id)
    today = timezone.localdate()

    # Check if golfer already has scores in an unfinished match today
    existing_match = Match.objects.filter(
        club=club,
        data=today,
        scores__golfer=golfer_profile,
        scores__terminato=False,
    ).first()

    if existing_match:
        return existing_match

    # Find an unfinished match for this club today (no finished scores for any golfer)
    unfinished_match = Match.objects.filter(
        club=club,
        data=today,
    ).exclude(
        scores__terminato=True
    ).order_by('-nr_giro').first()

    if unfinished_match:
        # Check if golfer already has scores in this match
        if not Score.objects.filter(match=unfinished_match, golfer=golfer_profile).exists():
            _initialize_scores(unfinished_match, golfer_profile, club)
        return unfinished_match

    # Get last finished round number for today
    last_finished_giro = Match.objects.filter(
        club=club,
        data=today,
        scores__terminato=True,
    ).values_list('nr_giro', flat=True).order_by('-nr_giro').first() or 0

    # Create new match
    match = Match.objects.create(
        club=club,
        data=today,
        nr_giro=last_finished_giro + 1,
    )

    _initialize_scores(match, golfer_profile, club)
    return match


def _initialize_scores(match, golfer_profile, club):
    """
    Initialize 18 empty score records for a golfer in a match.
    Port of chkScores() from score.py.
    """
    from apps.courses.models import Hole
    from apps.matches.models import Score, Ranking

    # Get golfer HCP, capped by club max
    hcp = golfer_profile.hcp
    if club.hcp_max:
        hcp = min(hcp, club.hcp_max)

    # Get holes ordered by HCP for stroke distribution
    holes_by_hcp = Hole.objects.filter(club=club).order_by('hcp_buca')
    stroke_allocation = calculate_handicap_strokes(holes_by_hcp, ceil(float(hcp)))

    # Get all holes for this club (ordered by nr_buca)
    holes = Hole.objects.filter(club=club).order_by('nr_buca')

    scores = []
    for hole in holes:
        extra_strokes = stroke_allocation.get(hole.nr_buca, 0)
        scores.append(Score(
            match=match,
            hole=hole,
            golfer=golfer_profile,
            club=club,
            colpi_aggiuntivi=extra_strokes,
            par_giocatore=hole.nr_colpi + extra_strokes,
        ))
    Score.objects.bulk_create(scores)

    # Add golfer to ranking
    Ranking.objects.get_or_create(
        match=match,
        golfer=golfer_profile,
        defaults={'posizione': None, 'punti': 0},
    )


@transaction.atomic
def increment_stroke(score_id):
    """
    Increment strokes by 1 for a score. Port of aggiungiColpo().
    """
    from apps.matches.models import Score

    score = Score.objects.select_for_update().get(id=score_id)
    score.colpi_giocati = (score.colpi_giocati or 0) + 1
    score.save(update_fields=['colpi_giocati'])
    update_rankings(score.match_id)
    return score


@transaction.atomic
def decrement_stroke(score_id):
    """
    Decrement strokes by 1 for a score. Port of sottraiColpo().
    """
    from apps.matches.models import Score

    score = Score.objects.select_for_update().get(id=score_id)
    colpi = score.colpi_giocati or 0
    if colpi == 0:
        return score
    score.colpi_giocati = colpi - 1
    score.save(update_fields=['colpi_giocati'])
    update_rankings(score.match_id)
    return score


@transaction.atomic
def finish_match(match_id, golfer_profile):
    """
    Mark all scores for a golfer in a match as finished.
    Port of terminaMatch().
    """
    from apps.matches.models import Score

    updated = Score.objects.filter(
        match_id=match_id,
        golfer=golfer_profile,
    ).update(terminato=True)

    if updated:
        update_rankings(match_id)

    return updated > 0


def update_rankings(match_id):
    """
    Recalculate leaderboard positions based on total Stableford points.
    Port of aggiornaClassifica() from classifica.py.

    Golfers with the same total share the same position.
    """
    from apps.matches.models import Score, Ranking
    from django.db.models import Sum, Case, When, Value, IntegerField, F

    # Calculate total points per golfer using the Stableford formula
    # punti = CASE WHEN colpi_giocati=0 OR colpi_giocati IS NULL THEN 0
    #         WHEN (par_giocatore + 2 - colpi_giocati) <= 0 THEN 0
    #         ELSE (par_giocatore + 2 - colpi_giocati) END
    golfer_totals = (
        Score.objects.filter(match_id=match_id)
        .values('golfer_id')
        .annotate(
            tot_punti=Sum(
                Case(
                    When(colpi_giocati__isnull=True, then=Value(0)),
                    When(colpi_giocati=0, then=Value(0)),
                    When(
                        colpi_giocati__gt=F('par_giocatore') + 2,
                        then=Value(0),
                    ),
                    default=F('par_giocatore') + 2 - F('colpi_giocati'),
                    output_field=IntegerField(),
                )
            )
        )
        .order_by('-tot_punti')
    )

    # Build ranking with tie handling (same points = same position)
    points_to_position = {}
    position = 1
    for entry in golfer_totals:
        pts = entry['tot_punti'] or 0
        if pts not in points_to_position:
            points_to_position[pts] = position
        position += 1

    # Update rankings
    for entry in golfer_totals:
        pts = entry['tot_punti'] or 0
        Ranking.objects.update_or_create(
            match_id=match_id,
            golfer_id=entry['golfer_id'],
            defaults={
                'posizione': points_to_position[pts],
                'punti': pts,
            },
        )
