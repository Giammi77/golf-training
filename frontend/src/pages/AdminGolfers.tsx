import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { getGolfers, generateResetLink } from '@/api/auth';
import type { User } from '@/types';

export default function AdminGolfersPage() {
  const { data: golfers, isLoading } = useQuery({
    queryKey: ['golfers'],
    queryFn: getGolfers,
  });

  const [feedback, setFeedback] = useState<{ id: number; type: 'success' | 'error'; text: string } | null>(null);

  const resetLinkMutation = useMutation({
    mutationFn: (golferId: number) => generateResetLink(golferId),
    onSuccess: async (data, golferId) => {
      const link = `${window.location.origin}/reset-password/${data.token}`;
      const message = `Ciao ${data.full_name}, ecco il link per impostare la tua nuova password su Golf Training (valido 24h):\n\n${link}`;
      if (navigator.share) {
        try {
          await navigator.share({ title: 'Reset password', text: message, url: link });
          setFeedback({ id: golferId, type: 'success', text: 'Link condiviso.' });
          return;
        } catch {
          /* fall through to clipboard */
        }
      }
      try {
        await navigator.clipboard.writeText(message);
        setFeedback({ id: golferId, type: 'success', text: 'Link copiato negli appunti.' });
      } catch {
        window.prompt('Copia il link:', link);
        setFeedback({ id: golferId, type: 'success', text: 'Link generato.' });
      }
    },
    onError: (_err, golferId) => {
      setFeedback({ id: golferId, type: 'error', text: 'Errore generazione link.' });
    },
  });

  const handleGenerateResetLink = (golfer: User) => {
    setFeedback(null);
    resetLinkMutation.mutate(golfer.id);
  };

  const [inviteCopied, setInviteCopied] = useState(false);

  const buildInviteMessage = () => {
    const link = `${window.location.origin}/register`;
    return `🏌️ Ti invito su Golf Training!

E' l'app che trasforma i tuoi allenamenti al circolo in piccole gare quotidiane: ogni giro diventa un match con classifica Stableford, sfidando gli altri golfisti della giornata.

✅ Registra i tuoi colpi buca per buca
✅ Classifica in tempo reale con gli altri soci
✅ Storico dei match e statistiche sulle tue performance
✅ Gratis, senza pubblicita', installabile come app

Iscriviti qui 👉 ${link}`;
  };

  const copyInviteLink = async () => {
    const message = buildInviteMessage();
    try {
      await navigator.clipboard.writeText(message);
      setInviteCopied(true);
      setTimeout(() => setInviteCopied(false), 2500);
    } catch {
      window.prompt('Copia il messaggio:', message);
    }
  };

  const shareInvite = async () => {
    const link = `${window.location.origin}/register`;
    const message = buildInviteMessage();
    if (navigator.share) {
      try {
        await navigator.share({ title: 'Golf Training', text: message, url: link });
      } catch {
        /* user cancelled */
      }
    } else {
      copyInviteLink();
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold text-gray-700 mb-4">Gestione Giocatori</h2>

      <div className="bg-golf-green/10 border border-golf-green/30 rounded-xl p-3 mb-4">
        <div className="text-sm font-semibold text-golf-green mb-1">Invita nuovi golfisti</div>
        <p className="text-xs text-gray-600 mb-2">
          Condividi il link: i nuovi giocatori potranno registrarsi e installare l'app.
        </p>
        <div className="flex gap-2">
          <button
            onClick={shareInvite}
            className="flex-1 bg-golf-green text-white text-xs py-2 rounded-lg font-semibold"
          >
            📤 Condividi invito
          </button>
          <button
            onClick={copyInviteLink}
            className="flex-1 bg-white border border-golf-green text-golf-green text-xs py-2 rounded-lg font-semibold"
          >
            {inviteCopied ? '✓ Copiato!' : '📋 Copia link'}
          </button>
        </div>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Caricamento...</p>}

      <div className="space-y-2">
        {golfers?.map((g) => (
          <div key={g.id} className="bg-gray-50 rounded-xl p-3 flex items-center justify-between">
            <div>
              <div className="font-semibold text-sm">
                {g.last_name} {g.first_name}
              </div>
              <div className="text-xs text-gray-500">
                @{g.username}
                {g.golfer_profile?.nr_tessera && ` · Tessera: ${g.golfer_profile.nr_tessera}`}
                {' · '}HCP: {g.golfer_profile?.hcp ?? '-'}
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <button
                onClick={() => handleGenerateResetLink(g)}
                disabled={resetLinkMutation.isPending}
                className="text-xs bg-blue-500 text-white px-3 py-1.5 rounded-lg font-semibold disabled:opacity-50"
                title="Genera e condividi link reset password (valido 24h)"
              >
                🔗 Link reset password
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
