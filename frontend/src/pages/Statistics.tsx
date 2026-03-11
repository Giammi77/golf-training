import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar,
} from 'recharts';
import { getPointsTrend, getPointsDistribution } from '@/api/statistics';

type Tab = 'trend' | 'distribution';

export default function StatisticsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('trend');

  const { data: trend = [], isLoading: loadingTrend } = useQuery({
    queryKey: ['points-trend'],
    queryFn: () => getPointsTrend(15),
  });

  const { data: distribution = [], isLoading: loadingDist } = useQuery({
    queryKey: ['points-distribution'],
    queryFn: getPointsDistribution,
  });

  return (
    <div>
      <h2 className="px-4 pt-4 pb-2 text-lg font-semibold text-gray-700">Statistiche</h2>

      {/* Tabs */}
      <div className="flex border-b mx-4">
        <button
          onClick={() => setActiveTab('trend')}
          className={`flex-1 py-2 text-sm font-semibold border-b-2 transition ${
            activeTab === 'trend'
              ? 'border-golf-green text-golf-green'
              : 'border-transparent text-gray-500'
          }`}
        >
          Trend Punti
        </button>
        <button
          onClick={() => setActiveTab('distribution')}
          className={`flex-1 py-2 text-sm font-semibold border-b-2 transition ${
            activeTab === 'distribution'
              ? 'border-golf-green text-golf-green'
              : 'border-transparent text-gray-500'
          }`}
        >
          Distribuzione
        </button>
      </div>

      <div className="p-4">
        {activeTab === 'trend' ? (
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
        ) : loadingDist ? (
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
        )}
      </div>
    </div>
  );
}
