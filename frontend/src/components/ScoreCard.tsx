import type { Score } from '@/types';

interface ScoreCardProps {
  scores: Score[];
  onIncrement: (scoreId: number) => void;
  onDecrement: (scoreId: number) => void;
  disabled?: boolean;
}

export default function ScoreCard({ scores, onIncrement, onDecrement, disabled }: ScoreCardProps) {
  const totalPunti = scores.reduce((sum, s) => sum + s.punti, 0);

  return (
    <div>
      {/* Total */}
      <div className="bg-golf-green text-white px-4 py-3 flex justify-between items-center sticky top-0 z-5">
        <span className="font-semibold">Totale Punti</span>
        <span className="text-2xl font-bold">{totalPunti}</span>
      </div>

      {/* Holes */}
      <div className="divide-y divide-gray-100">
        {scores.map((score) => (
          <div key={score.id} className="flex items-center px-4 py-3 gap-3">
            {/* Hole info */}
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-sm">
                Buca {score.nr_buca}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {score.denominazione} | Par {score.par_buca} | HCP +{score.colpi_aggiuntivi}
              </div>
            </div>

            {/* Stroke controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onDecrement(score.id)}
                disabled={disabled || !score.colpi_giocati}
                className="w-10 h-10 rounded-full bg-red-100 text-red-600 font-bold text-xl
                           flex items-center justify-center disabled:opacity-30 active:bg-red-200"
              >
                -
              </button>
              <div className="w-10 text-center">
                <div className="text-lg font-bold">
                  {score.colpi_giocati ?? '-'}
                </div>
              </div>
              <button
                onClick={() => onIncrement(score.id)}
                disabled={disabled}
                className="w-10 h-10 rounded-full bg-green-100 text-green-600 font-bold text-xl
                           flex items-center justify-center disabled:opacity-30 active:bg-green-200"
              >
                +
              </button>
            </div>

            {/* Points */}
            <div className="w-10 text-center">
              <div className={`text-lg font-bold ${score.punti > 0 ? 'text-golf-green' : 'text-gray-400'}`}>
                {score.punti}
              </div>
              <div className="text-[10px] text-gray-400">pti</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
