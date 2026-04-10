type Props = {
  open: boolean;
  onClose: () => void;
};

export default function InstallHelpModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white w-full sm:max-w-md rounded-t-xl sm:rounded-xl p-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-bold text-lg">📱 Installa Golf Training</h3>
          <button onClick={onClose} className="text-gray-500 text-2xl leading-none">
            ×
          </button>
        </div>

        <p className="text-sm text-gray-700 mb-4">
          Installa l'app sul telefono e usala come un'applicazione vera: icona
          sulla home, schermo intero, piu' veloce.
        </p>

        <h4 className="font-semibold text-golf-green mt-3 mb-1">🍎 iPhone / iPad (Safari)</h4>
        <ol className="list-decimal ml-5 text-sm space-y-1 text-gray-700">
          <li>Apri il sito in <strong>Safari</strong> (non Chrome)</li>
          <li>Tocca il pulsante <strong>Condividi</strong> in basso (⬆️)</li>
          <li>Scegli <strong>"Aggiungi a Home"</strong></li>
          <li>Conferma con <strong>Aggiungi</strong></li>
        </ol>

        <h4 className="font-semibold text-golf-green mt-4 mb-1">🤖 Android (Chrome)</h4>
        <ol className="list-decimal ml-5 text-sm space-y-1 text-gray-700">
          <li>Apri il sito in <strong>Chrome</strong></li>
          <li>
            Tocca il menu <strong>⋮</strong> in alto a destra
          </li>
          <li>
            Scegli <strong>"Installa app"</strong> o <strong>"Aggiungi a schermata Home"</strong>
          </li>
          <li>Conferma</li>
        </ol>

        <p className="text-xs text-gray-500 italic mt-4">
          Dopo l'installazione troverai l'icona di Golf Training nella schermata
          home del telefono.
        </p>

        <button
          onClick={onClose}
          className="w-full mt-4 bg-golf-green text-white py-2 rounded-lg font-semibold"
        >
          Ho capito
        </button>
      </div>
    </div>
  );
}
