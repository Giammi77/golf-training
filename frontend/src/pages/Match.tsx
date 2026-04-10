import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { registerMatch, getMatchScores, getLeaderboard } from '@/api/matches';
import { incrementStroke, decrementStroke, finishMatch } from '@/api/scores';
import ScoreCard from '@/components/ScoreCard';
import LeaderboardTable from '@/components/LeaderboardTable';
import type { Match as MatchType, Score } from '@/types';

type Tab = 'score' | 'classifica';

export default function MatchPage() {
  const clubId = useAuthStore((s) => s.clubId);
  const queryClient = useQueryClient();
  const [activeMatch, setActiveMatch] = useState<MatchType | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('score');

  // Register match mutation
  const registerMutation = useMutation({
    mutationFn: () => registerMatch(clubId!),
    onSuccess: (data) => {
      setActiveMatch(data.match);
      queryClient.setQueryData(['scores', data.match.id], data.scores);
    },
  });

  // Scores query
  const { data: scores = [] } = useQuery({
    queryKey: ['scores', activeMatch?.id],
    queryFn: () => getMatchScores(activeMatch!.id),
    enabled: !!activeMatch,
    refetchInterval: 15_000,
  });

  // Leaderboard query
  const { data: rankings = [] } = useQuery({
    queryKey: ['leaderboard', activeMatch?.id],
    queryFn: () => getLeaderboard(activeMatch!.id),
    enabled: !!activeMatch,
    refetchInterval: 10_000,
  });

  // Increment/decrement mutations with optimistic updates
  const incrementMutation = useMutation({
    mutationFn: incrementStroke,
    onMutate: async (scoreId) => {
      await queryClient.cancelQueries({ queryKey: ['scores', activeMatch?.id] });
      const previous = queryClient.getQueryData<Score[]>(['scores', activeMatch?.id]);
      queryClient.setQueryData<Score[]>(['scores', activeMatch?.id], (old) =>
        old?.map((s) =>
          s.id === scoreId
            ? { ...s, colpi_giocati: (s.colpi_giocati ?? 0) + 1 }
            : s
        )
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(['scores', activeMatch?.id], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', activeMatch?.id] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard', activeMatch?.id] });
    },
  });

  const decrementMutation = useMutation({
    mutationFn: decrementStroke,
    onMutate: async (scoreId) => {
      await queryClient.cancelQueries({ queryKey: ['scores', activeMatch?.id] });
      const previous = queryClient.getQueryData<Score[]>(['scores', activeMatch?.id]);
      queryClient.setQueryData<Score[]>(['scores', activeMatch?.id], (old) =>
        old?.map((s) =>
          s.id === scoreId && (s.colpi_giocati ?? 0) > 0
            ? { ...s, colpi_giocati: (s.colpi_giocati ?? 0) - 1 }
            : s
        )
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      queryClient.setQueryData(['scores', activeMatch?.id], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', activeMatch?.id] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard', activeMatch?.id] });
    },
  });

  // Finish match mutation
  const finishMutation = useMutation({
    mutationFn: () => finishMatch(activeMatch!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', activeMatch?.id] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard', activeMatch?.id] });
      queryClient.invalidateQueries({ queryKey: ['history-matches'] });
      queryClient.invalidateQueries({ queryKey: ['statistics-summary'] });
      queryClient.invalidateQueries({ queryKey: ['points-trend'] });
      queryClient.invalidateQueries({ queryKey: ['points-distribution'] });
      queryClient.invalidateQueries({ queryKey: ['par-performance'] });
    },
  });

  const isFinished = scores.length > 0 && scores.every((s) => s.terminato);

  // No match yet - show register button
  if (!activeMatch) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 gap-4">
        <div className="text-6xl">⛳</div>
        <h2 className="text-xl font-semibold text-gray-700">Pronto a giocare?</h2>
        <p className="text-gray-500 text-center text-sm">
          Registra il tuo match per iniziare a segnare i colpi
        </p>
        <button
          onClick={() => registerMutation.mutate()}
          disabled={registerMutation.isPending}
          className="bg-golf-green text-white px-8 py-3 rounded-xl font-semibold text-lg
                     hover:bg-golf-dark transition disabled:opacity-50 mt-4"
        >
          {registerMutation.isPending ? 'Registrazione...' : 'Registra Match'}
        </button>
        {registerMutation.isError && (
          <p className="text-red-500 text-sm">Errore nella registrazione</p>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Match info */}
      <div className="bg-gray-50 px-4 py-2 flex justify-between items-center text-sm border-b">
        <span className="text-gray-600">{activeMatch.caption}</span>
        <span className={`font-semibold ${isFinished ? 'text-green-600' : 'text-orange-500'}`}>
          {isFinished ? 'TERMINATO' : 'IN CORSO'}
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        <button
          onClick={() => setActiveTab('score')}
          className={`flex-1 py-2.5 text-sm font-semibold text-center border-b-2 transition ${
            activeTab === 'score'
              ? 'border-golf-green text-golf-green'
              : 'border-transparent text-gray-500'
          }`}
        >
          Score
        </button>
        <button
          onClick={() => setActiveTab('classifica')}
          className={`flex-1 py-2.5 text-sm font-semibold text-center border-b-2 transition ${
            activeTab === 'classifica'
              ? 'border-golf-green text-golf-green'
              : 'border-transparent text-gray-500'
          }`}
        >
          Classifica
        </button>
      </div>

      {/* Tab content */}
      {activeTab === 'score' ? (
        <div>
          <ScoreCard
            scores={scores}
            onIncrement={(id) => incrementMutation.mutate(id)}
            onDecrement={(id) => decrementMutation.mutate(id)}
            disabled={isFinished}
          />
          {!isFinished && scores.length > 0 && (
            <div className="p-4">
              <button
                onClick={() => {
                  if (window.confirm('Terminare il match? Non potrai più modificare i colpi.')) {
                    finishMutation.mutate();
                  }
                }}
                disabled={finishMutation.isPending}
                className="w-full bg-orange-500 text-white py-3 rounded-xl font-semibold
                           hover:bg-orange-600 transition disabled:opacity-50"
              >
                {finishMutation.isPending ? 'Terminando...' : 'Termina Match'}
              </button>
            </div>
          )}
        </div>
      ) : (
        <LeaderboardTable rankings={rankings} />
      )}
    </div>
  );
}
