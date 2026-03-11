"""
Business logic for HCP official results.
Ported from GenroPy: th_result.py importaFile() and result.py formula columns.
"""
import math
import pandas as pd
from django.db import transaction


@transaction.atomic
def import_results_file(file_obj, user):
    """
    Import official HCP results from an HTML file.
    Port of importaFile() from th_result.py.

    Deletes existing results for the user and replaces with new data.
    """
    from .models import OfficialResult

    tables = pd.read_html(file_obj)
    df = tables[0]
    df = df.rename(columns=lambda x: x.lower().replace(' ', '_'))
    df['row_count'] = range(len(df), 0, -1)
    # Skip header row (first row after column names)
    df = df.iloc[1:]

    # Delete existing results for this user
    OfficialResult.objects.filter(user=user).delete()

    results = []
    for _, row in df.iterrows():
        data = {}
        for k, v in row.items():
            # Clean NaN values
            if isinstance(v, float) and math.isnan(v):
                v = None
            if isinstance(v, str) and v.lower() == 'nan':
                v = None
            data[k] = v

        results.append(OfficialResult(
            user=user,
            data=_parse_date(data.get('data')),
            tesserato=data.get('tesserato') or '',
            numero_tessera=data.get('numero_tessera') or '',
            gara=data.get('gara') or '',
            processo=data.get('processo') or '',
            motivazione_variazione=data.get('motivazione_variazione') or '',
            esecutore=data.get('esecutore') or '',
            giro=data.get('giro') or '',
            formula=data.get('formula') or '',
            buche=data.get('buche') or '',
            valida=data.get('valida') or '',
            playing_hcp=data.get('playing_hcp') or '',
            par=data.get('par') or '',
            cr=data.get('cr') or '',
            sr=data.get('sr') or '',
            stbl=data.get('stbl') or '',
            ags=data.get('ags') or '',
            pcc=data.get('pcc') or '',
            sd=_to_decimal(data.get('sd')),
            corr_sd=data.get('corr_sd') or '',
            corr=data.get('corr') or '',
            index_vecchio=data.get('index_vecchio') or '',
            index_nuovo=data.get('index_nuovo') or '',
            variazione=data.get('variazione') or '',
            row_count=data.get('row_count') or data.get('_row_count'),
        ))

    OfficialResult.objects.bulk_create(results)
    return len(results)


def calculate_best_8(user):
    """
    Calculate the best 8 SD averages from the last 20 results.
    Port of the for_average, h_sd, l_sd, c_sd_avg formula columns.

    Returns dict with: results (annotated), h_sd, l_sd, c_sd_avg, best_8_ids
    """
    from .models import OfficialResult

    all_results = list(
        OfficialResult.objects.filter(user=user)
        .exclude(sd__isnull=True)
        .order_by('-row_count')
    )

    if not all_results:
        return {
            'h_sd': None,
            'l_sd': None,
            'c_sd_avg': None,
            'best_8_ids': [],
        }

    # Get the row_max
    row_max = max(r.row_count for r in all_results if r.row_count)

    # Last 20 results (r_count > row_max - 20)
    last_20 = [r for r in all_results if r.row_count and r.row_count > row_max - 20]

    # Best 8 by SD (ascending = lowest SD first)
    best_8 = sorted(last_20, key=lambda r: float(r.sd))[:8]
    best_8_ids = {r.id for r in best_8}

    # Calculate aggregates from best 8
    best_8_sds = [float(r.sd) for r in best_8]
    h_sd = max(best_8_sds) if best_8_sds else None
    l_sd = min(best_8_sds) if best_8_sds else None
    c_sd_avg = sum(best_8_sds) / len(best_8_sds) if best_8_sds else None

    return {
        'h_sd': h_sd,
        'l_sd': l_sd,
        'c_sd_avg': round(c_sd_avg, 2) if c_sd_avg else None,
        'best_8_ids': best_8_ids,
    }


def _parse_date(value):
    """Parse a date string from various formats."""
    if value is None:
        return None
    if isinstance(value, str):
        import datetime
        for fmt in ('%d/%m/%Y', '%Y-%m-%d', '%d-%m-%Y'):
            try:
                return datetime.datetime.strptime(value[:10], fmt).date()
            except ValueError:
                continue
    return None


def _to_decimal(value):
    """Convert a value to Decimal, handling various formats."""
    if value is None:
        return None
    try:
        from decimal import Decimal
        if isinstance(value, str):
            value = value.replace(',', '.')
        return Decimal(str(value))
    except Exception:
        return None
