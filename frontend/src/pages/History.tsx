import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHistoryMatches, getHistoryScores, deleteHistoryMatch } from '@/api/statistics';
import { useAuthStore } from '@/store/authStore';
import type { HistoryMatch, Score } from '@/types';

export default function HistoryPage() {
  const [selectedMatch, setSelectedMatch] = useState<HistoryMatch | null>(null);
  const clubId = useAuthStore((s) => s.clubId);
  const queryClient = useQueryClient();

  const { data: matches = [], isLoading } = useQuery({
    queryKey: ['history-matches', clubId],
    queryFn: () => getHistoryMatches(clubId),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteHistoryMatch,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history-matches'] });
    },
  });

  const handleDelete = (e: React.MouseEvent, matchId: number) => {
    e.stopPropagation();
    if (confirm('Sei sicuro di voler eliminare questo match dallo storico?')) {
      deleteMutation.mutate(matchId);
    }
  };

  const { data: scores = [] } = useQuery({
    queryKey: ['history-scores', selectedMatch?.id],
    queryFn: () => getHistoryScores(selectedMatch!.id),
    enabled: !!selectedMatch,
  });

  if (isLoading) {
    return <div className="p-4 text-center text-gray-500">Caricamento...</div>;
  }

  // Score detail view
  if (selectedMatch) {
    const totalPunti = scores.reduce((sum: number, s: Score) => sum + s.punti, 0);
    return (
      <div>
        <div className="bg-gray-50 px-4 py-3 flex items-center gap-3 border-b">
          <button
            onClick={() => setSelectedMatch(null)}
            className="text-golf-green font-semibold"
          >
            &larr; Indietro
          </button>
          <span className="text-sm text-gray-600">
            {selectedMatch.data} - Giro {selectedMatch.nr_giro}
          </span>
        </div>

        <div className="bg-golf-green text-white px-4 py-3 flex justify-between">
          <span>Totale Punti</span>
          <span className="text-xl font-bold">{totalPunti}</span>
        </div>

        <div className="divide-y">
          {scores.map((score: Score) => (
            <div key={score.id} className="flex items-center px-4 py-2.5 text-sm">
              <div className="flex-1">
                <span className="font-semibold">Buca {score.nr_buca}</span>
                <span className="text-gray-500 ml-2">{score.denominazione}</span>
              </div>
              <div className="w-16 text-center text-gray-600">
                {score.colpi_giocati ?? '-'} colpi
              </div>
              <div className={`w-12 text-right font-bold ${score.punti > 0 ? 'text-golf-green' : 'text-gray-400'}`}>
                {score.punti} pt
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Match list
  return (
    <div>
      <h2 className="px-4 pt-4 pb-2 text-lg font-semibold text-gray-700">Storico Match</h2>
      {matches.length === 0 ? (
        <p className="text-center text-gray-500 py-8">Nessun match giocato</p>
      ) : (
        <div className="divide-y">
          {matches.map((match: HistoryMatch) => (
            <div
              key={match.id}
              onClick={() => setSelectedMatch(match)}
              className="w-full flex items-center px-4 py-3 hover:bg-gray-50 text-left cursor-pointer"
            >
              <div className="flex-1">
                <div className="font-semibold text-sm">{match.data} - Giro {match.nr_giro}</div>
                <div className="text-xs text-gray-500">{match.club_name}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-golf-green">{match.punti} pt</div>
                <div className="text-xs text-gray-500">Pos. {match.posizione ?? '-'}</div>
              </div>
              <button
                onClick={(e) => handleDelete(e, match.id)}
                className="ml-3 p-2 text-red-500 hover:bg-red-50 rounded"
                title="Elimina match"
                disabled={deleteMutation.isPending}
              >
                🗑
              </button>
              <div className="ml-2 text-gray-400">&rsaquo;</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
