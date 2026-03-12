import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getGolfers, resetGolferPassword } from '@/api/auth';
import type { User } from '@/types';

export default function AdminGolfersPage() {
  const { data: golfers, isLoading } = useQuery({
    queryKey: ['golfers'],
    queryFn: getGolfers,
  });

  const [feedback, setFeedback] = useState<{ id: number; type: 'success' | 'error'; text: string } | null>(null);

  const resetMutation = useMutation({
    mutationFn: (golferId: number) => resetGolferPassword(golferId),
    onSuccess: (data, golferId) => {
      setFeedback({ id: golferId, type: 'success', text: data.detail });
    },
    onError: (_err, golferId) => {
      setFeedback({ id: golferId, type: 'error', text: 'Errore nel reset della password.' });
    },
  });

  const handleReset = (golfer: User) => {
    const defaultPwd = (golfer.last_name + golfer.first_name).toLowerCase().replace(/\s/g, '');
    if (!window.confirm(
      `Resettare la password di ${golfer.first_name} ${golfer.last_name} a "${defaultPwd}"?`
    )) return;
    setFeedback(null);
    resetMutation.mutate(golfer.id);
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Gestione Giocatori</h2>

      {isLoading && <p className="text-sm text-gray-500">Caricamento...</p>}

      <div className="space-y-2">
        {golfers?.map((g) => (
          <div key={g.id} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">
                {g.last_name} {g.first_name}
              </div>
              <div className="text-xs text-gray-500">
                {g.golfer_profile?.nr_tessera && `Tessera: ${g.golfer_profile.nr_tessera} · `}
                HCP: {g.golfer_profile?.hcp ?? '-'}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={() => handleReset(g)}
                disabled={resetMutation.isPending}
                className="text-xs bg-red-500 text-white px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50"
              >
                Reset Password
              </button>
              {feedback?.id === g.id && (
                <span className={`text-xs ${feedback.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                  {feedback.text}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
