import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import {
  getPointsTrend, getPointsDistribution, getStatisticsSummary, getParPerformance,
} from '@/api/statistics';

type Tab = 'dashboard' | 'trend' | 'distribution' | 'par';

const STAT_INFO: Record<Tab, { title: string; description: string }> = {
  dashboard: {
    title: 'Dashboard',
    description:
      'Panoramica rapida delle tue performance complessive. "Media punti" e "Max punti" sono calcolati su tutti i match giocati. "Media ultimi 5" mostra la forma recente: se e\' piu\' alta della media generale significa che stai migliorando.',
  },
  trend: {
    title: 'Trend Punti',
    description:
      'Andamento dei punti Stableford totali negli ultimi 15 match, in ordine cronologico. Una linea che sale indica miglioramento. Usa questo grafico per vedere se il tuo gioco e\' costante o altalenante.',
  },
  distribution: {
    title: 'Distribuzione',
    description:
      'Quante volte hai fatto 0, 1, 2, 3, 4 punti per buca. In Stableford: 0 = doppio bogey o peggio, 1 = bogey, 2 = par, 3 = birdie, 4 = eagle. Piu\' buche a 2+ punti significa piu\' punti totali.',
  },
  par: {
    title: 'Performance per Par',
    description:
      'Media punti per tipo di buca: Par 3, Par 4, Par 5. Ti aiuta a capire dove sei piu\' forte. Se fai meno punti sui Par 3 devi lavorare sui ferri corti; sui Par 4 sui colpi di avvicinamento; sui Par 5 sul gioco lungo.',
  },
};

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [showInfo, setShowInfo] = useState(false);

  const { data: summary } = useQuery({
    queryKey: ['statistics-summary'],
    queryFn: getStatisticsSummary,
  });

  const { data: trend = [], isLoading: loadingTrend } = useQuery({
    queryKey: ['points-trend'],
    queryFn: () => getPointsTrend(15),
  });

  const { data: distribution = [], isLoading: loadingDist } = useQuery({
    queryKey: ['points-distribution'],
    queryFn: getPointsDistribution,
  });

  const { data: parPerf = [], isLoading: loadingPar } = useQuery({
    queryKey: ['par-performance'],
    queryFn: getParPerformance,
  });

  const info = STAT_INFO[activeTab];

  return (
    <div>
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <h2 className="text-lg font-semibold text-gray-700">Statistiche</h2>
        <button
          onClick={() => setShowInfo(true)}
          className="w-7 h-7 rounded-full bg-gray-200 text-gray-600 text-sm font-bold hover:bg-gray-300"
          title="Come interpretare"
        >
          ?
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b mx-4 overflow-x-auto">
        {(['dashboard', 'trend', 'distribution', 'par'] as Tab[]).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`flex-shrink-0 px-3 py-2 text-xs font-semibold border-b-2 transition ${
              activeTab === t
                ? 'border-golf-green text-golf-green'
                : 'border-transparent text-gray-500'
            }`}
          >
            {STAT_INFO[t].title}
          </button>
        ))}
      </div>

      <div className="p-4">
        {activeTab === 'dashboard' && (
          summary ? (
            <div className="grid grid-cols-2 gap-3">
              <Card label="Match giocati" value={summary.total_matches} color="text-gray-800" />
              <Card label="Max punti" value={summary.max_points} color="text-golf-green" />
              <Card label="Media punti" value={summary.avg_points} color="text-blue-600" />
              <Card label="Media ultimi 5" value={summary.avg_last_5} color="text-orange-500" />
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">Caricamento...</div>
          )
        )}

        {activeTab === 'trend' && (
          loadingTrend ? (
            <div className="text-center text-gray-500 py-8">Caricamento...</div>
          ) : trend.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Nessun dato disponibile</div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-4">Punti degli ultimi 15 match</p>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={trend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="data"
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                  />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="punti"
                    stroke="#2d5016"
                    strokeWidth={2}
                    dot={{ fill: '#2d5016', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )
        )}

        {activeTab === 'distribution' && (
          loadingDist ? (
            <div className="text-center text-gray-500 py-8">Caricamento...</div>
          ) : distribution.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Nessun dato disponibile</div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-4">Frequenza punteggi per buca</p>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={distribution}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="punti" tick={{ fontSize: 12 }} label={{ value: 'Punti', position: 'bottom' }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="frequenza" fill="#4a7c2e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )
        )}

        {activeTab === 'par' && (
          loadingPar ? (
            <div className="text-center text-gray-500 py-8">Caricamento...</div>
          ) : parPerf.length === 0 ? (
            <div className="text-center text-gray-500 py-8">Nessun dato disponibile</div>
          ) : (
            <div>
              <p className="text-sm text-gray-500 mb-4">Media punti per tipo di buca</p>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={parPerf}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="par"
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `Par ${v}`}
                  />
                  <YAxis tick={{ fontSize: 12 }} domain={[0, 4]} />
                  <Tooltip formatter={(v: number) => v.toFixed(2)} labelFormatter={(v) => `Par ${v}`} />
                  <Bar dataKey="avg_punti" fill="#2d5016" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 space-y-2">
                {parPerf.map((p) => (
                  <div key={p.par} className="flex justify-between text-sm border-b pb-1">
                    <span className="font-semibold">Par {p.par}</span>
                    <span className="text-gray-600">{p.num_buche} buche</span>
                    <span className="text-golf-green font-bold">{p.avg_punti} pt/buca</span>
                  </div>
                ))}
              </div>
            </div>
          )
        )}
      </div>

      {/* Info modal */}
      {showInfo && (
        <div
          className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
          onClick={() => setShowInfo(false)}
        >
          <div
            className="bg-white w-full sm:max-w-md rounded-t-xl sm:rounded-xl p-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-lg">{info.title}</h3>
              <button
                onClick={() => setShowInfo(false)}
                className="text-gray-500 text-xl leading-none"
              >
                ×
              </button>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{info.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function Card({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="bg-white border rounded-lg p-3 shadow-sm">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
    </div>
  );
}
