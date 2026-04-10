import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { confirmPasswordReset } from '@/api/auth';

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== confirm) {
      setError('Le password non coincidono.');
      return;
    }
    if (!token) {
      setError('Token mancante.');
      return;
    }

    setLoading(true);
    try {
      await confirmPasswordReset(token, password);
      setDone(true);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { token?: string[]; detail?: string } } })
          ?.response?.data?.token?.[0] ??
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Errore durante il reset.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-golf-green p-4">
        <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6 text-center">
          <h1 className="text-xl font-bold text-golf-green mb-2">Password aggiornata ✓</h1>
          <p className="text-sm text-gray-600 mb-4">
            Ora puoi accedere con la tua nuova password.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full bg-golf-green text-white py-2.5 rounded-lg font-semibold"
          >
            Vai al login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-golf-green p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-6">
        <div className="text-center mb-5">
          <h1 className="text-xl font-bold text-golf-green">Reset password</h1>
          <p className="text-gray-500 text-xs mt-1">Scegli una nuova password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            placeholder="Nuova password (min. 6 caratteri)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete="new-password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />
          <input
            type="password"
            placeholder="Conferma password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
          />

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-golf-green text-white py-2.5 rounded-lg font-semibold disabled:opacity-50"
          >
            {loading ? 'Aggiornamento...' : 'Imposta nuova password'}
          </button>
        </form>
      </div>
    </div>
  );
}
