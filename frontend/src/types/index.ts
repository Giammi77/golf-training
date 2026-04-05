export interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  is_staff: boolean;
  golfer_profile: GolferProfile | null;
}

export interface GolferProfile {
  id: number;
  nr_tessera: string;
  hcp: number;
  img: string | null;
  nominativo: string;
}

export interface Club {
  id: number;
  ragione_sociale: string;
  indirizzo?: string;
  localita?: string;
  provincia?: string;
  email?: string;
  telefono?: string;
  www?: string;
  logo?: string | null;
  hcp_max?: number | null;
}

export interface Hole {
  id: number;
  nr_buca: number;
  denominazione: string;
  nr_colpi: number;
  distanza_t_rossi: number | null;
  distanza_t_gialli: number | null;
  hcp_buca: number | null;
}

export interface Match {
  id: number;
  club: number;
  club_name: string;
  data: string;
  nr_giro: number;
  caption: string;
}

export interface Score {
  id: number;
  nr_buca: number;
  denominazione: string;
  par_buca: number;
  colpi_giocati: number | null;
  colpi_aggiuntivi: number;
  par_giocatore: number;
  punti: number;
  terminato: boolean;
}

export interface Ranking {
  id: number;
  golfer_name: string;
  posizione: number | null;
  punti: number;
}

export interface HistoryMatch {
  id: number;
  club_name: string;
  data: string;
  nr_giro: number;
  punti: number;
  posizione: number | null;
  terminato: boolean;
}

export interface PointsTrend {
  data: string;
  nr_giro: number;
  punti: number;
  posizione: number;
}

export interface PointsDistribution {
  punti: number;
  frequenza: number;
}

export interface StatisticsSummary {
  total_matches: number;
  avg_points: number;
  max_points: number;
  avg_last_5: number;
}

export interface ParPerformance {
  par: number;
  avg_punti: number;
  num_buche: number;
}

export interface OfficialResult {
  id: number;
  data: string | null;
  tesserato: string;
  numero_tessera: string;
  gara: string;
  processo: string;
  motivazione_variazione: string;
  esecutore: string;
  giro: string;
  formula: string;
  buche: string;
  valida: string;
  playing_hcp: string;
  par: string;
  cr: string;
  sr: string;
  stbl: string;
  ags: string;
  pcc: string;
  sd: number | null;
  corr_sd: string;
  corr: string;
  index_vecchio: string;
  index_nuovo: string;
  variazione: string;
  row_count: number;
  row_style: 'best' | 'worst' | 'average' | null;
}

export interface ResultSummary {
  h_sd: number | null;
  l_sd: number | null;
  c_sd_avg: number | null;
}

export interface TokenPair {
  access: string;
  refresh: string;
}
