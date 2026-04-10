import { useRegisterSW } from 'virtual:pwa-register/react';

export default function UpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisterError(error) {
      console.error('SW registration error', error);
    },
  });

  if (!needRefresh) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 mx-auto max-w-lg px-4 z-50">
      <div className="bg-golf-green text-white rounded-lg shadow-lg p-4 flex items-center justify-between gap-3">
        <div className="text-sm">
          <div className="font-semibold">Nuova versione disponibile</div>
          <div className="text-xs opacity-90">Aggiorna per vedere le ultime novita'.</div>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={() => setNeedRefresh(false)}
            className="text-xs px-3 py-1.5 rounded bg-white/10 hover:bg-white/20"
          >
            Dopo
          </button>
          <button
            onClick={() => updateServiceWorker(true)}
            className="text-xs px-3 py-1.5 rounded bg-white text-golf-green font-semibold"
          >
            Aggiorna
          </button>
        </div>
      </div>
    </div>
  );
}
