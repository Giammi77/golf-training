import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getResults, importResults, getResultSummary } from '@/api/results';
import type { OfficialResult } from '@/types';

type Section = 'all' | 'last20' | 'best8';

export default function ResultsPage() {
  const [section, setSection] = useState<Section>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: results = [], isLoading } = useQuery({
    queryKey: ['results', section],
    queryFn: () => getResults(section),
  });

  const { data: summary } = useQuery({
    queryKey: ['result-summary'],
    queryFn: getResultSummary,
  });

  const importMutation = useMutation({
    mutationFn: (file: File) => importResults(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['results'] });
      queryClient.invalidateQueries({ queryKey: ['result-summary'] });
    },
  });

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      importMutation.mutate(file);
    }
  };

  const rowBgClass = (result: OfficialResult) => {
    switch (result.row_style) {
      case 'best': return 'bg-green-100';
      case 'worst': return 'bg-red-100';
      case 'average': return 'font-bold';
      default: return '';
    }
  };

  return (
    <div>
      <h2 className="px-4 pt-4 pb-2 text-lg font-semibold text-gray-700">Risultati HCP</h2>

      {/* Summary card */}
      {summary && (
        <div className="mx-4 mb-3 bg-gray-50 rounded-lg p-3 flex justify-around text-center">
          <div>
            <div className="text-xs text-gray-500">SD Min</div>
            <div className="font-bold text-green-600">{summary.l_sd ?? '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">SD Max</div>
            <div className="font-bold text-red-500">{summary.h_sd ?? '-'}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500">SD Media (8)</div>
            <div className="font-bold text-golf-green">{summary.c_sd_avg ?? '-'}</div>
          </div>
        </div>
      )}

      {/* Section tabs */}
      <div className="flex border-b mx-4">
        {([
          { key: 'all', label: 'Tutti' },
          { key: 'last20', label: 'Ultimi 20' },
          { key: 'best8', label: 'Best 8' },
        ] as const).map((tab) => (
          <button
            key={tab.key}
            onClick={() => setSection(tab.key)}
            className={`flex-1 py-2 text-sm font-semibold border-b-2 transition ${
              section === tab.key
                ? 'border-golf-green text-golf-green'
                : 'border-transparent text-gray-500'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results list */}
      {isLoading ? (
        <div className="text-center text-gray-500 py-8">Caricamento...</div>
      ) : results.length === 0 ? (
        <div className="text-center text-gray-500 py-8">Nessun risultato</div>
      ) : (
        <div className="divide-y text-sm">
          {results.map((result: OfficialResult) => (
            <div key={result.id} className={`px-4 py-2.5 ${rowBgClass(result)}`}>
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-xs">{result.data}</div>
                  <div className="text-xs text-gray-600 truncate">{result.gara}</div>
                </div>
                <div className="text-right ml-2">
                  <div className="text-xs">SD: <span className="font-bold">{result.sd ?? '-'}</span></div>
                  <div className="text-xs text-gray-500">
                    {result.index_vecchio} &rarr; {result.index_nuovo}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-1 text-[10px] text-gray-500">
                <span>STBL: {result.stbl}</span>
                <span>Par: {result.par}</span>
                <span>CR: {result.cr}</span>
                <span>SR: {result.sr}</span>
                <span>Var: {result.variazione}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Import button */}
      <div className="p-4">
        <input
          ref={fileInputRef}
          type="file"
          accept=".html,.htm,.xls,.xlsx"
          onChange={handleFileSelect}
          className="hidden"
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={importMutation.isPending}
          className="w-full bg-golf-green text-white py-2.5 rounded-lg font-semibold text-sm
                     disabled:opacity-50"
        >
          {importMutation.isPending ? 'Importazione...' : 'Importa Risultati'}
        </button>
        {importMutation.isSuccess && (
          <p className="text-green-600 text-sm text-center mt-2">
            {importMutation.data?.message}
          </p>
        )}
        {importMutation.isError && (
          <p className="text-red-500 text-sm text-center mt-2">Errore nell'importazione</p>
        )}
      </div>
    </div>
  );
}
